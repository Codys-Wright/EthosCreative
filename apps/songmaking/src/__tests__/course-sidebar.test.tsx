/**
 * Tests for the Course Sidebar Component
 *
 * Verifies section rendering, navigation links, and sidebar structure.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { makeMockUseCourse, MOCK_SECTIONS } from "./helpers";

// =============================================================================
// Mocks
// =============================================================================

const mockUseCourse = vi.fn(() => makeMockUseCourse());

vi.mock("../features/course/client/course-context.js", () => ({
  useCourse: () => mockUseCourse(),
}));

vi.mock("@effect-atom/atom-react", () => ({
  useAtomValue: (atom: unknown) => {
    if (atom === "progressAtom") return new Map();
    if (atom === "expandedSectionsAtom") return new Set(["section-1"]);
    if (atom === "expandedWeeksAtom") return new Set();
    if (atom === "sessionAtom")
      return { _tag: "Success", value: null };
    // sectionProgressAtom(id) / weekProgressAtom(id) return string keys like "sectionProgressAtom-section-1"
    if (typeof atom === "string" && atom.startsWith("sectionProgressAtom"))
      return { completed: 0, total: 3, percent: 0 };
    if (typeof atom === "string" && atom.startsWith("weekProgressAtom"))
      return { completed: 0, total: 3, percent: 0 };
    return undefined;
  },
  useAtomSet: () => vi.fn(),
}));

vi.mock("../features/course/client/course-atoms.js", () => ({
  progressAtom: "progressAtom",
  expandedSectionsAtom: "expandedSectionsAtom",
  sectionProgressAtom: (id: string) => `sectionProgressAtom-${id}`,
  expandedWeeksAtom: "expandedWeeksAtom",
  ExpandedWeeksUpdate: {
    Toggle: (data: any) => ({ _tag: "Toggle", ...data }),
    Expand: (data: any) => ({ _tag: "Expand", ...data }),
  },
  weekProgressAtom: (id: string) => `weekProgressAtom-${id}`,
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@auth", () => ({
  UserButton: () => <div data-testid="user-button">User</div>,
  SignedIn: ({ children }: any) => <div>{children}</div>,
  SignedOut: ({ children }: any) => <div>{children}</div>,
  sessionAtom: "sessionAtom",
}));

// Mock shadcn components
const mockSetOpenMobile = vi.fn();
vi.mock("@shadcn", () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  Collapsible: Object.assign(
    ({ children, open, ...props }: any) => (
      <div data-open={open} {...props}>
        {children}
      </div>
    ),
    {
      Trigger: ({ children, asChild: _asChild, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Content: ({ children }: any) => <div>{children}</div>,
    }
  ),
  ScrollArea: Object.assign(
    ({ children, ...props }: any) => <div {...props}>{children}</div>,
    {
      Bar: () => null,
    }
  ),
  Sidebar: Object.assign(
    ({ children, ...props }: any) => <div {...props}>{children}</div>,
    {
      Header: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Footer: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Group: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      GroupLabel: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      GroupContent: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Menu: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      MenuItem: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      MenuButton: ({ children, asChild: _asChild, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Separator: () => <hr />,
      Inset: ({ children }: any) => <div>{children}</div>,
      Provider: ({ children }: any) => <div>{children}</div>,
    }
  ),
  useSidebar: () => ({
    isMobile: false,
    setOpenMobile: mockSetOpenMobile,
  }),
}));

vi.mock("@shadcn/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

// =============================================================================
// Tests
// =============================================================================

describe("Course Sidebar", () => {
  let CourseSidebar: React.ComponentType<{ currentLessonId?: string }>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockUseCourse.mockReturnValue(makeMockUseCourse());
    const mod = await import("../components/course-sidebar");
    CourseSidebar = mod.CourseSidebar;
  });

  it("renders the course title", () => {
    render(<CourseSidebar />);
    expect(screen.getByText("Test Course")).toBeInTheDocument();
  });

  it("shows navigation links", () => {
    render(<CourseSidebar />);
    expect(screen.getByText("My Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Course Chat")).toBeInTheDocument();
    expect(screen.getByText("Course Overview")).toBeInTheDocument();
  });

  it("renders section titles", () => {
    render(<CourseSidebar />);
    for (const section of MOCK_SECTIONS) {
      expect(screen.getByText(section.title)).toBeInTheDocument();
    }
  });

  it("shows Course Content label when not using week-based navigation", () => {
    render(<CourseSidebar />);
    expect(screen.getByText("Course Content")).toBeInTheDocument();
  });

  it("shows lesson titles within expanded sections", () => {
    render(<CourseSidebar />);
    // Section 1 is expanded (section-1 is in expandedSectionsAtom set)
    // Lessons in section-1: Welcome, Getting Started
    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText("Getting Started")).toBeInTheDocument();
  });

  it("highlights the current lesson when provided", () => {
    render(<CourseSidebar currentLessonId="lesson-1" />);
    // The lesson should be rendered (active state is CSS-based, we just check it renders)
    expect(screen.getByText("Welcome")).toBeInTheDocument();
  });

  it("shows section progress counts", () => {
    render(<CourseSidebar />);
    // Each section shows "X/Y lessons" based on sectionProgressAtom mock (0/3)
    const progressTexts = screen.getAllByText(/\d+\/\d+ lessons/);
    expect(progressTexts.length).toBe(MOCK_SECTIONS.length);
  });

  it("shows sign in section for signed out users", () => {
    render(<CourseSidebar />);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });
});
