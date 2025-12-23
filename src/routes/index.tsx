import { dehydrate } from "@/features/core/client";
import { Result } from "@effect-atom/atom-react";
import { HydrationBoundary } from "@effect-atom/atom-react/ReactHydration";
import { createFileRoute } from "@tanstack/react-router";
import * as Effect from "effect/Effect";
import { serverRuntime } from "@/features/core/server";
import { TodosService } from "@/features/todo/server/todos-service";
import { App } from "./-index/app";
import { todosAtom } from "@/features/todo/client";
import { createServerFn } from "@tanstack/react-start";

const getTodos = createServerFn().handler(async () => {
  const todos = await serverRuntime.runPromiseExit(
    Effect.gen(function* () {
      const service = yield* TodosService;
      return yield* service.list;
    }),
  );
  return dehydrate(todosAtom.remote, Result.fromExit(todos));
});

export const Route = createFileRoute("/")({
  loader: () => getTodos(),
  component: AppWrapper,
});

function AppWrapper() {
  const dehydrated = Route.useLoaderData();
  return (
    <HydrationBoundary state={[dehydrated]}>
      <App />
    </HydrationBoundary>
  );
}
