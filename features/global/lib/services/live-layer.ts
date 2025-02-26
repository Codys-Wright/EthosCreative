import { NetworkMonitor } from "./network-monitor";
import { Layer, Logger, ManagedRuntime } from "effect";
import { CrmService } from "@/features/crm/crm.service";

export const LiveLayer = Layer.mergeAll(
  NetworkMonitor.Default,
  CrmService.Default,
).pipe(Layer.provide(Logger.pretty));

export type LiveManagedRuntime = ManagedRuntime.ManagedRuntime<
  Layer.Layer.Success<typeof LiveLayer>,
  never
>;
