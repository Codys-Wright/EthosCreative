import { ArtistTypeService } from "../api/artist-type.service";
import { Effect as E } from "effect";
import { ArtistTypeType } from "../types/artist-type.type";
import { Database } from "@/lib/db/db.service";

/**
 * Type for the landing page artist type format
 */
export interface LandingPageArtistType {
  id: string;
  name: string;
  shortDescription: string;
  image: string;
  order: number;
}

/**
 * Fetches artist types from the database for the landing page
 * @returns Promise<LandingPageArtistType[]> Array of artist types for display
 */
export async function getArtistTypesForLandingPage(): Promise<
  LandingPageArtistType[]
> {
  try {
    // Create the full service layer with proper initialization
    const program = E.gen(function* (_) {
      // Initialize database service first
      const db = yield* Database;

      // Use ArtistTypeService to get all artist types
      const service = yield* ArtistTypeService;
      const artistTypes = yield* service.getAll();

      return artistTypes;
    });

    // Run the program with proper service initialization
    const artistTypes = await E.runPromise(program);

    if (!artistTypes || artistTypes.length === 0) {
      console.warn(
        "No artist types found in database, using mock data as fallback",
      );
      return getMockArtistTypes();
    }

    // Sort by order field (fallback to 999 if missing to push to the end)
    const sortedTypes = artistTypes.sort((a, b) => {
      const orderA = typeof a.order === "number" ? a.order : 999;
      const orderB = typeof b.order === "number" ? b.order : 999;
      return orderA - orderB;
    });

    // Map to landing page format
    return sortedTypes.map((artistType) => ({
      id: artistType.id,
      name: artistType.title || "Untitled Artist Type",
      shortDescription:
        artistType.elevatorPitch || artistType.description || "",
      image: artistType.imageUrl || "/placeholder.svg",
      order: typeof artistType.order === "number" ? artistType.order : 999,
    }));
  } catch (error) {
    console.error("Error fetching artist types for landing page:", error);
    // Return mock data as fallback when there's an error
    return getMockArtistTypes();
  }
}

/**
 * Returns mock artist type data for the landing page
 */
function getMockArtistTypes(): LandingPageArtistType[] {
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
    {
      id: "mock-6",
      name: "The Maverick Artist",
      shortDescription:
        "The Maverick Artist is individualistic and often unpredictable in their artistry. They're priority is to create unique and inventive work.",
      image: "/artist-type-coins/6-maverick.svg",
      order: 6,
    },
    {
      id: "mock-7",
      name: "The Dreamer Artist",
      shortDescription:
        "The Dreamer Artist is highly creative and has a vivid imagination. They thrive on delving deep into their internal world of creative invention.",
      image: "/artist-type-coins/7-dreamer.svg",
      order: 7,
    },
    {
      id: "mock-8",
      name: "The Feeler Artist",
      shortDescription:
        "The Feeler Artist is highly expressive and filters life & artistry through their emotions. They seek out and are fueled by inspiration.",
      image: "/artist-type-coins/8-feeler.svg",
      order: 8,
    },
    {
      id: "mock-9",
      name: "The Tortured Artist",
      shortDescription:
        "Though it may seem like a cliché, the archetype of the tortured artist actually fits this type well; they often genuinely suffer for their artistry.",
      image: "/artist-type-coins/9-tortured.svg",
      order: 9,
    },
    {
      id: "mock-10",
      name: "The Solo Artist",
      shortDescription:
        "The Solo Artist is the epitome of the serious, introspective, and thoughtful artist. Their work is highly personal and direct.",
      image: "/artist-type-coins/10-solo.svg",
      order: 10,
    },
  ];
}
