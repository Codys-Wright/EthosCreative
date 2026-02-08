/**
 * Tests for the Results Page
 *
 * Verifies shareable results URL encoding/decoding,
 * error handling for invalid data, and results display.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";

// =============================================================================
// Mocks
// =============================================================================

const mockDecodeResultsFromShare = vi.fn();
let mockSearchParams: { d?: string } = {};

vi.mock("@quiz", () => ({
  MyResponsePage: ({ artistData, winnerId }: any) => (
    <div data-testid="my-response-page">
      <span>Results for {winnerId}</span>
      {artistData?.map?.((d: any) => (
        <span key={d.artistType}>{d.artistType}: {d.percentage}%</span>
      ))}
    </div>
  ),
  MyResponsePageLoading: () => (
    <div data-testid="response-loading">Loading results...</div>
  ),
  decodeResultsFromShare: (...args: any[]) =>
    mockDecodeResultsFromShare(...args),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: any) => ({
    ...opts,
    useLoaderData: () => ({}),
    useParams: () => ({}),
    useSearch: () => ({}),
  }),
  useSearch: () => mockSearchParams,
}));

// =============================================================================
// Tests
// =============================================================================

describe("Results Page", () => {
  let ResultsPage: React.ComponentType;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSearchParams = {};
    mockDecodeResultsFromShare.mockReset();

    const mod = await import("../routes/results");
    ResultsPage = (mod.Route as any)?.component;
  });

  it("shows error when no data parameter is provided", async () => {
    mockSearchParams = {};
    render(<ResultsPage />);
    // The effect runs and sets error state
    expect(
      await screen.findByText("Invalid Results Link")
    ).toBeInTheDocument();
    expect(
      screen.getByText("No results data found in URL")
    ).toBeInTheDocument();
  });

  it("shows error when decoding fails (returns null)", async () => {
    mockSearchParams = { d: "invalid-base64-data" };
    mockDecodeResultsFromShare.mockReturnValue(null);
    render(<ResultsPage />);
    expect(
      await screen.findByText("Invalid Results Link")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Failed to decode results from URL")
    ).toBeInTheDocument();
  });

  it("shows error when decoding throws an exception", async () => {
    mockSearchParams = { d: "corrupted-data" };
    mockDecodeResultsFromShare.mockImplementation(() => {
      throw new Error("Parse error");
    });
    render(<ResultsPage />);
    expect(
      await screen.findByText("Invalid Results Link")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Invalid or corrupted results data")
    ).toBeInTheDocument();
  });

  it("shows Take the quiz link on error pages", async () => {
    mockSearchParams = {};
    render(<ResultsPage />);
    const link = await screen.findByText("Take the quiz yourself");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/quiz");
  });

  it("renders results when valid data is decoded", async () => {
    const mockResults = {
      artistData: [
        {
          artistType: "Visionary",
          fullName: "The Visionary Artist",
          databaseId: "the-visionary-artist",
          percentage: 25,
          points: 500,
        },
        {
          artistType: "Dreamer",
          fullName: "The Dreamer Artist",
          databaseId: "the-dreamer-artist",
          percentage: 20,
          points: 400,
        },
      ],
      winnerId: "the-visionary-artist",
    };
    mockSearchParams = { d: "valid-encoded-data" };
    mockDecodeResultsFromShare.mockReturnValue(mockResults);
    render(<ResultsPage />);

    expect(
      await screen.findByTestId("my-response-page")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Results for the-visionary-artist")
    ).toBeInTheDocument();
    expect(screen.getByText("Visionary: 25%")).toBeInTheDocument();
    expect(screen.getByText("Dreamer: 20%")).toBeInTheDocument();
  });

  it("calls decodeResultsFromShare with the d parameter", async () => {
    const mockResults = {
      artistData: [],
      winnerId: "test-winner",
    };
    mockSearchParams = { d: "test-encoded-data" };
    mockDecodeResultsFromShare.mockReturnValue(mockResults);
    render(<ResultsPage />);

    await screen.findByTestId("my-response-page");
    expect(mockDecodeResultsFromShare).toHaveBeenCalledWith(
      "test-encoded-data"
    );
  });
});
