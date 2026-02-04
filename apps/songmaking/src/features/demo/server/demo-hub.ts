/**
 * Demo Hub
 *
 * Singleton hub that manages simulated activity for the Example Course.
 * Generates fake chat messages, progress updates, announcements, and DMs.
 */

import {
  DEMO_USERS,
  getDemoStudents,
  getDemoInstructor,
  getRandomDemoStudent,
  randomFrom,
  randomInt,
  GENERAL_CHANNEL_MESSAGES,
  DIRECT_MESSAGE_TEMPLATES,
  ANNOUNCEMENT_MESSAGES,
  type DemoUser,
} from "./demo-users.js";
import {
  EXAMPLE_LESSONS,
  EXAMPLE_SECTIONS,
  getExampleSectionById,
} from "../../../data/example-course.js";

// =============================================================================
// Event Types
// =============================================================================

export type DemoEvent =
  | {
      _tag: "ChatMessage";
      id: string;
      room: string;
      user: DemoUser;
      content: string;
      timestamp: number;
    }
  | {
      _tag: "DirectMessage";
      id: string;
      from: DemoUser;
      to: DemoUser;
      content: string;
      timestamp: number;
    }
  | {
      _tag: "Announcement";
      id: string;
      author: DemoUser;
      title: string;
      content: string;
      priority: "low" | "normal" | "high" | "urgent";
      timestamp: number;
    }
  | {
      _tag: "LessonCompleted";
      id: string;
      user: DemoUser;
      lessonId: string;
      lessonTitle: string;
      sectionTitle: string;
      timestamp: number;
    }
  | {
      _tag: "UserTyping";
      room: string;
      user: DemoUser;
      timestamp: number;
    }
  | {
      _tag: "UserStatus";
      user: DemoUser;
      status: "online" | "away" | "offline";
      timestamp: number;
    }
  | {
      _tag: "Keepalive";
      timestamp: number;
    };

// =============================================================================
// Student Progress Tracking
// =============================================================================

interface StudentProgress {
  lessonIndex: number; // Index into EXAMPLE_LESSONS array
  completedLessons: Set<string>;
}

// =============================================================================
// Demo Hub Class
// =============================================================================

type EventCallback = (event: DemoEvent) => void;

class DemoHub {
  private static instance: DemoHub | null = null;

  private callbacks: Map<string, EventCallback> = new Map();
  private messageInterval: ReturnType<typeof setInterval> | null = null;
  private progressInterval: ReturnType<typeof setInterval> | null = null;
  private announcementInterval: ReturnType<typeof setInterval> | null = null;
  private statusInterval: ReturnType<typeof setInterval> | null = null;
  private keepaliveInterval: ReturnType<typeof setInterval> | null = null;

  private studentProgress: Map<string, StudentProgress> = new Map();
  private messageHistory: DemoEvent[] = [];
  private announcementIndex = 0;
  private isRunning = false;

  private constructor() {
    this.initializeStudentProgress();
  }

  static getInstance(): DemoHub {
    if (!DemoHub.instance) {
      DemoHub.instance = new DemoHub();
    }
    return DemoHub.instance;
  }

  // =============================================================================
  // Initialization
  // =============================================================================

  private initializeStudentProgress(): void {
    const students = getDemoStudents();
    const totalLessons = EXAMPLE_LESSONS.length;

    students.forEach((student, index) => {
      // Each student starts with different progress (0-60%)
      const startingProgress = Math.floor(
        (index / students.length) * 0.6 * totalLessons
      );
      const completedLessons = new Set<string>();

      for (let i = 0; i < startingProgress; i++) {
        completedLessons.add(EXAMPLE_LESSONS[i].id);
      }

      this.studentProgress.set(student.id, {
        lessonIndex: startingProgress,
        completedLessons,
      });
    });
  }

  // =============================================================================
  // Connection Management
  // =============================================================================

  register(connectionId: string, callback: EventCallback): void {
    this.callbacks.set(connectionId, callback);

    // Start simulation if this is the first connection
    if (this.callbacks.size === 1 && !this.isRunning) {
      this.start();
    }

    // Send initial state
    this.sendInitialState(callback);
  }

  unregister(connectionId: string): void {
    this.callbacks.delete(connectionId);

    // Stop simulation if no more connections
    if (this.callbacks.size === 0 && this.isRunning) {
      this.stop();
    }
  }

  private sendInitialState(callback: EventCallback): void {
    // Send recent message history
    this.messageHistory.slice(-20).forEach((event) => {
      callback(event);
    });

    // Send current user statuses
    DEMO_USERS.forEach((user) => {
      callback({
        _tag: "UserStatus",
        user,
        status: user.status,
        timestamp: Date.now(),
      });
    });

    // Send current student progress
    this.studentProgress.forEach((progress, studentId) => {
      const student = DEMO_USERS.find((u) => u.id === studentId);
      if (student && progress.completedLessons.size > 0) {
        const lastCompletedIndex = progress.lessonIndex - 1;
        if (lastCompletedIndex >= 0) {
          const lesson = EXAMPLE_LESSONS[lastCompletedIndex];
          const section = getExampleSectionById(lesson.sectionId);
          callback({
            _tag: "LessonCompleted",
            id: `init-${studentId}-${lesson.id}`,
            user: student,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            sectionTitle: section?.title ?? "Unknown",
            timestamp: Date.now() - randomInt(60000, 300000), // 1-5 minutes ago
          });
        }
      }
    });
  }

  // =============================================================================
  // Simulation Control
  // =============================================================================

