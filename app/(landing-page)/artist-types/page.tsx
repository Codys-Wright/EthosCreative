import Link from "next/link";
import { artistTypeContent } from "../../../landing-page/data/ArtistTypeContent";

export default function ArtistTypesPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-center text-4xl font-bold text-neutral-900 dark:text-white md:text-5xl">
          Artist Types
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-neutral-600 dark:text-neutral-400">
          Discover the ten distinct artist types, each with their own unique
          strengths, perspectives, and creative approaches.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(artistTypeContent).map(([id, type]) => (
            <Link
              key={id}
              href={`/artist-types/${id}`}
              className="group rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl dark:bg-neutral-800"
            >
              <h2 className="mb-2 text-xl font-semibold text-neutral-900 transition-colors group-hover:text-blue-500 dark:text-white dark:group-hover:text-blue-400">
                {type.title}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                {type.summary}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
