import { NetworkMonitor } from "./network-monitor";
import { Layer, Logger, ManagedRuntime, pipe } from "effect";
import { ExampleService } from "@/features/example";
import { SpansExportLive } from "./tracing";

// Create a layer with all services and tracing
export const LiveLayer = Layer.mergeAll(
  NetworkMonitor.Default,
  ExampleService.Default,
  SpansExportLive,
).pipe(Layer.provide(Logger.pretty));

export type LiveManagedRuntime = ManagedRuntime.ManagedRuntime<
  Layer.Layer.Success<typeof LiveLayer>,
  never
>;
