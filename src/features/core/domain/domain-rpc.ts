import * as RpcGroup from "@effect/rpc/RpcGroup";
import { TodosRpc } from "@/features/todo/domain";
import { FilesRpc } from "@/features/files/domain";
import { EventStreamRpc } from "@/features/event-stream/domain";

export class DomainRpc extends RpcGroup.make().merge(TodosRpc).merge(FilesRpc).merge(EventStreamRpc) {}

