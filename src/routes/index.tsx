import { dehydrate } from "@/lib/atom-utils";
import { Result } from "@effect-atom/atom-react";
import { HydrationBoundary } from "@effect-atom/atom-react/ReactHydration";
import { createFileRoute } from "@tanstack/react-router";
import * as Effect from "effect/Effect";
import { serverRuntime } from "./api/-lib/server-runtime";
import { TodosService } from "./api/-lib/todos-service";
import { App } from "./-index/app";
import { todosAtom } from "./-index/atoms";

export const Route = createFileRoute("/")({
  loader: async () => {
    const todos = await serverRuntime.runPromiseExit(
      Effect.flatMap(TodosService, (s) => s.list),
    );
    return dehydrate(todosAtom.remote, Result.fromExit(todos));
  },
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
