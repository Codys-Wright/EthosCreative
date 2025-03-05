"use client";

import { Effect } from "effect";
import { runServerEffect } from "@/lib/server-runtime";
import { ArtistTypeService } from "@/features/artist-types/api/artist-type.service";
import { useEffect, useState } from "react";
import { ImageWithFallback } from "@/landing-page/components/ImageWithFallback";

/**
 * Client component that uses Effect runtime to fetch data
 */
export function ArtistTypesEffectExample() {
  const [artistTypes, setArtistTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Create an Effect program to fetch artist types
        const program = Effect.gen(function* (_) {
          const service = yield* ArtistTypeService;
          const artistTypes = yield* service.getAll();
          return artistTypes;
        });

        // Run the Effect program with server runtime
        const data = await runServerEffect(program);
        setArtistTypes(data);
      } catch (err) {
        console.error("Error fetching artist types:", err);
        setError("Failed to load artist types");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="py-4 text-center">Loading artist types...</div>;
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="mt-4">
      <div className="grid gap-4 md:grid-cols-2">
        {artistTypes.slice(0, 4).map((type) => (
          <div
            key={type.id}
            className="rounded-md bg-white p-4 shadow-sm dark:bg-slate-700"
          >
            {type.imageUrl && (
              <div className="mb-3 flex justify-center">
                <ImageWithFallback
                  src={type.imageUrl}
                  alt={type.title || "Artist Type"}
                  width={60}
                  height={60}
                  className="rounded-full object-cover"
                  fallbackSrc="/placeholder.svg"
                />
              </div>
            )}
            <h3 className="font-medium">{type.title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {type.elevatorPitch ||
                type.description ||
                "No description available"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
