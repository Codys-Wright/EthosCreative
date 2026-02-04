/**
 * Fake Messaging Atoms for Example Course
 *
 * Provides simulated announcements, chat messages, and direct messages
 * that update periodically to demonstrate the messaging features.
 *
 * IMPORTANT: Initial state is empty to avoid SSR hydration mismatches.
 * Data is populated client-side after hydration.
 */

import { Atom } from "@effect-atom/atom-react";

// =============================================================================
// Types
// =============================================================================

export interface FakeUser {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface FakeAnnouncement {
  id: string;
  content: string;
  author: FakeUser;
  timestamp: number;
}

export interface FakeChatMessage {
  id: string;
  content: string;
  author: FakeUser;
  timestamp: number;
}

export interface FakeDirectMessage {
  id: string;
  from: FakeUser;
  preview: string;
  unread: boolean;
  timestamp: number;
}

// =============================================================================
// Mock Data
// =============================================================================

const FAKE_USERS: FakeUser[] = [
  {
    id: "instructor",
    name: "Sarah Mitchell",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
  },
  {
    id: "student1",
    name: "Alex Chen",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
  },
  {
    id: "student2",
    name: "Jordan Taylor",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan",
  },
  {
    id: "student3",
    name: "Riley Morgan",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=riley",
  },
  {
    id: "student4",
    name: "Casey Williams",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=casey",
  },
  {
    id: "student5",
    name: "Sam Parker",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
  },
];

const ANNOUNCEMENT_MESSAGES = [
  "🎵 New lesson on chord progressions just dropped! Check it out in Section 2.",
  "📅 Live Q&A session this Friday at 3 PM EST. Bring your questions!",
  "🎉 Congratulations to everyone who completed the first section!",
  "💡 Pro tip: Practice your scales for at least 15 minutes daily.",
  "🔔 Course update: New bonus content on music theory basics added.",
  "📝 Assignment reminder: Submit your first composition by Sunday.",
  "🎸 Guest instructor workshop next week - register now!",
  "✨ New practice tracks uploaded to the resources section.",
];

const CHAT_MESSAGES = [
  "Has anyone tried the new practice exercise?",
  "This lesson on melody writing is amazing!",
  "I'm stuck on lesson 3, any tips?",
  "Just finished my first song! 🎶",
  "The instructor's feedback was super helpful",
  "Who wants to collaborate on a track?",
  "These chord progressions are 🔥",
  "Finally understanding music theory!",
  "Practice session going well today",
  "Love the community here!",
  "Anyone else working on the assignment?",
  "The bonus content is worth checking out",
  "Made so much progress this week",
  "Ready for the live session!",
];

const DM_PREVIEWS = [
  "Hey! Loved your latest track...",
  "Thanks for the feedback on my song!",
  "Want to work on something together?",
  "Did you finish the assignment yet?",
  "Great question in the chat earlier!",
  "Check out this technique I learned...",
];

// =============================================================================
// Helper Functions
// =============================================================================

const randomFrom = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateId = () => crypto.randomUUID();

// =============================================================================
// State Atoms - Start empty to avoid hydration mismatch
// =============================================================================

/** Whether fake messaging has been initialized (client-side only) */
export const fakeMessagingInitializedAtom = Atom.make(false).pipe(
  Atom.keepAlive
);

/** Fake announcements list - starts empty */
export const fakeAnnouncementsAtom = Atom.make<FakeAnnouncement[]>([]).pipe(
  Atom.keepAlive
);

/** Fake chat messages list - starts empty */
export const fakeChatMessagesAtom = Atom.make<FakeChatMessage[]>([]).pipe(
  Atom.keepAlive
);

/** Fake direct messages list - starts empty */
export const fakeDirectMessagesAtom = Atom.make<FakeDirectMessage[]>([]).pipe(
  Atom.keepAlive
);

// =============================================================================
// Initial Data Generators (called client-side only)
// =============================================================================

export function generateInitialAnnouncements(): FakeAnnouncement[] {
  const instructor = FAKE_USERS[0]; // Sarah Mitchell is the instructor
  const now = Date.now();

  return [
    {
      id: generateId(),
      content:
        "Welcome to the Example Course! This is a preview of the full songmaking experience.",
      author: instructor,
      timestamp: now - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    },
    {
      id: generateId(),
      content:
        "📅 Live Q&A session this Friday at 3 PM EST. Bring your questions!",
      author: instructor,
      timestamp: now - 1000 * 60 * 60 * 12, // 12 hours ago
    },
    {
      id: generateId(),
      content:
        "🎵 New lesson on chord progressions just dropped! Check it out in Section 2.",
      author: instructor,
      timestamp: now - 1000 * 60 * 30, // 30 minutes ago
    },
  ];
}

export function generateInitialChatMessages(): FakeChatMessage[] {
  const now = Date.now();
  const messages: FakeChatMessage[] = [];

  // Generate 5 initial messages
  for (let i = 0; i < 5; i++) {
    messages.push({
      id: generateId(),
      content: randomFrom(CHAT_MESSAGES),
      author: randomFrom(FAKE_USERS.slice(1)), // Exclude instructor
      timestamp: now - 1000 * 60 * (30 - i * 5), // Spread over last 30 minutes
    });
  }

  return messages;
}

export function generateInitialDirectMessages(): FakeDirectMessage[] {
  const now = Date.now();

  return [
    {
      id: generateId(),
      from: FAKE_USERS[1], // Alex
      preview: "Hey! Loved your latest track...",
      unread: true,
      timestamp: now - 1000 * 60 * 5, // 5 minutes ago
    },
    {
      id: generateId(),
      from: FAKE_USERS[2], // Jordan
      preview: "Thanks for the feedback on my song!",
      unread: false,
      timestamp: now - 1000 * 60 * 60, // 1 hour ago
    },
  ];
}

// =============================================================================
// Message Generators (for ongoing fake events)
// =============================================================================

/**
 * Generate a random new announcement
 */
export function generateFakeAnnouncement(): FakeAnnouncement {
  return {
    id: generateId(),
    content: randomFrom(ANNOUNCEMENT_MESSAGES),
    author: FAKE_USERS[0], // Instructor
    timestamp: Date.now(),
  };
}

/**
 * Generate a random new chat message
 */
export function generateFakeChatMessage(): FakeChatMessage {
  return {
    id: generateId(),
    content: randomFrom(CHAT_MESSAGES),
    author: randomFrom(FAKE_USERS.slice(1)), // Random student
    timestamp: Date.now(),
  };
}

/**
 * Generate a random new direct message
 */
export function generateFakeDirectMessage(): FakeDirectMessage {
  return {
    id: generateId(),
    from: randomFrom(FAKE_USERS.slice(1)), // Random student
    preview: randomFrom(DM_PREVIEWS),
    unread: true,
    timestamp: Date.now(),
  };
}

/**
 * Get the interval for the next fake event (3-8 seconds)
 */
export function getNextEventInterval(): number {
  return randomInt(3000, 8000);
}

/**
 * Decide what type of event to generate (weighted)
 * 60% chat, 25% DM, 15% announcement
 */
export function getNextEventType(): "chat" | "dm" | "announcement" {
  const roll = Math.random();
  if (roll < 0.6) return "chat";
  if (roll < 0.85) return "dm";
  return "announcement";
}
