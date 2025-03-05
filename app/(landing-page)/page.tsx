import { HeroSection } from "../../landing-page/components/HeroSection";
import { ArtistTypeFolddown } from "../../landing-page/components/ArtistTypeFolddown";
import { ArtistTypeScroller } from "../../landing-page/components/ArtistTypeScroller";
import {
  getArtistTypes,
  getMockArtistTypesForLanding,
} from "@/features/artist-types/server/artist-type.server";

// Define metadata for SEO
export const metadata = {
  title: "Artist Types",
  description: "Discover your unique artist type and creative style",
};

// Server Component
export default async function Home() {
  // Fetch artist types from the database using server functions
  let artistTypes = [];

  try {
    // Fetch artist types from the database
    artistTypes = await getArtistTypes();

    // If no types found, use mock data
    if (!artistTypes || artistTypes.length === 0) {
      console.log("No artist types found, falling back to mock data");
      artistTypes = getMockArtistTypesForLanding();
    }
  } catch (error) {
    console.error("Error loading artist types:", error);
    // Fallback to mock data on error
    artistTypes = getMockArtistTypesForLanding();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Artist Type Scroller */}
        <ArtistTypeScroller artistTypes={artistTypes} />

        {/* Artist Type Folddown */}
        <ArtistTypeFolddown artistTypes={artistTypes} />
      </main>
    </div>
  );
}
