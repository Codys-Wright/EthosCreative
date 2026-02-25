# @todo

Simple CRUD todo list — a working reference implementation of the monorepo's vertical slice architecture.

## Overview

This package demonstrates the complete feature lifecycle from database to UI. Use it alongside `@example` to understand how feature packages are built.

- **Database** — PostgreSQL table with migrations and seeders
- **Domain** — Effect Schemas, RPC and HTTP API definitions, typed errors
- **Server** — TodoService, RPC handlers, HTTP API handlers, ManagedRuntime
- **Client** — RPC client, Effect atoms with optimistic updates, React components

## Exports

| Entry point | Import as | Contents |
|---|---|---|
| `@todo` | Client + Domain | Schemas, atoms, components, server functions |
| `@todo/server` | Server | TodoService, RPC/API handlers, runtime |
| `@todo/database` | Database | TodoMigrations, TodoRepository, seeders |

## Domain

```typescript
import { Todo, TodoId, CreateTodoInput, UpdateTodoInput, TodoNotFound } from '@todo';
```

- **TodoId** — Branded UUID
- **Todo** — `{ id, userId, title, completed, createdAt }`
- **CreateTodoInput** — `{ title }` (min 1 character)
- **UpdateTodoInput** — `{ title?, completed? }`
- **TodoNotFound** — Tagged error (404)

## API Endpoints

| Operation | RPC | HTTP |
|---|---|---|
| List | `todo_list` | `GET /todos` |
| Get by ID | `todo_getById` | `GET /todos/:id` |
| Create | `todo_create` | `POST /todos` |
| Update | `todo_update` | `PATCH /todos/:id` |
| Delete | `todo_remove` | `DELETE /todos/:id` |

All endpoints require authentication — todos are scoped to the current user via `AuthContext`.

## Client

```typescript
import { todosAtom, createTodoAtom, TodoList, CreateTodoForm } from '@todo';

// Atoms include optimistic cache updates
const todos = useAtomValue(todosAtom);
```

### Components

- **`TodoList`** — Renders todos with loading/error/empty states
- **`CreateTodoForm`** — Form to add todos
- **`TodoItem`** — Individual todo with toggle and delete

## Server

```typescript
import { TodoServerRuntime, TodoService } from '@todo/server';

const result = await TodoServerRuntime.runPromise(
  Effect.gen(function* () {
    const service = yield* TodoService;
    return yield* service.list(userId);
  })
);
```

## Database

```typescript
import { TodoMigrations, todo as todoSeeder } from '@todo/database';

// Register migrations in your app
const loader = createMigrationLoader({ features: [TodoMigrations] });

// Seed fake data
const seeders = [...todo({ todos: 200 })];
```

## Dependencies

- **`@core`** — PgLive, migration discovery, RPC config, atom serialization, tracing
- **`@auth`** — UserId type, AuthContext, AuthService
- **`@shadcn`** — Alert, Button, Input components
