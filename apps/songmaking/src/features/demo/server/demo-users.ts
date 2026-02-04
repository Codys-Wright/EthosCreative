/**
 * Demo Users
 *
 * Mock students and instructor for the Example Course demo.
 * Uses DiceBear for consistent avatar generation.
 */

export interface DemoUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  status: "online" | "away" | "offline";
  role: "student" | "instructor";
}

// =============================================================================
// Demo Students (5 students + 1 instructor)
// =============================================================================

export const DEMO_USERS: DemoUser[] = [
  {
    id: "demo-student-1",
    name: "Alex Thompson",
    username: "alex_t",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex_thompson",
    status: "online",
    role: "student",
  },
  {
    id: "demo-student-2",
    name: "Jordan Rivera",
    username: "jordan_r",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan_rivera",
    status: "online",
    role: "student",
  },
  {
    id: "demo-student-3",
    name: "Sam Chen",
    username: "sam_c",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam_chen",
    status: "away",
    role: "student",
  },
  {
    id: "demo-student-4",
    name: "Morgan Lee",
    username: "morgan_l",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=morgan_lee",
    status: "online",
    role: "student",
  },
  {
    id: "demo-student-5",
    name: "Casey Williams",
    username: "casey_w",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=casey_williams",
    status: "offline",
    role: "student",
  },
  {
    id: "demo-instructor",
    name: "Dr. Sarah Chen",
    username: "dr_chen",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah_chen_instructor",
    status: "online",
    role: "instructor",
  },
];

// =============================================================================
// Helper Functions
// =============================================================================

export function getDemoStudents(): DemoUser[] {
  return DEMO_USERS.filter((u) => u.role === "student");
}

export function getDemoInstructor(): DemoUser {
  return DEMO_USERS.find((u) => u.role === "instructor")!;
}

export function getRandomDemoStudent(): DemoUser {
  const students = getDemoStudents();
  return students[Math.floor(Math.random() * students.length)];
}

export function getRandomDemoUser(): DemoUser {
  return DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)];
}

export function getDemoUserById(id: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.id === id);
}

// =============================================================================
// Sample Messages for Simulation
// =============================================================================

export const GENERAL_CHANNEL_MESSAGES = [
  "Just finished the first lesson! Really helpful.",
  "Anyone else working on Section 2?",
  "The quiz was tricky but I passed!",
  "Love the video explanations",
  "Can someone explain the concept in lesson 3?",
  "Finally completed the whole course!",
  "This platform is great for learning",
  "The instructor explains things so clearly",
  "Working through the practice exercises now",
  "Has anyone started the final project?",
  "Good morning everyone!",
  "Taking a short break, back in 10",
  "Just hit 50% progress!",
  "The key principles video was mind-blowing",
  "Anyone want to study together?",
  "I had the same question, thanks for asking!",
  "Great course structure",
  "The assignments really help reinforce the concepts",
  "Almost done with Section 1",
  "This is exactly what I needed to learn",
];

export const DIRECT_MESSAGE_TEMPLATES = [
  "Hey, how's your progress going?",
  "Did you understand the last lesson?",
  "Want to discuss the quiz questions?",
  "I found a helpful resource for Section 2",
  "Thanks for the tip earlier!",
  "Good luck with the final project!",
  "Let me know if you need help",
  "That was a great question you asked",
];

export const ANNOUNCEMENT_MESSAGES = [
  {
    title: "Welcome to the Course!",
    content: "Excited to have you all here. Start with the Introduction and work your way through. Don't hesitate to ask questions!",
    priority: "normal" as const,
  },
  {
    title: "New Bonus Content Added",
    content: "I've added some extra practice materials to Section 2. Check them out!",
    priority: "normal" as const,
  },
  {
    title: "Office Hours This Week",
    content: "Join me for live Q&A this Friday at 3pm EST. Bring your questions!",
    priority: "high" as const,
  },
  {
    title: "Great Progress Everyone!",
    content: "I'm seeing fantastic engagement. Keep up the great work and remember - learning takes time.",
    priority: "normal" as const,
  },
  {
    title: "Quiz Tip",
    content: "For the Core Concepts quiz, make sure you review the Key Principles lesson first. It covers most of the material.",
    priority: "normal" as const,
  },
];

// =============================================================================
// Utility for Random Selection
// =============================================================================

export function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
