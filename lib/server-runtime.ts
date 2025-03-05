import { Effect, Layer, ManagedRuntime, Context } from "effect";
import { Database } from "./db/db.service";
import { ArtistTypeService } from "@/features/artist-types/api/artist-type.service";

/**
 * Server-side Layer with all services needed for server components
 */
export const ServerLayer = Layer.mergeAll(
  Layer.effect(Database),
  ArtistTypeService.Default,
  // Add other server-compatible services here
);

// Type for services available in ServerLayer
export type ServerEnv = Layer.Layer.Success<typeof ServerLayer>;

/**
 * Singleton pattern for server runtime
 * This ensures we don't recreate the runtime for every request
 */
let serverRuntime: ManagedRuntime.ManagedRuntime<ServerEnv, never> | null =
  null;

export function getServerRuntime(): ManagedRuntime.ManagedRuntime<
  ServerEnv,
  never
> {
  if (!serverRuntime) {
    console.log("Creating new server Effect runtime");
    serverRuntime = ManagedRuntime.make(ServerLayer);
  }
  return serverRuntime;
}

/**
 * Helper to run Effect programs with server runtime
 * @param effect The Effect program to run
 * @returns Promise with the result of running the Effect
 */
export async function runServerEffect<A, E>(
  effect: Effect.Effect<A, E, ServerEnv>,
): Promise<A> {
  const runtime = getServerRuntime();
  return runtime.runPromise(effect);
}

/**
 * Helper to create a function that fetches data with Effect in server components
 * @param dataEffect The Effect that fetches the data
 * @returns A function that can be called in server components
 */
export function createServerDataFetcher<A>(
  dataEffect: Effect.Effect<A, unknown, ServerEnv>,
) {
  return async () => {
    try {
      return await runServerEffect(dataEffect);
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };
}
