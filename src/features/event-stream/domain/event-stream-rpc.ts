import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as Schema from "effect/Schema";
import { CurrentUserRpcMiddleware } from "@/features/auth/policy";
import { FilesEvent } from "@/features/files/domain/files-rpc";

export class Ka extends Schema.TaggedClass<Ka>("Ka")("Ka", {}) {}

export const EventStreamEvents = Schema.Union(Ka, FilesEvent);
export type EventStreamEvents = typeof EventStreamEvents.Type;

export class EventStreamRpc extends RpcGroup.make(
  Rpc.make("connect", {
    stream: true,
    success: Schema.Array(EventStreamEvents),
  }),
)
  .prefix("eventStream_")
  .middleware(CurrentUserRpcMiddleware) {}

