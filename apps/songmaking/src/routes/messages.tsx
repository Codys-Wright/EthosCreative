/**
 * Course Messages Page
 *
 * Real-time messaging for course participants with:
 * - Announcements channel (instructor-only posting)
 * - General discussion channel
 * - Direct messages between participants
 */

import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useAtomValue } from "@effect-atom/atom-react";
import { Button, Badge, Avatar, Dialog, Card } from "@shadcn";
import { Chat } from "@chat/components";
import { sessionAtom } from "@auth";
import {
  ArrowLeft,
  Users,
  Hash,
  Plus,
  Wifi,
  WifiOff,
  Radio,
  MessageSquare,
  MessageCircle,
  Circle,
  Megaphone,
  Music,
} from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface ChatUser {
  id: string;
  name: string;
  username: string;
  /** User's profile image URL from Better Auth, or null/undefined for initials fallback */
  image?: string | null;
  status?: "online" | "offline" | "away";
  role?: "instructor" | "student";
}

interface ChatRoom {
  id: string;
  name: string;
  type: "channel" | "dm" | "announcement";
  participants?: [string, string];
  lastActivity?: number;
  restricted?: boolean;
}

interface ChatMessage {
  _tag: "ChatMessage";
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: number;
}

interface UserTyping {
  _tag: "UserTyping";
  roomId: string;
  userId: string;
  isTyping: boolean;
}

interface UserJoined {
  _tag: "UserJoined";
  roomId: string;
  userId: string;
  timestamp: number;
}

interface UserLeft {
  _tag: "UserLeft";
  roomId: string;
  userId: string;
  timestamp: number;
}

interface Connected {
  _tag: "Connected";
  connectionId: string;
  userId: string;
  timestamp: number;
}

interface UsersInfo {
  _tag: "UsersInfo";
  users: ChatUser[];
}

interface RoomsInfo {
  _tag: "RoomsInfo";
  rooms: ChatRoom[];
}

type ChatEvent =
  | ChatMessage
  | UserTyping
  | UserJoined
  | UserLeft
  | Connected
  | UsersInfo
  | RoomsInfo;

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

// =============================================================================
// Helpers
// =============================================================================

/** Generate a consistent DM room ID for two users */
const getDmRoomId = (userId1: string, userId2: string): string => {
  const sorted = [userId1, userId2].sort();
  return `dm:${sorted[0]}:${sorted[1]}`;
};

/**
 * Get initials from a name
 * - For single word names: returns first 1-2 characters
 * - For multi-word names: returns first letter of first and last word
 */
const getInitials = (name?: string | null): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    // Single word - take up to 2 characters
    return parts[0].slice(0, 2).toUpperCase();
  }
  // Multi-word - take first letter of first and last
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Default course channels
const DEFAULT_CHANNELS: ChatRoom[] = [
  {
    id: "announcements",
    name: "Announcements",
    type: "announcement",
    restricted: true,
  },
  { id: "general", name: "General Discussion", type: "channel" },
];

// =============================================================================
// Route
// =============================================================================

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
});

// =============================================================================
// Components
// =============================================================================

