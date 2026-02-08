/**
 * Tests for the Landing Page
 *
 * Verifies hero section content, explore artist types section,
 * footer links, and overall landing page composition.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";

// =============================================================================
// Mocks
// =============================================================================

// Mock @quiz - used by hero section for ArtistTypeGraphCard
vi.mock("@quiz", () => ({
  ArtistTypeGraphCard: ({ data }: any) => (
    <div data-testid="artist-type-graph-card">
      {data?.map?.((d: any) => (
        <span key={d.artistType}>{d.artistType}</span>
      ))}
    </div>
  ),
  ArtistTypeGraphCardSkeleton: () => (
    <div data-testid="artist-type-graph-skeleton">Loading...</div>
  ),
  artistColors: {
    Visionary: { hex: "#FF6B6B" },
    Consummate: { hex: "#4ECDC4" },
  },
  getArtistColorHex: () => "#6366f1",
  lastResponseIdAtom: "lastResponseIdAtom",
}));

// Mock @artist-types - used by ExploreArtistTypes
const MOCK_ARTIST_TYPES = [
  {
    id: "the-visionary-artist",
    name: "The Visionary Artist",
    elevatorPitch: "Sees the future of art",
    icon: "/icon-visionary.svg",
    order: 1,
  },
  {
    id: "the-consummate-artist",
    name: "The Consummate Artist",
    elevatorPitch: "Master of the craft",
    icon: "/icon-consummate.svg",
    order: 2,
  },
  {
    id: "the-analyzer-artist",
    name: "The Analyzer Artist",
    elevatorPitch: "Deconstructs everything",
    icon: "/icon-analyzer.svg",
    order: 3,
  },
];

vi.mock("@artist-types", () => ({
  artistTypesAtom: "artistTypesAtom",
}));

// Mock @effect-atom/atom-react - return success result with mock artist types
vi.mock("@effect-atom/atom-react", () => ({
  useAtomValue: (atom: unknown) => {
    if (atom === "artistTypesAtom") {
      return { _tag: "Success", value: MOCK_ARTIST_TYPES };
    }
    if (atom === "lastResponseIdAtom") return null;
    if (atom === "isAdminAtom") return false;
    if (atom === "isAnonymousAtom") return false;
    return undefined;
  },
  useAtomSet: () => vi.fn(),
  Result: {
    isSuccess: (r: any) => r?._tag === "Success",
    isFailure: (r: any) => r?._tag === "Failure",
    builder: (result: any) => ({
      onInitial: function (fn: any) {
        if (!result || result._tag === "Initial") {
          (this as any)._rendered = fn();
        }
        return this;
      },
      onSuccess: function (fn: any) {
        if (result?._tag === "Success") {
          (this as any)._rendered = fn(result.value);
        }
        return this;
      },
      onFailure: function (fn: any) {
        if (result?._tag === "Failure") {
          (this as any)._rendered = fn(result.error);
        }
        return this;
      },
      render: function () {
        return (this as any)._rendered ?? null;
      },
    }),
  },
}));

// Mock @auth
vi.mock("@auth", () => ({
  SignedIn: ({ children: _children }: any) => null,
  SignedOut: ({ children }: any) => <>{children}</>,
  UserButton: () => <div>User</div>,
  isAdminAtom: "isAdminAtom",
  isAnonymousAtom: "isAnonymousAtom",
}));

// Mock @core/client
vi.mock("@core/client", () => ({
  useHydrated: () => true,
}));

// Mock @theme
vi.mock("@theme", () => ({
  ModeToggle: () => <button>Toggle Theme</button>,
}));

// Mock @components - navbar components
vi.mock("@components", () => ({
  Navbar: ({ children, ...props }: any) => (
    <nav {...props}>{children}</nav>
  ),
  NavBody: ({ children }: any) => <div>{children}</div>,
  NavbarLogo: () => <div>Logo</div>,
  NavbarButton: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  MobileNav: ({ children }: any) => <div>{children}</div>,
  MobileNavHeader: ({ children }: any) => <div>{children}</div>,
  MobileNavMenu: ({ children, isOpen }: any) =>
    isOpen ? <div>{children}</div> : null,
  MobileNavToggle: ({ onClick }: any) => (
    <button onClick={onClick}>Menu</button>
  ),
}));

// Mock motion/react
vi.mock("motion/react", () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
    span: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <span ref={ref} {...props}>
        {children}
      </span>
    )),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useReducedMotion: () => true,
}));

// Mock @shadcn
vi.mock("@shadcn", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
  Accordion: Object.assign(
    ({ children, ...props }: any) => <div {...props}>{children}</div>,
    {
      Item: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Trigger: ({ children, ...props }: any) => (
        <button {...props}>{children}</button>
      ),
      Content: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
    }
  ),
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  Skeleton: ({ className }: any) => <div className={className} />,
}));

vi.mock("@shadcn/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

// =============================================================================
// Tests
// =============================================================================

describe("Landing Page", () => {
  let LandingPage: React.ComponentType;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("../features/landing/landing.page");
    LandingPage = mod.LandingPage;
  });

  it("renders the landing page", () => {
    render(<LandingPage />);
    const matches = screen.getAllByText(/Discover your/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("shows the Artist Type heading text", () => {
    render(<LandingPage />);
    expect(screen.getByText("Artist Type")).toBeInTheDocument();
  });

  it("shows the Aristotle quote", () => {
    render(<LandingPage />);
    expect(
      screen.getByText(
        /Knowing yourself is the beginning of all wisdom/
      )
    ).toBeInTheDocument();
  });

  it("shows Take the quiz CTA button", () => {
    render(<LandingPage />);
    expect(screen.getByText("Take the quiz")).toBeInTheDocument();
  });

  it("shows Explore More CTA button", () => {
    render(<LandingPage />);
    expect(screen.getByText("Explore More")).toBeInTheDocument();
  });
});

describe("Explore Artist Types Section", () => {
  let ExploreArtistTypes: React.ComponentType;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("../features/landing/explore-artist-types");
    ExploreArtistTypes = mod.ExploreArtistTypes;
  });

  it("renders the Explore the Artist Types heading", () => {
    render(<ExploreArtistTypes />);
    expect(
      screen.getByText("Explore the Artist Types")
    ).toBeInTheDocument();
  });

  it("renders artist type names from atom data", () => {
    render(<ExploreArtistTypes />);
    for (const at of MOCK_ARTIST_TYPES) {
      expect(screen.getByText(at.name)).toBeInTheDocument();
    }
  });

  it("shows elevator pitches for artist types", () => {
    render(<ExploreArtistTypes />);
    for (const at of MOCK_ARTIST_TYPES) {
      expect(screen.getByText(at.elevatorPitch)).toBeInTheDocument();
    }
  });

  it("shows Learn more links for each artist type", () => {
    render(<ExploreArtistTypes />);
    const links = screen.getAllByText("Learn more");
    expect(links.length).toBe(MOCK_ARTIST_TYPES.length);
  });

  it("shows View All Artist Types button", () => {
    render(<ExploreArtistTypes />);
    expect(
      screen.getByText("View All Artist Types")
    ).toBeInTheDocument();
  });
});

describe("Footer", () => {
  let Footer: React.ComponentType;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("../features/landing/footer");
    Footer = mod.Footer;
  });

  it("renders the My Artist Type brand name", () => {
    render(<Footer />);
    expect(screen.getByText("My Artist Type")).toBeInTheDocument();
  });

  it("shows quiz section links", () => {
    render(<Footer />);
    expect(screen.getByText("Take the Quiz")).toBeInTheDocument();
    expect(screen.getByText("Artist Types")).toBeInTheDocument();
    expect(screen.getByText("My Results")).toBeInTheDocument();
  });

  it("shows company section links", () => {
    render(<Footer />);
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
  });

  it("shows social connect links", () => {
    render(<Footer />);
    expect(screen.getByText("Facebook")).toBeInTheDocument();
    expect(screen.getByText("Instagram")).toBeInTheDocument();
    expect(screen.getByText("YouTube")).toBeInTheDocument();
  });

  it("shows copyright text", () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${year}`))
    ).toBeInTheDocument();
  });
});
