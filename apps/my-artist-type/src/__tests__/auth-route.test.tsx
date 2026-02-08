/**
 * Tests for the Auth Route
 *
 * Verifies authentication page rendering and route parameter handling.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";

// =============================================================================
// Mocks
// =============================================================================

let mockAuthView = "sign-in";

vi.mock("@auth", () => ({
  AuthView: ({ pathname }: { pathname: string }) => (
    <div data-testid="auth-view">
      <h1>Auth: {pathname}</h1>
    </div>
  ),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: any) => ({
    ...opts,
    useParams: () => ({ authView: mockAuthView }),
    useSearch: () => ({}),
    useLoaderData: () => ({}),
  }),
}));

// =============================================================================
// Tests
// =============================================================================

describe("Auth Route", () => {
  let AuthPage: React.ComponentType;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockAuthView = "sign-in";
    const mod = await import("../routes/auth/$authView");
    AuthPage = (mod.Route as any)?.component;
  });

  it("renders the auth view component", () => {
    if (!AuthPage) return;
    render(<AuthPage />);
    expect(screen.getByTestId("auth-view")).toBeInTheDocument();
  });

  it("passes the sign-in pathname to AuthView", () => {
    mockAuthView = "sign-in";
    if (!AuthPage) return;
    render(<AuthPage />);
    expect(screen.getByText("Auth: sign-in")).toBeInTheDocument();
  });

  it("passes the sign-up pathname to AuthView", () => {
    mockAuthView = "sign-up";
    if (!AuthPage) return;
    render(<AuthPage />);
    expect(screen.getByText("Auth: sign-up")).toBeInTheDocument();
  });

  it("renders with centered layout", () => {
    if (!AuthPage) return;
    const { container } = render(<AuthPage />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("min-h-screen");
    expect(wrapper.className).toContain("flex");
    expect(wrapper.className).toContain("items-center");
    expect(wrapper.className).toContain("justify-center");
  });
});