function MessagesPage() {
  // Get the current user session from Better Auth
  const sessionResult = useAtomValue(sessionAtom);
  const session = sessionResult._tag === "Success" ? sessionResult.value : null;
  const currentUser = session?.user;
  const userId = currentUser?.id ?? "anonymous";

  const [selectedRoomId, setSelectedRoomId] = useState<string>("general");
  const [rooms, setRooms] = useState<ChatRoom[]>(DEFAULT_CHANNELS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [users, setUsers] = useState<Record<string, ChatUser>>(() => ({
    [userId]: {
      id: userId,
      name: currentUser?.name ?? "You",
      username: currentUser?.email ?? "you",
      image: currentUser?.image,
      role: "student",
    },
  }));
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [typingUsers, setTypingUsers] = useState<Record<string, Set<string>>>(
    {}
  );
  const [showNewDmDialog, setShowNewDmDialog] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Separate channels (including announcements) and DMs
  const channels = useMemo(
    () =>
      rooms.filter((r) => r.type === "channel" || r.type === "announcement"),
    [rooms]
  );
  const dmRooms = useMemo(() => rooms.filter((r) => r.type === "dm"), [rooms]);

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId),
    [rooms, selectedRoomId]
  );

  const roomMessages = useMemo(
    () => messages[selectedRoomId] ?? [],
    [messages, selectedRoomId]
  );

  // For DMs, get the other participant
  const dmPartner = useMemo(() => {
    if (
      !selectedRoom ||
      selectedRoom.type !== "dm" ||
      !selectedRoom.participants
    )
      return null;
    const partnerId = selectedRoom.participants.find((id) => id !== userId);
    return partnerId ? users[partnerId] : null;
  }, [selectedRoom, userId, users]);

  // Get display name for a DM room
  const getDmDisplayName = useCallback(
    (room: ChatRoom): string => {
      if (!room.participants) return room.name;
      const partnerId = room.participants.find((id) => id !== userId);
      if (!partnerId) return room.name;
      return users[partnerId]?.name ?? `User ${partnerId.slice(-4)}`;
    },
    [userId, users]
  );

  // Check if current user can post to selected room
  const canPost = useMemo(() => {
    if (!selectedRoom) return false;
    if (selectedRoom.type === "announcement") {
      // Only instructors can post to announcements
      return users[userId]?.role === "instructor";
    }
    return true;
  }, [selectedRoom, userId, users]);

  // Connect to SSE
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStatus("connecting");

    // Build SSE URL with user info
    const params = new URLSearchParams({ userId });
    if (currentUser?.name) params.set("userName", currentUser.name);
    if (currentUser?.image) params.set("userImage", currentUser.image);

    const es = new EventSource(`/api/messages?${params.toString()}`);
    eventSourceRef.current = es;

    es.onopen = () => {
      console.log("[Messages SSE] Connected");
      setStatus("connected");
    };

    es.onerror = (err) => {
      console.error("[Messages SSE] Error:", err);
      setStatus("error");
    };

    es.onmessage = (event) => {
      if (!event.data || event.data.trim() === "") {
        return;
      }

      try {
        const parsed = JSON.parse(event.data) as ChatEvent;

        switch (parsed._tag) {
          case "ChatMessage":
            setMessages((prev) => ({
              ...prev,
              [parsed.roomId]: [...(prev[parsed.roomId] ?? []), parsed],
            }));
            break;

          case "UsersInfo":
            setUsers((prev) => {
              const newUsers = { ...prev };
              for (const user of parsed.users) {
                newUsers[user.id] = user;
              }
              return newUsers;
            });
            break;

          case "UserTyping":
            setTypingUsers((prev) => {
              const roomTyping = new Set(prev[parsed.roomId] ?? []);
              if (parsed.isTyping) {
                roomTyping.add(parsed.userId);
              } else {
                roomTyping.delete(parsed.userId);
              }
              return { ...prev, [parsed.roomId]: roomTyping };
            });
            setTimeout(() => {
              setTypingUsers((prev) => {
                const roomTyping = new Set(prev[parsed.roomId] ?? []);
                roomTyping.delete(parsed.userId);
                return { ...prev, [parsed.roomId]: roomTyping };
              });
            }, 3000);
            break;

          case "Connected":
            console.log("[Messages SSE] Connection ID:", parsed.connectionId);
            break;

          case "RoomsInfo":
            setRooms(parsed.rooms);
            break;

          case "UserJoined":
          case "UserLeft":
            break;
        }
      } catch (err) {
        console.warn("[Messages SSE] Failed to parse:", event.data, err);
      }
    };
  }, [userId, currentUser?.name, currentUser?.image]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || status !== "connected" || !canPost) return;

    const content = inputValue.trim();
    setInputValue("");

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedRoomId,
          senderId: userId,
          content,
        }),
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setInputValue(content);
    }
  }, [inputValue, selectedRoomId, userId, status, canPost]);

  // Group messages by sender
  const groupedMessages = useMemo(() => {
    const groups: Array<{ senderId: string; messages: ChatMessage[] }> = [];

    for (const msg of roomMessages) {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.senderId === msg.senderId) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({ senderId: msg.senderId, messages: [msg] });
      }
    }

    return groups;
  }, [roomMessages]);

  // Typing indicator text
  const typingText = useMemo(() => {
    const typing = typingUsers[selectedRoomId];
    if (!typing || typing.size === 0) return null;

    const names = Array.from(typing)
      .map((id) => users[id]?.name ?? "Someone")
      .slice(0, 3);

    if (names.length === 1) {
      return `${names[0]} is typing...`;
    } else if (names.length === 2) {
      return `${names[0]} and ${names[1]} are typing...`;
    } else {
      return `${names[0]} and ${names.length - 1} others are typing...`;
    }
  }, [typingUsers, selectedRoomId, users]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-4 px-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Music className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold">Course Messages</h1>
            </div>
          </div>
          <div className="flex-1" />
          <ConnectionStatusBadge status={status} />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar - Room List */}
        <aside className="w-64 border-r flex flex-col overflow-hidden bg-muted/30">
          <div className="flex-1 overflow-y-auto">
            {/* Channels Section */}
            <div className="p-3 border-b">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Course Channels
              </h2>
            </div>
            <nav className="p-2 space-y-1">
              {channels.map((room) => {
                const roomMsgCount = messages[room.id]?.length ?? 0;
                const isAnnouncement = room.type === "announcement";
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors ${
                      selectedRoomId === room.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {isAnnouncement ? (
                      <Megaphone className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Hash className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="flex-1 truncate">{room.name}</span>
                    {roomMsgCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {roomMsgCount}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Direct Messages Section */}
            <div className="p-3 border-b border-t mt-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Direct Messages
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowNewDmDialog(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <nav className="p-2 space-y-1">
              {dmRooms.length === 0 ? (
                <p className="text-xs text-muted-foreground px-3 py-2">
                  No conversations yet
                </p>
              ) : (
                dmRooms.map((room) => {
                  const roomMsgCount = messages[room.id]?.length ?? 0;
                  const displayName = getDmDisplayName(room);
                  const partnerId = room.participants?.find(
                    (id) => id !== userId
                  );
                  const partner = partnerId ? users[partnerId] : null;
                  const isOnline = partner?.status === "online";

                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors ${
                        selectedRoomId === room.id
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="h-6 w-6">
                          {partner?.image && (
                            <Avatar.Image
                              src={partner.image}
                              alt={displayName}
                            />
                          )}
                          <Avatar.Fallback className="text-xs uppercase">
                            {getInitials(displayName)}
                          </Avatar.Fallback>
                        </Avatar>
                        {isOnline && (
                          <Circle className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 fill-green-500 text-green-500" />
                        )}
                      </div>
                      <span className="flex-1 truncate">{displayName}</span>
                      {roomMsgCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {roomMsgCount}
                        </Badge>
                      )}
                    </button>
                  );
                })
              )}
            </nav>
          </div>

          {/* New DM Button */}
          <div className="p-3 border-t">
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={() => setShowNewDmDialog(true)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col">
          {selectedRoom ? (
            <Chat className="flex-1">
              <Chat.Header>
                <Chat.Header.Start>
                  {selectedRoom.type === "dm" ? (
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        {dmPartner?.image && (
                          <Avatar.Image
                            src={dmPartner.image}
                            alt={dmPartner?.name ?? "User"}
                          />
                        )}
                        <Avatar.Fallback className="uppercase">
                          {getInitials(dmPartner?.name)}
                        </Avatar.Fallback>
                      </Avatar>
                      {dmPartner?.status === "online" && (
                        <Circle className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 fill-green-500 text-green-500" />
                      )}
                    </div>
                  ) : selectedRoom.type === "announcement" ? (
                    <Megaphone className="w-5 h-5" />
                  ) : (
                    <Hash className="w-5 h-5" />
                  )}
                </Chat.Header.Start>
                <Chat.Header.Main>
                  <span className="font-semibold">
                    {selectedRoom.type === "dm"
                      ? getDmDisplayName(selectedRoom)
                      : selectedRoom.name}
                  </span>
                  {typingText && (
                    <span className="text-xs text-muted-foreground ml-2 animate-pulse">
                      {typingText}
                    </span>
                  )}
                </Chat.Header.Main>
                <Chat.Header.End>
                  {(selectedRoom.type === "channel" ||
                    selectedRoom.type === "announcement") && (
                    <Badge variant="outline">
                      <Users className="w-3 h-3 mr-1" />
                      {Object.keys(users).length} participants
                    </Badge>
                  )}
                </Chat.Header.End>
              </Chat.Header>

              <Chat.Messages>
                {roomMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    {status === "connected"
                      ? selectedRoom.type === "dm"
                        ? "Start a conversation..."
                        : selectedRoom.type === "announcement"
                        ? "No announcements yet"
                        : "Be the first to send a message!"
                      : "Connecting..."}
                  </div>
                ) : (
                  [...groupedMessages].reverse().map((group, groupIndex) => {
                    const sender = users[group.senderId] ?? {
                      id: group.senderId,
                      name: "Unknown User",
                      username: "unknown",
                      image: null,
                    };
                    const reversedMessages = [...group.messages].reverse();

                    return (
                      <div key={`group-${groupIndex}`}>
                        {reversedMessages.map((msg, msgIndex) => {
                          const isFirst =
                            msgIndex === reversedMessages.length - 1;

                          if (isFirst) {
                            return (
                              <Chat.PrimaryMessage
                                key={msg.id}
                                senderName={sender.name}
                                content={msg.content}
                                timestamp={msg.timestamp}
                                avatarSrc={sender.image ?? undefined}
                                avatarAlt={sender.name}
                                avatarFallback={getInitials(sender.name)}
                              />
                            );
                          }

                          return (
                            <Chat.AdditionalMessage
                              key={msg.id}
                              content={msg.content}
                              timestamp={msg.timestamp}
                            />
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </Chat.Messages>

              {canPost ? (
                <Chat.Input
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={handleSend}
                  placeholder={
                    selectedRoom.type === "dm"
                      ? `Message ${getDmDisplayName(selectedRoom)}`
                      : `Message #${selectedRoom.name}`
                  }
                />
              ) : (
                <div className="px-4 py-3 border-t bg-muted/50 text-center text-sm text-muted-foreground">
                  Only instructors can post announcements
                </div>
              )}
            </Chat>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a channel or conversation to start chatting
            </div>
          )}
        </main>
      </div>

      {/* New DM Dialog */}
      <Dialog open={showNewDmDialog} onOpenChange={setShowNewDmDialog}>
        <Dialog.Content className="sm:max-w-md">
          <Dialog.Header>
            <Dialog.Title>New Message</Dialog.Title>
            <Dialog.Description>
              Start a direct message with a course participant.
            </Dialog.Description>
          </Dialog.Header>
          <div className="space-y-2 max-h-64 overflow-y-auto py-4">
            {Object.values(users)
              .filter((user) => user.id !== userId)
              .map((user) => {
                const existingDmId = getDmRoomId(userId, user.id);
                const hasExistingDm = rooms.some((r) => r.id === existingDmId);

                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      const dmRoomId = getDmRoomId(userId, user.id);
                      if (!hasExistingDm) {
                        setRooms((prev) => [
                          ...prev,
                          {
                            id: dmRoomId,
                            name: user.name,
                            type: "dm",
                            participants: [userId, user.id].sort() as [
                              string,
                              string
                            ],
                          },
                        ]);
                      }
                      setSelectedRoomId(dmRoomId);
                      setShowNewDmDialog(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left hover:bg-muted transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        {user.image && (
                          <Avatar.Image src={user.image} alt={user.name} />
                        )}
                        <Avatar.Fallback className="uppercase">
                          {getInitials(user.name)}
                        </Avatar.Fallback>
                      </Avatar>
                      {user.status === "online" && (
                        <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-green-500 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.role === "instructor" ? "Instructor" : "Student"}
                      </p>
                    </div>
                    {hasExistingDm && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </button>
                );
              })}
            {Object.values(users).filter((u) => u.id !== userId).length ===
              0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No other participants yet
              </p>
            )}
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}

function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
  switch (status) {
    case "connected":
      return (
        <Badge variant="default" className="gap-1 bg-green-600">
          <Wifi className="w-3 h-3" />
          Connected
        </Badge>
      );
    case "connecting":
      return (
        <Badge variant="secondary" className="gap-1">
          <Radio className="w-3 h-3 animate-pulse" />
          Connecting
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive" className="gap-1">
          <WifiOff className="w-3 h-3" />
          Error
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1">
          <WifiOff className="w-3 h-3" />
          Disconnected
        </Badge>
      );
  }
}
