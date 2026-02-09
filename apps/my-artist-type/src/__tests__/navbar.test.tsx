/**
 * Tests for the Navbar Component
 *
 * Verifies navigation links, auth-aware buttons,
 * and quiz button behavior.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";

// =============================================================================
// Mocks
// =============================================================================

let mockLastResponseId: string | null = null;
let mockIsAdmin = false;
let mockIsAnonymous = false;

vi.mock("@effect-atom/atom-react", () => ({
  useAtomValue: (atom: unknown) => {
    if (atom === "lastResponseIdAtom") return mockLastResponseId;
    if (atom === "isAdminAtom") return mockIsAdmin;
    if (atom === "isAnonymousAtom") return mockIsAnonymous;
    return undefined;
  },
}));

vi.mock("@quiz", () => ({
  lastResponseIdAtom: "lastResponseIdAtom",
}));

vi.mock("@auth", () => ({
  SignedIn: ({ children }: any) => <>{children}</>,
  SignedOut: ({ children: _children }: any) => null,
  UserButton: ({ size: _size }: any) => <div data-testid="user-button">User</div>,
  isAdminAtom: "isAdminAtom",
  isAnonymousAtom: "isAnonymousAtom",
}));

vi.mock("@core/client", () => ({
  useHydrated: () => true,
}));

vi.mock("@theme", () => ({
  ModeToggle: () => <button data-testid="mode-toggle">Toggle Theme</button>,
}));

vi.mock("@components", () => ({
  Navbar: ({ children, ...props }: any) => (
    <nav data-testid="navbar" {...props}>
      {children}
    </nav>
  ),
  NavBody: ({ children }: any) => (
    <div data-testid="nav-body">{children}</div>
  ),
  NavbarLogo: () => <div data-testid="navbar-logo">Logo</div>,
  NavbarButton: ({ children, href, ...props }: any) => (
    <a href={href} data-testid="navbar-button" {...props}>
      {children}
    </a>
  ),
  MobileNav: ({ children }: any) => (
    <div data-testid="mobile-nav">{children}</div>
  ),
  MobileNavHeader: ({ children }: any) => <div>{children}</div>,
  MobileNavMenu: ({ children, isOpen }: any) =>
    isOpen ? <div>{children}</div> : null,
  MobileNavToggle: ({ onClick }: any) => (
    <button onClick={onClick} data-testid="mobile-toggle">
      Menu
    </button>
  ),
}));

vi.mock("motion/react", () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
  },
}));

// =============================================================================
// Tests
// =============================================================================

describe("NavbarHome", () => {
  let NavbarHome: React.ComponentType<{ children?: React.ReactNode }>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockLastResponseId = null;
    mockIsAdmin = false;
    mockIsAnonymous = false;
    const mod = await import("../features/landing/navbar");
    NavbarHome = mod.NavbarHome;
  });

  it("renders the navbar", () => {
    render(<NavbarHome />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("shows main nav items", () => {
    render(<NavbarHome />);
    expect(screen.getByText("Artist Types")).toBeInTheDocument();
    expect(screen.getByText("Quiz")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("shows Take the Quiz button when no results", () => {
    mockLastResponseId = null;
    render(<NavbarHome />);
    expect(screen.getByText("Take the Quiz!")).toBeInTheDocument();
  });

  it("shows My Results button when user has results", () => {
    mockLastResponseId = "response-123";
    render(<NavbarHome />);
    expect(screen.getByText("My Results")).toBeInTheDocument();
  });

  it("shows Admin link when user is admin", () => {
    mockIsAdmin = true;
    render(<NavbarHome />);
    const adminLinks = screen.getAllByText("Admin");
    expect(adminLinks.length).toBeGreaterThan(0);
  });

  it("hides Admin link when user is not admin", () => {
    mockIsAdmin = false;
    render(<NavbarHome />);
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("renders the theme toggle", () => {
    render(<NavbarHome />);
    expect(screen.getByTestId("mode-toggle")).toBeInTheDocument();
  });

  it("renders children passed to it", () => {
    render(
      <NavbarHome>
        <div data-testid="child-content">Page Content</div>
      </NavbarHome>
    );
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });
});
