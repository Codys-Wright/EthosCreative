import { ApiClient } from "@/api/api-client";
import {
  CreateTodoInput,
  Todo,
  TodoId,
  UpdateTodoInput,
} from "@/api/todo-schema";
import {
  Atom,
  Result,
  useAtom,
  useAtomValue,
  useAtomRefresh,
} from "@effect-atom/atom-react";
import { HydrationBoundary } from "@effect-atom/atom-react/ReactHydration";
import { createFileRoute } from "@tanstack/react-router";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import { useState } from "react";
import { serverRuntime } from "./api/-lib/server-runtime";
import { TodosService } from "./api/-lib/todos-service";
import { dehydrate, serializable } from "@/lib/atom-utils";
import * as RpcClientError from "@effect/rpc/RpcClientError";

const TodosSchema = Schema.Array(Todo);

export const Route = createFileRoute("/")({
  loader: async () => {
    const todos = await serverRuntime.runPromiseExit(
      Effect.flatMap(TodosService, (s) => s.list),
    );
    return dehydrate(todosAtom, Result.fromExit(todos));
  },
  component: AppWrapper,
});

class Api extends Effect.Service<Api>()("@app/index/Api", {
  dependencies: [ApiClient.Default],
  effect: Effect.gen(function* () {
    const { rpc } = yield* ApiClient;

    return {
      list: () => rpc.todos_list(),
      create: (input: CreateTodoInput) => rpc.todos_create({ input }),
      update: (id: TodoId, input: UpdateTodoInput) =>
        rpc.todos_update({ id, input }),
      remove: (id: TodoId) => rpc.todos_remove({ id }),
    } as const;
  }),
}) {}

const runtime = Atom.runtime(Api.Default);

const todosAtom = runtime
  .atom(
    Effect.gen(function* () {
      const api = yield* Api;
      return yield* api.list();
    }),
  )
  .pipe(
    serializable({
      key: "@app/index/todos",
      schema: Result.Schema({
        success: TodosSchema,
        error: RpcClientError.RpcClientError,
      }),
    }),
  );

const createTodoAtom = runtime.fn<CreateTodoInput>()(
  Effect.fnUntraced(function* (input, get) {
    const api = yield* Api;
    const result = yield* api.create(input);
    get.refresh(todosAtom);
    return result;
  }),
);

const updateTodoAtom = runtime.fn<{
  readonly id: TodoId;
  readonly input: UpdateTodoInput;
}>()(
  Effect.fnUntraced(function* ({ id, input }, get) {
    const api = yield* Api;
    const result = yield* api.update(id, input);
    get.refresh(todosAtom);
    return result;
  }),
);

const deleteTodoAtom = runtime.fn<TodoId>()(
  Effect.fnUntraced(function* (id, get) {
    const api = yield* Api;
    yield* api.remove(id);
    get.refresh(todosAtom);
  }),
);

function AppWrapper() {
  const dehydrated = Route.useLoaderData();

  return (
    <HydrationBoundary state={[dehydrated]}>
      <App />
    </HydrationBoundary>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Todo App</h1>
        <CreateTodoForm />
        <TodoList />
      </div>
    </div>
  );
}

function CreateTodoForm() {
  const [title, setTitle] = useState("");
  const [createResult, create] = useAtom(createTodoAtom);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    create({ title: title.trim() });
    setTitle("");
  };

  const hasError = Result.isFailure(createResult);

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          disabled={createResult.waiting}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={createResult.waiting || !title.trim()}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createResult.waiting ? "Adding..." : "Add"}
        </button>
      </form>
      {hasError && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200 text-sm">
          Failed to create todo. Please try again.
        </div>
      )}
    </div>
  );
}

function TodoList() {
  const result = useAtomValue(todosAtom);
  const refreshTodos = useAtomRefresh(todosAtom);

  return (
    <div>
      {Result.builder(result)
        .onInitial(() => (
          <p className="text-gray-500 dark:text-gray-400">Loading todos...</p>
        ))
        .onSuccess((todos) =>
          todos.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No todos yet. Add one above!
            </p>
          ) : (
            <ul className="space-y-2">
              {todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </ul>
          ),
        )
        .onFailure(() => (
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-200 mb-2">
              Something went wrong loading todos.
            </p>
            <button
              onClick={refreshTodos}
              className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800"
            >
              Retry
            </button>
          </div>
        ))
        .render()}
    </div>
  );
}

function TodoItem({ todo }: { readonly todo: Todo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [updateResult, update] = useAtom(updateTodoAtom);
  const [deleteResult, deleteTodo] = useAtom(deleteTodoAtom);
  const refreshTodos = useAtomRefresh(todosAtom);

  const handleToggle = () => {
    update({
      id: todo.id,
      input: { title: Option.none(), completed: Option.some(!todo.completed) },
    });
    refreshTodos();
  };

  const handleDelete = () => {
    deleteTodo(todo.id);
    refreshTodos();
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    update({
      id: todo.id,
      input: { title: Option.some(editTitle.trim()), completed: Option.none() },
    });
    setIsEditing(false);
    refreshTodos();
  };

  const isLoading = updateResult.waiting || deleteResult.waiting;
  const hasError =
    Result.isFailure(updateResult) || Result.isFailure(deleteResult);

  return (
    <li
      className={`p-4 rounded-lg border-2 transition-colors ${
        hasError
          ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-gray-600"
      } ${isLoading ? "opacity-50" : ""}`}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          disabled={isLoading}
          className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-500 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800"
        />
        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditTitle(todo.title);
                }
              }}
              autoFocus
              className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <button
              onClick={handleSaveEdit}
              disabled={isLoading}
              className="px-3 py-1 bg-green-500 dark:bg-green-600 text-white rounded hover:bg-green-600 dark:hover:bg-green-700 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditTitle(todo.title);
              }}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <span
              className={`flex-1 cursor-pointer ${
                todo.completed
                  ? "line-through text-gray-400 dark:text-gray-500"
                  : "text-gray-900 dark:text-gray-100"
              }`}
              onDoubleClick={() => setIsEditing(true)}
            >
              {todo.title}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-3 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded disabled:opacity-50"
            >
              {deleteResult.waiting ? "..." : "Delete"}
            </button>
          </>
        )}
      </div>
      {hasError && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
          Operation failed.{" "}
          <button
            onClick={refreshTodos}
            className="underline hover:no-underline"
          >
            Refresh
          </button>
        </div>
      )}
    </li>
  );
}
