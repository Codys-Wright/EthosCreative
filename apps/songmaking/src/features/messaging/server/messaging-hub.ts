/**
 * Course Messaging Hub
 *
 * A singleton hub that manages all SSE connections for course messaging.
 * Supports:
 * - Course-wide announcement channel (instructor-only posting)
 * - General discussion channel (all students can post)
 * - Direct messages between course participants
 */

// =============================================================================
// Types
// =============================================================================

export interface ChatUser {
  id: string;
  name: string;
  username: string;
  /** User's profile image URL from Better Auth, or null/undefined for initials fallback */
  image?: string | null;
  status?: "online" | "offline" | "away";
  role?: "instructor" | "student";
}

export interface ChatRoom {
  id: string;
  name: string;
  type: "channel" | "dm" | "announcement";
  /** For DMs, the two participant user IDs */
  participants?: [string, string];
  lastActivity?: number;
  /** For announcement channels, only instructors can post */
  restricted?: boolean;
}

export interface ChatMessage {
  _tag: "ChatMessage";
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: number;
}

export interface UserTyping {
  _tag: "UserTyping";
  roomId: string;
  userId: string;
  isTyping: boolean;
}

export interface UserJoined {
  _tag: "UserJoined";
  roomId: string;
  userId: string;
  timestamp: number;
}

export interface UserLeft {
  _tag: "UserLeft";
  roomId: string;
  userId: string;
  timestamp: number;
}

export interface Connected {
  _tag: "Connected";
  connectionId: string;
  userId: string;
  timestamp: number;
}

export interface UsersInfo {
  _tag: "UsersInfo";
  users: ChatUser[];
}

export interface RoomsInfo {
  _tag: "RoomsInfo";
  rooms: ChatRoom[];
}

export interface SystemMessage {
  _tag: "SystemMessage";
  id: string;
  roomId: string;
  content: string;
  timestamp: number;
}

export type ChatEvent =
  | ChatMessage
  | UserTyping
  | UserJoined
  | UserLeft
  | Connected
  | UsersInfo
  | RoomsInfo
  | SystemMessage;

// =============================================================================
// Course Channels
// =============================================================================

/** Default course channels */
export const COURSE_CHANNELS: ChatRoom[] = [
  {
    id: "announcements",
    name: "Announcements",
    type: "announcement",
    restricted: true, // Only instructors can post
  },
  {
    id: "general",
    name: "General Discussion",
    type: "channel",
  },
];

// =============================================================================
// Helpers
// =============================================================================

/**
 * Generate a consistent DM room ID for two users.
 * Sorts user IDs to ensure the same room ID regardless of who initiates.
 */
export const getDmRoomId = (userId1: string, userId2: string): string => {
  const sorted = [userId1, userId2].sort();
  return `dm:${sorted[0]}:${sorted[1]}`;
};

/**
 * Parse a DM room ID to get the two participant IDs
 */
export const parseDmRoomId = (roomId: string): [string, string] | null => {
  if (!roomId.startsWith("dm:")) return null;
  const parts = roomId.split(":");
  if (parts.length !== 3) return null;
  return [parts[1], parts[2]];
};

/**
 * Check if a user is a participant in a DM room
 */
export const isUserInDmRoom = (roomId: string, userId: string): boolean => {
  const participants = parseDmRoomId(roomId);
  if (!participants) return false;
  return participants.includes(userId);
};

/**
 * Check if a room ID is a DM room
 */
export const isDmRoom = (roomId: string): boolean => {
  return roomId.startsWith("dm:");
};

// =============================================================================
// Messaging Hub Singleton
// =============================================================================

type ConnectionCallback = (event: ChatEvent) => void;

interface Connection {
  id: string;
  callback: ConnectionCallback;
  userId: string;
}

class MessagingHub {
  private connections = new Map<string, Connection>();
  private channelMessageHistory = new Map<string, ChatMessage[]>(); // channel ID -> messages
  private dmMessageHistory = new Map<string, ChatMessage[]>(); // DM room ID -> messages
  private dmRooms = new Map<string, ChatRoom>(); // Track active DM rooms
  private connectedUsers = new Map<string, ChatUser>(); // userId -> user info

