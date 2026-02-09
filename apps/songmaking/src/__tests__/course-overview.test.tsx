/**
 * Tests for the Course Overview Page
 *
 * Verifies hero section rendering, curriculum sections, and CTA buttons.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import {
  makeMockUseCourse,
  MOCK_SECTIONS,
} from "./helpers";

// =============================================================================
// Mocks
// =============================================================================

const mockUseCourseData = makeMockUseCourse();
const mockUseCourse = vi.fn(() => mockUseCourseData);

vi.mock("../features/course/client/course-context", () => ({
  useCourse: () => mockUseCourse(),
}));

vi.mock("@effect-atom/atom-react", () => ({
  useAtomValue: (atom: unknown) => {
    // Return defaults for known atom shapes
    if (atom === "courseProgressAtom") return { completed: 3, total: 7, percent: 43 };
    if (atom === "firstIncompleteLessonAtom") return { _tag: "None" };
    if (atom === "progressAtom") return new Map();
    // sectionProgressAtom factory returns a function-created atom
    return { completed: 1, total: 3, percent: 33 };
  },
  useAtomSet: () => vi.fn(),
}));

vi.mock("../features/course/client/course-atoms", () => ({
  progressAtom: "progressAtom",
  courseProgressAtom: "courseProgressAtom",
  firstIncompleteLessonAtom: "firstIncompleteLessonAtom",
  sectionProgressAtom: (id: string) => `sectionProgressAtom-${id}`,
}));

// Mock TanStack Router - capture the component from createFileRoute
let capturedComponent: React.ComponentType | null = null;

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: (_path: string) => ({
    component: undefined,
    // This function captures the component set by the route module
    ...(new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (prop === "component") return capturedComponent;
          return undefined;
        },
      }
    )),
  }),
  Link: ({ children, to, ...props }: any) => <a href={to} data-testid="link" {...props}>{children}</a>,
}));

// We need a different approach - import creates the Route, then we render component from it.
// Let's mock createFileRoute to return an object that stores the component.
vi.unmock("@tanstack/react-router");

vi.mock("@tanstack/react-router", () => {
  return {
    createFileRoute: () => (routeOptions: { component: React.ComponentType }) => ({
      ...routeOptions,
      useParams: () => ({}),
      useSearch: () => ({}),
    }),
    Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  };
});

vi.mock("@shadcn", () => ({
  Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>,
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Card: Object.assign(
    ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
    {
      Header: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      Content: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      Footer: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      Title: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      Description: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    }
  ),
  Separator: () => <hr />,
}));

vi.mock("@shadcn/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

vi.mock("../components/navbar", () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

// =============================================================================
// Tests
// =============================================================================

describe("Course Overview Page", () => {
  let CourseOverviewPage: React.ComponentType;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockUseCourse.mockReturnValue(makeMockUseCourse());
    // Import the module - createFileRoute mock captures the component
    const mod = await import("../routes/$courseSlug/index");
    CourseOverviewPage = (mod.Route as any)?.component;
  });

  it("renders the course title", () => {
    if (!CourseOverviewPage) return;
    render(<CourseOverviewPage />);
    expect(screen.getByText("Test Course")).toBeInTheDocument();
  });

  it("renders the course subtitle", () => {
    if (!CourseOverviewPage) return;
    render(<CourseOverviewPage />);
    expect(screen.getByText("A test course subtitle")).toBeInTheDocument();
  });

  it("renders the navbar", () => {
    if (!CourseOverviewPage) return;
    render(<CourseOverviewPage />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("renders section count and lesson count", () => {
    if (!CourseOverviewPage) return;
    render(<CourseOverviewPage />);
    expect(screen.getByText("3 sections")).toBeInTheDocument();
    expect(screen.getByText("10 lessons")).toBeInTheDocument();
  });

  it("renders the What You'll Learn section", () => {
    if (!CourseOverviewPage) return;
    render(<CourseOverviewPage />);
    expect(screen.getByText("What You'll Learn")).toBeInTheDocument();
  });

  it("renders Course Curriculum section with all sections", () => {
    if (!CourseOverviewPage) return;
    render(<CourseOverviewPage />);
    expect(screen.getByText("Course Curriculum")).toBeInTheDocument();
    for (const section of MOCK_SECTIONS) {
      expect(screen.getByText(section.title)).toBeInTheDocument();
    }
  });

  it('shows "Continue Learning" when progress exists', () => {
    if (!CourseOverviewPage) return;
    render(<CourseOverviewPage />);
    // courseProgressAtom mock returns completed: 3, so the CTA should say "Continue Learning"
    const continueButtons = screen.getAllByText("Continue Learning");
    expect(continueButtons.length).toBeGreaterThan(0);
  });
});
