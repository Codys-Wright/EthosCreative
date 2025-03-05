"use server";

import { db } from "@/lib/db";
import { artistType } from "@/lib/db/schema";
import { eq, asc, desc, isNull } from "drizzle-orm";
import { LandingPageArtistType } from "../utils/landing-page-helpers";

/**
 * Get all artist types directly from the database
 * This is a server function that can be called from server components
 */
export async function getArtistTypes(): Promise<LandingPageArtistType[]> {
  try {
    // Query artist types that are not deleted, ordered by the order field
    const types = await db.query.artistType.findMany({
      where: isNull(artistType.deletedAt),
      orderBy: [asc(artistType.order), asc(artistType.title)],
    });

    if (!types || types.length === 0) {
      console.warn("No artist types found in database");
      return [];
    }

    // Transform to landing page format
    return types.map((type) => ({
      id: type.id,
      name: type.title || "Untitled Artist Type",
      shortDescription: type.elevatorPitch || type.description || "",
      image: type.imageUrl || "/placeholder.svg",
      order: typeof type.order === "number" ? type.order : 999,
    }));
  } catch (error) {
    console.error("Error fetching artist types from database:", error);
    throw new Error("Failed to fetch artist types");
  }
}

/**
 * Get a specific artist type by ID
 */
export async function getArtistTypeById(id: string) {
  try {
    const type = await db.query.artistType.findFirst({
      where: eq(artistType.id, id),
    });

    return type;
  } catch (error) {
    console.error(`Error fetching artist type with id ${id}:`, error);
    throw new Error(`Failed to fetch artist type with id ${id}`);
  }
}

/**
 * Get artist types for the artist type page
 * More detailed format than landing page
 */
export async function getArtistTypesForAdmin() {
  try {
    // Get all non-deleted types
    const types = await db.query.artistType.findMany({
      where: isNull(artistType.deletedAt),
      orderBy: [asc(artistType.order), asc(artistType.title)],
    });

    return types;
  } catch (error) {
    console.error("Error fetching artist types for admin:", error);
    throw new Error("Failed to fetch artist types for admin");
  }
}

/**
 * Get mock data for landing page
 * Used as fallback when database is not available
 */
export async function getMockArtistTypesForLanding(): Promise<
  LandingPageArtistType[]
> {
  // Mock data doesn't need to be async in practice, but server actions require async functions
  return [
    {
      id: "mock-1",
      name: "The Visionary Artist",
      shortDescription:
        "The Visionary Artist has a unique ability to envision the whole and work backwards to the parts.",
      image: "/artist-type-coins/1-visionary.svg",
      order: 1,
    },
    {
      id: "mock-2",
      name: "The Consummate Artist",
      shortDescription:
        "The Consummate Artist is as creative as they are technically proficient. They have good aesthetic taste and a meticulous approach to their craft.",
      image: "/artist-type-coins/2-consumate-pro.svg",
      order: 2,
    },
    {
      id: "mock-3",
      name: "The Analyzer Artist",
      shortDescription:
        "This artist has a sharp mind and cares deeply about their work. They carefully consider it from every possible angle.",
      image: "/artist-type-coins/3-analyzer.svg",
      order: 3,
    },
    {
      id: "mock-4",
      name: "The Tech Artist",
      shortDescription:
        "Not only is The Tech Artist a deeply creative and expressive artist, but more so than most, they also have an instinctual understanding of technology.",
      image: "/artist-type-coins/4-tech.svg",
      order: 4,
    },
    {
      id: "mock-5",
      name: "The Entertainer Artist",
      shortDescription:
        "The Entertainer Artist lives to perform. Whether for a huge audience or just one person, they thrive on sharing their talents with people.",
      image: "/artist-type-coins/5-entertainer.svg",
      order: 5,
    },
  ];
}
