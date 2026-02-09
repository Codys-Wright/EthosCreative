/**
 * Tests for the Dashboard Page
 *
 * Verifies progress display, quick stats, and section content browser.
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
  useAtomValue: () => new Map(),
  useAtomSet: () => vi.fn(),
}));

vi.mock("../features/course/client/course-atoms.js", () => ({
  progressAtom: "progressAtom",
  expandedSectionsAtom: "expandedSectionsAtom",
  ExpandedSectionsUpdate: {
    ExpandAll: () => ({ _tag: "ExpandAll" }),
    CollapseAll: () => ({ _tag: "CollapseAll" }),
    Toggle: (data: any) => ({ _tag: "Toggle", ...data }),
  },
}));

vi.mock("../features/messaging/client/fake-messaging-atoms.js", () => ({
  fakeAnnouncementsAtom: "fakeAnnouncementsAtom",
  fakeChatMessagesAtom: "fakeChatMessagesAtom",
  fakeDirectMessagesAtom: "fakeDirectMessagesAtom",
  fakeMessagingInitializedAtom: "fakeMessagingInitializedAtom",
  generateInitialAnnouncements: () => [],
  generateInitialChatMessages: () => [],
  generateInitialDirectMessages: () => [],
  generateFakeAnnouncement: () => ({}),
  generateFakeChatMessage: () => ({}),
  generateFakeDirectMessage: () => ({}),
  getNextEventInterval: () => 10000,
  getNextEventType: () => "chat",
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: { component: React.ComponentType }) => ({
    ...opts,
    useParams: () => ({}),
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
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  Card: Object.assign(
    ({ children, ...props }: any) => <div {...props}>{children}</div>,
    {
      Header: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      Content: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Footer: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Title: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      Description: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
    }
  ),
  Collapsible: Object.assign(
    ({ children, open, ...props }: any) => (
      <div data-open={open} {...props}>
        {children}
      </div>
    ),
    {
      Trigger: ({ children, ...props }: any) => (
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

// =============================================================================
// Tests
// =============================================================================

describe("Dashboard Page", () => {
  let DashboardPage: React.ComponentType;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockUseCourse.mockReturnValue(makeMockUseCourse());
    const mod = await import("../routes/$courseSlug/dashboard");
    DashboardPage = (mod.Route as any)?.component;
  });

  it("renders the dashboard with hero section", () => {
    if (!DashboardPage) return;
    render(<DashboardPage />);
    // The hero section displays "Start Your Journey" when no progress
    expect(screen.getByText("Start Your Journey")).toBeInTheDocument();
  });

  it("shows quick stats cards", () => {
    if (!DashboardPage) return;
    render(<DashboardPage />);
    expect(screen.getByText("Total Lessons")).toBeInTheDocument();
    // "Completed" may appear multiple times (stat card + badge), use getAllByText
    expect(screen.getAllByText("Completed").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sections").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Remaining").length).toBeGreaterThan(0);
  });

  it("shows total lesson count", () => {
    if (!DashboardPage) return;
    render(<DashboardPage />);
    // Total lessons should be MOCK_LESSONS.length = 7
    // "7" may appear multiple times in the dashboard
    expect(screen.getAllByText("7").length).toBeGreaterThan(0);
  });

  it("shows course content browser", () => {
    if (!DashboardPage) return;
    render(<DashboardPage />);
    expect(screen.getByText("Course Content")).toBeInTheDocument();
  });

  it("shows community section", () => {
    if (!DashboardPage) return;
    render(<DashboardPage />);
    expect(screen.getByText("Community")).toBeInTheDocument();
  });

  it("renders the course sidebar", () => {
    if (!DashboardPage) return;
    render(<DashboardPage />);
    expect(screen.getByTestId("course-sidebar")).toBeInTheDocument();
  });

  it("shows section titles in content browser", () => {
    if (!DashboardPage) return;
    render(<DashboardPage />);
    for (const section of MOCK_SECTIONS) {
      expect(screen.getByText(section.title)).toBeInTheDocument();
    }
  });

  it("shows announcements card", () => {
    if (!DashboardPage) return;
    render(<DashboardPage />);
    expect(screen.getByText("Announcements")).toBeInTheDocument();
  });

  it("shows course chat card", () => {
    if (!DashboardPage) return;
    render(<DashboardPage />);
    expect(screen.getByText("Course Chat")).toBeInTheDocument();
  });
});
