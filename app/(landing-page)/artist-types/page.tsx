import { getArtistTypesForAdmin } from "@/features/artist-types/server/artist-type.server";
import { ArtistTypesEffectExample } from "./effect-example";
import { ImageWithFallback } from "@/landing-page/components/ImageWithFallback";

export const metadata = {
  title: "Artist Types | Server-Side Loading Examples",
  description:
    "Example of loading artist type data using server-side techniques",
};

export default async function ArtistTypesPage() {
  // Fetch artist types using direct Drizzle queries
  const artistTypes = await getArtistTypesForAdmin();

  return (
    <main className="min-h-screen bg-white px-4 py-12 dark:bg-neutral-950">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-center text-4xl font-bold text-neutral-900 dark:text-white md:text-5xl">
          Artist Types
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-neutral-600 dark:text-neutral-400">
          Server-side data loading examples with both Drizzle and Effect
        </p>

        {/* Example 1: Direct Drizzle Queries */}
        <div className="mb-12 rounded-lg bg-neutral-50 p-6 dark:bg-neutral-900">
          <h2 className="mb-4 text-2xl font-semibold">
            Direct Drizzle Query Example
          </h2>
          <p className="mb-6 text-neutral-600 dark:text-neutral-400">
            This data is loaded directly via Drizzle queries in a server
            component
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artistTypes.map((type) => (
              <div
                key={type.id}
                className="group rounded-2xl bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-neutral-800"
              >
                {type.imageUrl && (
                  <div className="mb-3 flex justify-center">
                    <ImageWithFallback
                      src={type.imageUrl}
                      alt={type.title || "Artist Type"}
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                      fallbackSrc="/placeholder.svg"
                    />
                  </div>
                )}
                <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
                  {type.title}
                  {type.order !== null && (
                    <span className="ml-2 text-sm text-neutral-500">
                      (#{type.order})
                    </span>
                  )}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {type.elevatorPitch ||
                    type.description ||
                    "No description available"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Example 2: Effect Runtime */}
        <div className="rounded-lg bg-neutral-50 p-6 dark:bg-neutral-900">
          <h2 className="mb-4 text-2xl font-semibold">
            Effect Runtime Example
          </h2>
          <p className="mb-6 text-neutral-600 dark:text-neutral-400">
            This data is loaded using the Effect runtime with dependency
            injection
          </p>

          {/* Render the component that uses Effect */}
          <ArtistTypesEffectExample />
        </div>
      </div>
    </main>
  );
}
