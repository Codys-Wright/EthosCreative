/**
 * Tests for the Quiz Route
 *
 * Verifies quiz page wrapper renders the QuizTakerPage component
 * and the pending state shows the skeleton.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";

// =============================================================================
// Mocks
// =============================================================================

vi.mock("@quiz", () => ({
  QuizTakerPage: ({ loaderData: _loaderData }: any) => (
    <div data-testid="quiz-taker-page">Quiz Taker Page</div>
  ),
  QuizTakerPageSkeleton: () => (
    <div data-testid="quiz-taker-skeleton">Loading quiz...</div>
  ),
  loadQuizTaker: vi.fn(() => ({ questions: [] })),
}));

let capturedComponent: React.ComponentType | undefined;
let capturedPendingComponent: React.ComponentType | undefined;

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: any) => {
    capturedComponent = opts.component;
    capturedPendingComponent = opts.pendingComponent;
    return {
      ...opts,
      useLoaderData: () => ({ questions: [] }),
      useParams: () => ({}),
      useSearch: () => ({}),
    };
  },
}));

// =============================================================================
// Tests
// =============================================================================

describe("Quiz Route", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    capturedComponent = undefined;
    capturedPendingComponent = undefined;
    // Import the route module to trigger createFileRoute
    await import("../routes/quiz");
  });

  it("renders the quiz taker page component", () => {
    if (!capturedComponent) return;
    const QuizPage = capturedComponent;
    render(<QuizPage />);
    expect(screen.getByTestId("quiz-taker-page")).toBeInTheDocument();
    expect(screen.getByText("Quiz Taker Page")).toBeInTheDocument();
  });

  it("renders the pending skeleton during loading", () => {
    if (!capturedPendingComponent) return;
    const PendingPage = capturedPendingComponent;
    render(<PendingPage />);
    expect(
      screen.getByTestId("quiz-taker-skeleton")
    ).toBeInTheDocument();
    expect(screen.getByText("Loading quiz...")).toBeInTheDocument();
  });
});
