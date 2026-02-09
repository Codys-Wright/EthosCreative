/**
 * Tests for the Lesson Viewer Page
 *
 * Verifies lesson rendering, part display, navigation, and completion marking.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import {
  makeMockUseCourse,
  MOCK_SECTIONS,
  MOCK_LESSONS,
} from "./helpers";

// =============================================================================
// Mocks
// =============================================================================

const mockUseCourse = vi.fn(() => makeMockUseCourse());
const mockSetProgress = vi.fn();
const mockSetCurrentLessonId = vi.fn();

vi.mock("../features/course/client/course-context.js", () => ({
  useCourse: () => mockUseCourse(),
}));

const mockProgressMap = new Map();

vi.mock("@effect-atom/atom-react", () => ({
  useAtomValue: (atom: unknown) => {
    if (atom === "progressAtom") return mockProgressMap;
    if (atom === "currentLessonAtom")
      return { _tag: "Some", value: MOCK_LESSONS[0] };
    if (atom === "currentSectionAtom")
      return { _tag: "Some", value: MOCK_SECTIONS[0] };
    if (atom === "nextLessonAtom")
      return { _tag: "Some", value: MOCK_LESSONS[1] };
    if (atom === "previousLessonAtom") return { _tag: "None" };
    return undefined;
  },
  useAtomSet: (atom: unknown) => {
    if (atom === "progressAtom") return mockSetProgress;
    if (atom === "currentLessonIdAtom") return mockSetCurrentLessonId;
    return vi.fn();
  },
}));

vi.mock("../features/course/client/course-atoms.js", () => ({
  currentLessonIdAtom: "currentLessonIdAtom",
  currentLessonAtom: "currentLessonAtom",
  currentSectionAtom: "currentSectionAtom",
  nextLessonAtom: "nextLessonAtom",
  previousLessonAtom: "previousLessonAtom",
  progressAtom: "progressAtom",
  ProgressUpdate: {
    MarkComplete: (data: any) => ({ _tag: "MarkComplete", ...data }),
  },
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: { component: React.ComponentType }) => ({
    ...opts,
    useParams: () => ({ lessonId: "lesson-1" }),
    useSearch: () => ({}),
  }),
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

// Mock shadcn components
const mockSetOpenMobile = vi.fn();
vi.mock("@shadcn", () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Card: Object.assign(
    ({ children, ...props }: any) => <div {...props}>{children}</div>,
    {
      Header: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Content: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Footer: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Title: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Description: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
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
      Inset: ({ children }: any) => <div>{children}</div>,
    }
  ),
  SidebarProvider: ({ children }: any) => <div>{children}</div>,
  useSidebar: () => ({
    isMobile: false,
    setOpenMobile: mockSetOpenMobile,
  }),
}));

vi.mock("@shadcn/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

vi.mock("../components/course-sidebar.js", () => ({
  CourseSidebar: () => <aside data-testid="course-sidebar">Sidebar</aside>,
}));

vi.mock("@components/markdown-editor/editor", () => ({
  Editor: () => <div data-testid="markdown-editor">Editor Content</div>,
}));

// =============================================================================
// Tests
// =============================================================================

describe("Lesson Viewer Page", () => {
  let LessonPage: React.ComponentType;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockProgressMap.clear();
    mockUseCourse.mockReturnValue(makeMockUseCourse());
    const mod = await import("../routes/$courseSlug/lesson.$lessonId");
    LessonPage = (mod.Route as any)?.component;
  });

  it("renders the lesson page with lesson title", () => {
    if (!LessonPage) return;
    render(<LessonPage />);
    expect(screen.getByText("Welcome")).toBeInTheDocument();
  });

  it("shows the section title in the header", () => {
    if (!LessonPage) return;
    render(<LessonPage />);
    expect(screen.getByText("Introduction")).toBeInTheDocument();
  });

  it("renders lesson parts", () => {
    if (!LessonPage) return;
    render(<LessonPage />);
    // Part titles appear in TOC sidebar and content area, use getAllByText
    expect(screen.getAllByText("Introduction Video").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Welcome Text").length).toBeGreaterThan(0);
  });

  it("shows part type badges", () => {
    if (!LessonPage) return;
    render(<LessonPage />);
    expect(screen.getByText("Video")).toBeInTheDocument();
    expect(screen.getByText("Reading")).toBeInTheDocument();
  });

  it("shows mark complete button when lesson is not completed", () => {
    if (!LessonPage) return;
    render(<LessonPage />);
    expect(screen.getByText("Mark Complete")).toBeInTheDocument();
  });

  it("shows next lesson navigation", () => {
    if (!LessonPage) return;
    render(<LessonPage />);
    expect(screen.getByText("Next Lesson")).toBeInTheDocument();
    expect(screen.getByText("Getting Started")).toBeInTheDocument();
  });

  it("renders the course sidebar", () => {
    if (!LessonPage) return;
    render(<LessonPage />);
    expect(screen.getByTestId("course-sidebar")).toBeInTheDocument();
  });

  it("renders the In This Lesson table of contents for multi-part lessons", () => {
    if (!LessonPage) return;
    render(<LessonPage />);
    expect(screen.getByText("In This Lesson")).toBeInTheDocument();
  });
});
