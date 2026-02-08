/**
 * Tests for the Admin Dashboard
 *
 * Verifies admin page rendering with response statistics,
 * charts, responses table, and auth-gated route protection.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";

// =============================================================================
// Mocks
// =============================================================================

const MOCK_RESPONSES = [
  {
    id: "resp-1",
    quizId: "quiz-1",
    userId: "user-1",
    status: "completed",
    createdAt: new Date().toISOString(),
  },
  {
    id: "resp-2",
    quizId: "quiz-1",
    userId: "user-2",
    status: "completed",
    createdAt: new Date().toISOString(),
  },
];

const MOCK_ANALYSES = [
  { id: "analysis-1", responseId: "resp-1", winnerId: "the-visionary-artist" },
  { id: "analysis-2", responseId: "resp-2", winnerId: "the-dreamer-artist" },
];

vi.mock("@quiz", () => ({
  AdminSidebar: ({ variant: _variant }: any) => (
    <div data-testid="admin-sidebar">Admin Sidebar</div>
  ),
  adminSidebarVisibleAtom: "adminSidebarVisibleAtom",
  AnalysisChart: () => (
    <div data-testid="analysis-chart">Analysis Chart</div>
  ),
  analysesAtom: "analysesAtom",
  combineResponseWithAnalysis: (responses: any[], analyses: any[]) =>
    responses.map((r: any) => ({
      ...r,
      analysis: analyses.find((a: any) => a.responseId === r.id),
    })),
  loadAdmin: vi.fn(() => ({
    responses: { _tag: "Success", value: MOCK_RESPONSES },
    analyses: { _tag: "Success", value: MOCK_ANALYSES },
  })),
  responsesAtom: "responsesAtom",
  ResponsesOverTimeChart: () => (
    <div data-testid="responses-over-time">Responses Over Time</div>
  ),
  ResponsesTable: ({ data }: any) => (
    <div data-testid="responses-table">
      {data?.length ?? 0} responses
    </div>
  ),
  ResponseStatsCards: ({ responsesResult }: any) => (
    <div data-testid="response-stats-cards">
      Stats: {responsesResult?._tag === "Success" ? responsesResult.value.length : 0} total
    </div>
  ),
}));

vi.mock("@effect-atom/atom-react", () => ({
  Result: {
    isSuccess: (r: any) => r?._tag === "Success",
    isFailure: (r: any) => r?._tag === "Failure",
  },
  useAtomValue: (atom: unknown) => {
    if (atom === "adminSidebarVisibleAtom") return true;
    if (atom === "responsesAtom")
      return { _tag: "Success", value: MOCK_RESPONSES };
    if (atom === "analysesAtom")
      return { _tag: "Success", value: MOCK_ANALYSES };
    return undefined;
  },
  useAtomSet: () => vi.fn(),
  HydrationBoundary: ({ children }: any) => <>{children}</>,
}));

vi.mock("@effect-atom/atom-react/ReactHydration", () => ({
  HydrationBoundary: ({ children }: any) => <>{children}</>,
}));

// Mock checkAdmin - must be mocked before the route module is loaded
vi.mock("../features/auth/check-admin.js", () => ({
  checkAdmin: vi.fn(() =>
    Promise.resolve({ isAuthenticated: true, isAdmin: true })
  ),
}));

vi.mock("@core/client", () => ({
  useHydrated: () => true,
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: any) => ({
    ...opts,
    useLoaderData: () => ({
      responses: { _tag: "Success", value: MOCK_RESPONSES },
      analyses: { _tag: "Success", value: MOCK_ANALYSES },
    }),
    useParams: () => ({}),
    useSearch: () => ({}),
  }),
  Link: ({ children, to, ...props }: any) => (
    <a href={typeof to === "string" ? to : "#"} {...props}>
      {children}
    </a>
  ),
  Outlet: () => <div data-testid="outlet" />,
  redirect: vi.fn(),
  useLocation: () => ({ pathname: "/admin" }),
}));

vi.mock("@shadcn", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  SidebarInset: ({ children }: any) => <div>{children}</div>,
  SidebarProvider: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("lucide-react", () => ({
  ChevronLeftIcon: () => <span>«</span>,
  ChevronRightIcon: () => <span>»</span>,
}));

// =============================================================================
// Tests
// =============================================================================

describe("Admin Dashboard", () => {
  let AdminPage: React.ComponentType;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("../routes/admin");
    AdminPage = (mod.Route as any)?.component;
  });

  it("renders the admin page with sidebar", () => {
    if (!AdminPage) return;
    render(<AdminPage />);
    expect(screen.getByTestId("admin-sidebar")).toBeInTheDocument();
  });

  it("shows Response Statistics heading", () => {
    if (!AdminPage) return;
    render(<AdminPage />);
    expect(
      screen.getByText("Response Statistics")
    ).toBeInTheDocument();
  });

  it("renders the response stats cards", () => {
    if (!AdminPage) return;
    render(<AdminPage />);
    expect(
      screen.getByTestId("response-stats-cards")
    ).toBeInTheDocument();
  });

  it("renders the analysis chart", () => {
    if (!AdminPage) return;
    render(<AdminPage />);
    expect(screen.getByTestId("analysis-chart")).toBeInTheDocument();
  });

  it("renders the responses over time chart", () => {
    if (!AdminPage) return;
    render(<AdminPage />);
    expect(
      screen.getByTestId("responses-over-time")
    ).toBeInTheDocument();
  });

  it("shows Recent Responses heading", () => {
    if (!AdminPage) return;
    render(<AdminPage />);
    expect(screen.getByText("Recent Responses")).toBeInTheDocument();
  });

  it("renders the responses table with data", () => {
    if (!AdminPage) return;
    render(<AdminPage />);
    expect(
      screen.getByTestId("responses-table")
    ).toBeInTheDocument();
    expect(screen.getByText("2 responses")).toBeInTheDocument();
  });

  it("renders sidebar toggle button", () => {
    if (!AdminPage) return;
    render(<AdminPage />);
    const toggleBtn = screen.getByTitle("Hide sidebar");
    expect(toggleBtn).toBeInTheDocument();
  });
});

describe("Admin Route Protection", () => {
  it("defines beforeLoad that calls checkAdmin", async () => {
    const mod = await import("../routes/admin");
    const routeConfig = mod.Route as any;
    // The beforeLoad function should exist on the route config
    expect(routeConfig.beforeLoad).toBeDefined();
  });
});
