import { NetworkMonitor } from "./network-monitor";
import { Layer, Logger, ManagedRuntime } from "effect";
import { CrmService } from "@/features/crm/crm.service";
import { ExampleService } from "@/features/example";


// Create a layer with all services and tracing
export const LiveLayer = Layer.mergeAll(
  NetworkMonitor.Default,
  CrmService.Default,
  ExampleService.Default,

).pipe(Layer.provide(Logger.pretty));

export type LiveManagedRuntime = ManagedRuntime.ManagedRuntime<
  Layer.Layer.Success<typeof LiveLayer>,
  never
>;
