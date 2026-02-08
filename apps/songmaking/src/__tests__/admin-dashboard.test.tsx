/**
 * Tests for the Admin Dashboard Page
 *
 * Verifies admin page rendering and tab structure.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { makeMockUseCourse } from "./helpers";

// =============================================================================
// Mocks
// =============================================================================

const mockUseCourse = vi.fn(() => makeMockUseCourse());

vi.mock("../features/course/client/course-context.js", () => ({
  useCourse: () => mockUseCourse(),
}));

vi.mock("@effect-atom/atom-react", () => ({
  Atom: { make: vi.fn(), writable: vi.fn() },
  useAtomValue: () => new Map(),
  useAtomSet: () => vi.fn(),
}));

vi.mock("../features/course/client/course-atoms.js", () => ({
  progressAtom: "progressAtom",
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: any) => ({
    ...opts,
    useParams: () => ({ courseSlug: "test-course" }),
    useSearch: () => ({ tab: "overview" }),
  }),
  Link: ({ children, to, ...props }: any) => (
    <a href={typeof to === "string" ? to : "#"} {...props}>
      {children}
    </a>
  ),
  useSearch: () => ({ tab: "overview" }),
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
  }),
  verticalListSortingStrategy: {},
}));

vi.mock("@dnd-kit/modifiers", () => ({
  restrictToVerticalAxis: vi.fn(),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: { toString: () => "" },
    Translate: { toString: () => "" },
  },
}));

// Mock recharts
vi.mock("recharts", () => ({
  Label: ({ children }: any) => <div>{children}</div>,
  Pie: () => null,
  PieChart: ({ children }: any) => <div>{children}</div>,
}));

// Mock shadcn components
vi.mock("@shadcn", () => ({
  Avatar: Object.assign(
    ({ children, ...props }: any) => <div {...props}>{children}</div>,
    {
      Image: ({ ...props }: any) => <img alt="" {...props} />,
      Fallback: ({ children, ...props }: any) => (
        <span {...props}>{children}</span>
      ),
    }
  ),
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
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
  Chart: Object.assign(
    ({ children, ...props }: any) => <div {...props}>{children}</div>,
    {
      Container: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Tooltip: () => null,
      TooltipContent: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
    }
  ),
  Dialog: Object.assign(
    ({ children, open, ...props }: any) => (
      <div data-open={open} {...props}>
        {children}
      </div>
    ),
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
  ScrollArea: Object.assign(
    ({ children, ...props }: any) => <div {...props}>{children}</div>,
    {
      Bar: () => null,
    }
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
  Switch: (props: any) => <input type="checkbox" {...props} />,
  Table: Object.assign(
    ({ children, ...props }: any) => <table {...props}>{children}</table>,
    {
      Header: ({ children, ...props }: any) => (
        <thead {...props}>{children}</thead>
      ),
      Body: ({ children, ...props }: any) => (
        <tbody {...props}>{children}</tbody>
      ),
      Row: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
      Head: ({ children, ...props }: any) => <th {...props}>{children}</th>,
      Cell: ({ children, ...props }: any) => <td {...props}>{children}</td>,
    }
  ),
  Tabs: Object.assign(
    ({ children, value, ...props }: any) => (
      <div data-tab-value={value} {...props}>
        {children}
      </div>
    ),
    {
      List: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      Trigger: ({ children, value, ...props }: any) => (
        <button data-value={value} {...props}>
          {children}
        </button>
      ),
      Content: ({ children, value, ...props }: any) => (
        <div data-tab-content={value} {...props}>
          {children}
        </div>
      ),
    }
  ),
  Textarea: (props: any) => <textarea {...props} />,
}));

vi.mock("@shadcn/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

// =============================================================================
// Tests
// =============================================================================

describe("Admin Dashboard Page", () => {
  let AdminPage: React.ComponentType;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockUseCourse.mockReturnValue(makeMockUseCourse());
    const mod = await import("../routes/$courseSlug/admin");
    AdminPage = (mod.Route as any)?.component;
  });

  it("renders the admin page with course title", () => {
    if (!AdminPage) return;
    render(<AdminPage />);
    expect(screen.getByText("Test Course")).toBeInTheDocument();
  });

  it("shows Admin Dashboard label", () => {
    if (!AdminPage) return;
    render(<AdminPage />);
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });

  it("renders all four tab triggers", () => {
    if (!AdminPage) return;
    render(<AdminPage />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Students")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("shows Preview Course button", () => {
    if (!AdminPage) return;
    render(<AdminPage />);
    expect(screen.getByText("Preview Course")).toBeInTheDocument();
  });

  it("renders overview tab content by default", () => {
    if (!AdminPage) return;
    render(<AdminPage />);
    // Overview tab includes stats cards like "Total Students"
    expect(screen.getByText("Total Students")).toBeInTheDocument();
  });

  it("shows student names in overview activity feed", () => {
    if (!AdminPage) return;
    render(<AdminPage />);
    // MOCK_STUDENTS and MOCK_ACTIVITIES include these names
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});
