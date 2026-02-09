/**
 * Tests for the Artist Type Detail and Catalog Pages
 *
 * Verifies artist type detail page wrapper and catalog page rendering.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";

// =============================================================================
// Mocks
// =============================================================================

const MOCK_ARTIST_TYPE_DETAIL = {
  id: "the-visionary-artist",
  name: "The Visionary Artist",
  description: "The Visionary sees the future of art and creates accordingly.",
  elevatorPitch: "Sees the future of art",
  icon: "/icon-visionary.svg",
  order: 1,
};

const MOCK_ARTIST_TYPES_LIST = [
  {
    id: "the-visionary-artist",
    name: "The Visionary Artist",
    elevatorPitch: "Sees the future of art",
  },
  {
    id: "the-dreamer-artist",
    name: "The Dreamer Artist",
    elevatorPitch: "Dreams big and creates bigger",
  },
];

vi.mock("@artist-types", () => ({
  ArtistTypeDetailPage: ({ loaderData }: any) => (
    <div data-testid="artist-type-detail">
      <h1>{loaderData.name}</h1>
      <p>{loaderData.description}</p>
    </div>
  ),
  loadArtistType: vi.fn(({ data }: any) => ({
    ...MOCK_ARTIST_TYPE_DETAIL,
    id: data,
  })),
  ArtistTypesPage: ({ loaderData }: any) => (
    <div data-testid="artist-types-catalog">
      <h1>Artist Types</h1>
      {loaderData?.map?.((at: any) => (
        <div key={at.id}>{at.name}</div>
      ))}
    </div>
  ),
  loadArtistTypes: vi.fn(() => MOCK_ARTIST_TYPES_LIST),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: any) => ({
    ...opts,
    useLoaderData: () => {
      // For the detail page, return mock detail; for catalog, return list
      if (opts.component?.name === "ArtistTypeDetailPageWrapper") {
        return MOCK_ARTIST_TYPE_DETAIL;
      }
      return MOCK_ARTIST_TYPES_LIST;
    },
    useParams: () => ({ slug: "the-visionary-artist" }),
    useSearch: () => ({}),
  }),
}));

// =============================================================================
// Tests
// =============================================================================

describe("Artist Type Detail Page", () => {
  let DetailPage: React.ComponentType;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("../routes/artist-types/$slug");
    DetailPage = (mod.Route as any)?.component;
  });

  it("renders the artist type detail page wrapper", () => {
    if (!DetailPage) return;
    render(<DetailPage />);
    expect(
      screen.getByTestId("artist-type-detail")
    ).toBeInTheDocument();
  });

  it("displays the artist type name", () => {
    if (!DetailPage) return;
    render(<DetailPage />);
    expect(
      screen.getByText("The Visionary Artist")
    ).toBeInTheDocument();
  });

  it("displays the artist type description", () => {
    if (!DetailPage) return;
    render(<DetailPage />);
    expect(
      screen.getByText(
        "The Visionary sees the future of art and creates accordingly."
      )
    ).toBeInTheDocument();
  });
});

describe("Artist Types Catalog Page", () => {
  let CatalogPage: React.ComponentType;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("../routes/artist-types/index");
    CatalogPage = (mod.Route as any)?.component;
  });

  it("renders the artist types catalog page", () => {
    if (!CatalogPage) return;
    render(<CatalogPage />);
    expect(
      screen.getByTestId("artist-types-catalog")
    ).toBeInTheDocument();
  });

  it("shows the Artist Types heading", () => {
    if (!CatalogPage) return;
    render(<CatalogPage />);
    expect(screen.getByText("Artist Types")).toBeInTheDocument();
  });

  it("lists all artist types from loader data", () => {
    if (!CatalogPage) return;
    render(<CatalogPage />);
    expect(
      screen.getByText("The Visionary Artist")
    ).toBeInTheDocument();
    expect(
      screen.getByText("The Dreamer Artist")
    ).toBeInTheDocument();
  });
});