  private start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Chat messages: 3-8 seconds
    this.messageInterval = setInterval(() => {
      this.simulateChatActivity();
    }, randomInt(3000, 8000));

    // Progress updates: 15-45 seconds
    this.progressInterval = setInterval(() => {
      this.simulateProgressUpdate();
    }, randomInt(15000, 45000));

    // Announcements: 2-5 minutes
    this.announcementInterval = setInterval(
      () => {
        this.simulateAnnouncement();
      },
      randomInt(120000, 300000)
    );

    // User status changes: 30-60 seconds
    this.statusInterval = setInterval(() => {
      this.simulateStatusChange();
    }, randomInt(30000, 60000));

    // Keepalive: 15 seconds
    this.keepaliveInterval = setInterval(() => {
      this.broadcast({ _tag: "Keepalive", timestamp: Date.now() });
    }, 15000);
  }

  private stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.messageInterval) clearInterval(this.messageInterval);
    if (this.progressInterval) clearInterval(this.progressInterval);
    if (this.announcementInterval) clearInterval(this.announcementInterval);
    if (this.statusInterval) clearInterval(this.statusInterval);
    if (this.keepaliveInterval) clearInterval(this.keepaliveInterval);

    this.messageInterval = null;
    this.progressInterval = null;
    this.announcementInterval = null;
    this.statusInterval = null;
    this.keepaliveInterval = null;
  }

  // =============================================================================
  // Simulation Methods
  // =============================================================================

  private simulateChatActivity(): void {
    const eventType = Math.random();

    if (eventType < 0.7) {
      // 70%: General chat message
      this.sendRandomMessage();
    } else if (eventType < 0.85) {
      // 15%: Typing indicator
      this.sendTypingIndicator();
    } else {
      // 15%: Direct message
      this.sendDirectMessage();
    }
  }

  private sendRandomMessage(): void {
    const student = getRandomDemoStudent();
    const content = randomFrom(GENERAL_CHANNEL_MESSAGES);

    const event: DemoEvent = {
      _tag: "ChatMessage",
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      room: "general",
      user: student,
      content,
      timestamp: Date.now(),
    };

    this.messageHistory.push(event);
    if (this.messageHistory.length > 100) {
      this.messageHistory.shift();
    }

    this.broadcast(event);
  }

  private sendTypingIndicator(): void {
    const student = getRandomDemoStudent();

    this.broadcast({
      _tag: "UserTyping",
      room: "general",
      user: student,
      timestamp: Date.now(),
    });
  }

  private sendDirectMessage(): void {
    const students = getDemoStudents();
    const from = randomFrom(students);
    let to = randomFrom(students);

    // Make sure from and to are different
    while (to.id === from.id) {
      to = randomFrom(students);
    }

    const content = randomFrom(DIRECT_MESSAGE_TEMPLATES);

    const event: DemoEvent = {
      _tag: "DirectMessage",
      id: `dm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      from,
      to,
      content,
      timestamp: Date.now(),
    };

    this.messageHistory.push(event);
    this.broadcast(event);
  }

  private simulateProgressUpdate(): void {
    const students = getDemoStudents();
    const student = randomFrom(students);
    const progress = this.studentProgress.get(student.id);

    if (!progress || progress.lessonIndex >= EXAMPLE_LESSONS.length) {
      return; // Student already completed all lessons
    }

    const lesson = EXAMPLE_LESSONS[progress.lessonIndex];
    const section = getExampleSectionById(lesson.sectionId);

    // Mark lesson as complete
    progress.completedLessons.add(lesson.id);
    progress.lessonIndex++;

    const event: DemoEvent = {
      _tag: "LessonCompleted",
      id: `progress-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      user: student,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      sectionTitle: section?.title ?? "Unknown",
      timestamp: Date.now(),
    };

    this.messageHistory.push(event);
    this.broadcast(event);
  }

  private simulateAnnouncement(): void {
    const instructor = getDemoInstructor();
    const announcement =
      ANNOUNCEMENT_MESSAGES[this.announcementIndex % ANNOUNCEMENT_MESSAGES.length];
    this.announcementIndex++;

    const event: DemoEvent = {
      _tag: "Announcement",
      id: `announce-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      author: instructor,
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      timestamp: Date.now(),
    };

    this.messageHistory.push(event);
    this.broadcast(event);
  }

  private simulateStatusChange(): void {
    const user = randomFrom(DEMO_USERS);
    const statuses: ("online" | "away" | "offline")[] = [
      "online",
      "away",
      "offline",
    ];
    const newStatus = randomFrom(statuses);

    // Update user status
    user.status = newStatus;

    this.broadcast({
      _tag: "UserStatus",
      user,
      status: newStatus,
      timestamp: Date.now(),
    });
  }

  // =============================================================================
  // Broadcasting
  // =============================================================================

  private broadcast(event: DemoEvent): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(event);
      } catch {
        // Ignore errors from individual callbacks
      }
    });
  }

  // =============================================================================
  // Public API
  // =============================================================================

  getStudentProgress(): Map<string, { completed: number; total: number }> {
    const result = new Map<string, { completed: number; total: number }>();
    const totalLessons = EXAMPLE_LESSONS.length;

    this.studentProgress.forEach((progress, studentId) => {
      result.set(studentId, {
        completed: progress.completedLessons.size,
        total: totalLessons,
      });
    });

    return result;
  }

  getUsers(): DemoUser[] {
    return [...DEMO_USERS];
  }

  getMessageHistory(): DemoEvent[] {
    return [...this.messageHistory];
  }
}

// =============================================================================
// Export Singleton
// =============================================================================

export const demoHub = DemoHub.getInstance();
