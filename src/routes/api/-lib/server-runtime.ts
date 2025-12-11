import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { TodosService } from "./todos-service";

// Shared memoMap ensures layers are constructed only once
// across both the API handler and server functions used in loaders
const memoMap = Effect.runSync(Layer.makeMemoMap);

export const ServerLive = TodosService.Default;

// ManagedRuntime for use in loaders/server functions
export const serverRuntime = ManagedRuntime.make(ServerLive, memoMap);

export { memoMap };