  constructor() {
    // Initialize empty message history for each channel
    for (const channel of COURSE_CHANNELS) {
      this.channelMessageHistory.set(channel.id, []);
    }
  }

  /**
   * Register a new connection
   */
  register(
    connectionId: string,
    userId: string,
    callback: ConnectionCallback,
    userInfo?: Partial<ChatUser>
  ): void {
    this.connections.set(connectionId, { id: connectionId, callback, userId });

    // Track connected user with provided info or generate defaults
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, {
        id: userId,
        name: userInfo?.name ?? `User ${userId.slice(-4)}`,
        username: userInfo?.username ?? userId,
        image: userInfo?.image ?? null,
        status: "online",
        role: userInfo?.role ?? "student",
      });
    } else {
      // Update status to online
      const user = this.connectedUsers.get(userId)!;
      user.status = "online";
      if (userInfo?.name) user.name = userInfo.name;
      if (userInfo?.image !== undefined) user.image = userInfo.image;
      if (userInfo?.role) user.role = userInfo.role;
    }

    console.log(
      `[MessagingHub] Connection registered: ${connectionId} (${this.connections.size} total)`
    );

    // Send connection event
    callback({
      _tag: "Connected",
      connectionId,
      userId,
      timestamp: Date.now(),
    });

    // Send all course participants
    callback({
      _tag: "UsersInfo",
      users: this.getAllUsers(),
    });

    // Send available rooms (channels + user's DMs)
    callback({
      _tag: "RoomsInfo",
      rooms: this.getRoomsForUser(userId),
    });

    // Send channel message history
    for (const [_channelId, messages] of this.channelMessageHistory) {
      for (const msg of messages) {
        callback(msg);
      }
    }

    // Send DM message history for this user
    for (const [roomId, messages] of this.dmMessageHistory) {
      if (isUserInDmRoom(roomId, userId)) {
        for (const msg of messages) {
          callback(msg);
        }
      }
    }

    // Broadcast user joined to general channel
    this.broadcast({
      _tag: "UserJoined",
      roomId: "general",
      userId,
      timestamp: Date.now(),
    });
  }

  /**
   * Get all connected users
   */
  private getAllUsers(): ChatUser[] {
    return Array.from(this.connectedUsers.values());
  }

  /**
   * Get rooms available to a user (channels + their DMs)
   */
  private getRoomsForUser(userId: string): ChatRoom[] {
    const rooms: ChatRoom[] = [...COURSE_CHANNELS];
    // Add DM rooms this user is part of
    for (const [roomId, room] of this.dmRooms) {
      if (isUserInDmRoom(roomId, userId)) {
        rooms.push(room);
      }
    }
    return rooms;
  }

  /**
   * Unregister a connection
   */
  unregister(connectionId: string): void {
    const conn = this.connections.get(connectionId);
    if (conn) {
      this.connections.delete(connectionId);

      // Check if user still has other connections
      let userStillConnected = false;
      for (const c of this.connections.values()) {
        if (c.userId === conn.userId) {
          userStillConnected = true;
          break;
        }
      }

      if (!userStillConnected) {
        // Update user status to offline but keep in list
        const user = this.connectedUsers.get(conn.userId);
        if (user) {
          user.status = "offline";
        }
        this.broadcast({
          _tag: "UserLeft",
          roomId: "general",
          userId: conn.userId,
          timestamp: Date.now(),
        });
      }

      console.log(
        `[MessagingHub] Connection unregistered: ${connectionId} (${this.connections.size} total)`
      );
    }
  }

  /**
   * Broadcast an event to all connections
   */
  broadcast(event: ChatEvent): void {
    for (const conn of this.connections.values()) {
      try {
        conn.callback(event);
      } catch (err) {
        console.error(`[MessagingHub] Error sending to ${conn.id}:`, err);
      }
    }
  }

  /**
   * Send to specific users only (for DMs)
   */
  private sendToUsers(userIds: string[], event: ChatEvent): void {
    for (const conn of this.connections.values()) {
      if (userIds.includes(conn.userId)) {
        try {
          conn.callback(event);
        } catch (err) {
          console.error(`[MessagingHub] Error sending to ${conn.id}:`, err);
        }
      }
    }
  }

  /**
   * Check if user can post to a room
   */
  canPostToRoom(roomId: string, userId: string): boolean {
    // Check if announcement channel
    const channel = COURSE_CHANNELS.find((c) => c.id === roomId);
    if (channel?.restricted) {
      // Only instructors can post to restricted channels
      const user = this.connectedUsers.get(userId);
      return user?.role === "instructor";
    }
    return true;
  }

  /**
   * Send a message from a user
   * For channels: broadcasts to all
   * For DMs: sends only to participants
   */
  sendMessage(
    roomId: string,
    senderId: string,
    content: string
  ): ChatMessage | null {
    // Check permissions
    if (!this.canPostToRoom(roomId, senderId)) {
      console.log(`[MessagingHub] User ${senderId} cannot post to ${roomId}`);
      return null;
    }

    const msg: ChatMessage = {
      _tag: "ChatMessage",
      id: crypto.randomUUID(),
      roomId,
      senderId,
      content,
      timestamp: Date.now(),
    };

    const participants = parseDmRoomId(roomId);
    if (participants) {
      // This is a DM
      const dmHistory = this.dmMessageHistory.get(roomId) ?? [];
      dmHistory.push(msg);
      // Keep last 100 messages per DM
      if (dmHistory.length > 100) {
        this.dmMessageHistory.set(roomId, dmHistory.slice(-100));
      } else {
        this.dmMessageHistory.set(roomId, dmHistory);
      }

      // Create/update DM room if needed
      if (!this.dmRooms.has(roomId)) {
        const otherUserId =
          participants[0] === senderId ? participants[1] : participants[0];
        const otherUser = this.connectedUsers.get(otherUserId);
        this.dmRooms.set(roomId, {
          id: roomId,
          name: otherUser?.name ?? `User ${otherUserId.slice(-4)}`,
          type: "dm",
          participants,
          lastActivity: Date.now(),
        });

        // Notify both participants about the new DM room
        this.sendToUsers(participants, {
          _tag: "RoomsInfo",
          rooms: this.getRoomsForUser(participants[0]),
        });
      }

      // Send only to participants
      this.sendToUsers(participants, msg);
    } else {
      // This is a channel message
      const history = this.channelMessageHistory.get(roomId) ?? [];
      history.push(msg);
      if (history.length > 100) {
        this.channelMessageHistory.set(roomId, history.slice(-100));
      } else {
        this.channelMessageHistory.set(roomId, history);
      }
      this.broadcast(msg);
    }

    return msg;
  }

  /**
   * Start a DM conversation with a user
   */
  startDm(userId1: string, userId2: string): ChatRoom {
    const roomId = getDmRoomId(userId1, userId2);

    if (!this.dmRooms.has(roomId)) {
      const otherUser = this.connectedUsers.get(userId2);
      const room: ChatRoom = {
        id: roomId,
        name: otherUser?.name ?? `User ${userId2.slice(-4)}`,
        type: "dm",
        participants: [userId1, userId2].sort() as [string, string],
        lastActivity: Date.now(),
      };
      this.dmRooms.set(roomId, room);

      // Notify both participants
      this.sendToUsers([userId1, userId2], {
        _tag: "RoomsInfo",
        rooms: [...COURSE_CHANNELS, room],
      });
    }

    return this.dmRooms.get(roomId)!;
  }

  /**
   * Send typing indicator
   */
  sendTyping(roomId: string, userId: string, isTyping: boolean): void {
    const event: UserTyping = {
      _tag: "UserTyping",
      roomId,
      userId,
      isTyping,
    };

    const participants = parseDmRoomId(roomId);
    if (participants) {
      this.sendToUsers(participants, event);
    } else {
      this.broadcast(event);
    }
  }

  /**
   * Get connected user count
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Get all available users for starting DMs
   */
  getAvailableUsers(): ChatUser[] {
    return this.getAllUsers();
  }

  /**
   * Get latest announcements
   */
  getLatestAnnouncements(count: number): ChatMessage[] {
    const announcements = this.channelMessageHistory.get("announcements") ?? [];
    return announcements.slice(-count);
  }

  /**
   * Post an announcement (instructor only)
   */
  postAnnouncement(senderId: string, content: string): ChatMessage | null {
    return this.sendMessage("announcements", senderId, content);
  }
}

// Singleton instance
export const messagingHub = new MessagingHub();
