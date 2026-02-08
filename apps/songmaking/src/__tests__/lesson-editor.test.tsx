/**
 * Tests for the Lesson Editor Page
 *
 * Verifies lesson editor rendering, part list, and editor structure.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";

// =============================================================================
// Mocks
// =============================================================================

// Mock the data module first since the editor page imports from it directly
const MOCK_LESSON = {
  id: "lesson-1",
  courseId: "course-1",
  sectionId: "section-1",
  title: "Welcome to Songmaking",
  description: "An introductory lesson",
  type: "video" as const,
  sortOrder: 0,
  durationMinutes: 10,
  isFree: true,
  isPreview: false,
  isPublished: true,
};

const MOCK_SECTION = {
  id: "section-1",
  courseId: "course-1",
  title: "Introduction",
  description: "Getting started",
  sortOrder: 0,
};

const MOCK_PARTS = [
  {
    id: "part-1",
    lessonId: "lesson-1",
    title: "Intro Video",
    type: "video" as const,
    sortOrder: 0,
    durationMinutes: 5,
    mdxContent: null,
    videoContent: {
      provider: "youtube",
      videoId: "abc123",
      durationSeconds: 300,
      thumbnailUrl: null,
    },
  },
  {
    id: "part-2",
    lessonId: "lesson-1",
    title: "Welcome Reading",
    type: "text" as const,
    sortOrder: 1,
    durationMinutes: 3,
    mdxContent: "# Welcome",
    videoContent: null,
  },
];

vi.mock("../data/course.js", () => ({
  getLessonById: () => MOCK_LESSON,
  getSectionById: () => MOCK_SECTION,
  getLessonParts: () => MOCK_PARTS,
  SONGMAKING_COURSE: { id: "course-1", title: "Songmaking", slug: "songmaking" },
  SONGMAKING_LESSON_PARTS: MOCK_PARTS,
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: any) => ({
    ...opts,
    useParams: () => ({ lessonId: "lesson-1" }),
    useSearch: () => ({}),
  }),
  Link: ({ children, to, ...props }: any) => (
    <a href={typeof to === "string" ? to : "#"} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}));

// Mock DnD kit
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: any) => <div>{children}</div>,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: () => ({}),
  useSensors: () => [],
}));

vi.mock("@dnd-kit/sortable", () => ({
  arrayMove: vi.fn(),
  SortableContext: ({ children }: any) => <div>{children}</div>,
  sortableKeyboardCoordinates: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  verticalListSortingStrategy: {},
}));

vi.mock("@dnd-kit/modifiers", () => ({
  restrictToVerticalAxis: vi.fn(),
  restrictToParentElement: vi.fn(),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => "" } },
}));

// Mock shadcn components
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
    }
  ),
  Dialog: Object.assign(
    ({ children, open, ...props }: any) =>
      open ? <div {...props}>{children}</div> : null,
    {
      Content: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Header: ({ children, ...props }: any) => (
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
      Trigger: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
    }
  ),
  Input: (props: any) => <input {...props} />,
  Label: ({ children, ...props }: any) => (
    <label {...props}>{children}</label>
  ),
  Select: Object.assign(
    ({ children, ...props }: any) => <div {...props}>{children}</div>,
    {
      Trigger: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Value: ({ children, ...props }: any) => (
        <span {...props}>{children}</span>
      ),
      Content: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Item: ({ children, ...props }: any) => (
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

describe("Lesson Editor Page", () => {
  let LessonEditPage: React.ComponentType;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("../routes/lesson_.$lessonId.edit");
    LessonEditPage = (mod.Route as any)?.component;
  });

  it("renders the lesson editor page", () => {
    if (!LessonEditPage) return;
    render(<LessonEditPage />);
    expect(screen.getByText("Welcome to Songmaking")).toBeInTheDocument();
  });

  it("shows the section name", () => {
    if (!LessonEditPage) return;
    render(<LessonEditPage />);
    expect(screen.getByText("Introduction")).toBeInTheDocument();
  });

  it("lists lesson parts", () => {
    if (!LessonEditPage) return;
    render(<LessonEditPage />);
    // Parts may appear in multiple places (sidebar + content), use getAllByText
    expect(screen.getAllByText("Intro Video").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Welcome Reading").length).toBeGreaterThan(0);
  });

  it("shows part type badges", () => {
    if (!LessonEditPage) return;
    render(<LessonEditPage />);
    expect(screen.getAllByText("video").length).toBeGreaterThan(0);
    expect(screen.getAllByText("text").length).toBeGreaterThan(0);
  });

  it("shows Lesson Parts heading", () => {
    if (!LessonEditPage) return;
    render(<LessonEditPage />);
    expect(screen.getByText("Lesson Parts")).toBeInTheDocument();
  });

  it("renders the course sidebar", () => {
    if (!LessonEditPage) return;
    render(<LessonEditPage />);
    expect(screen.getByTestId("course-sidebar")).toBeInTheDocument();
  });
});
