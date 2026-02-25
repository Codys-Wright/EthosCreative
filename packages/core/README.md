# @core

Shared infrastructure for the Ethos Creative monorepo — database utilities, domain schemas, client helpers, and server tracing.

## Overview

Every feature package in the monorepo depends on `@core`. It provides:

- **Domain schemas** — Reusable Effect-TS schemas (Slug, Email, SemVer, etc.)
- **Database layer** — PostgreSQL connection, migration system, seeding framework, test utilities
- **Client utilities** — RPC config, form validation, atom serialization, hydration timing
- **Server utilities** — OpenTelemetry tracing via Jaeger

## Exports

| Entry point | Import as | Contents |
|---|---|---|
| `@core` | Client-safe | Domain schemas, form utils, RPC config, hydration hooks |
| `@core/database` | Database | PgLive, migrations, seeders, test helpers |
| `@core/server` | Server only | TracerLive (OpenTelemetry) |
| `@core/client/*` | Client modules | `atom-utils`, `rpc-config`, `form-utils`, `use-hydration-timing` |

## Domain Schemas

```typescript
import { Slug, SlugFromString, Email, SemVer, TrimNonEmpty } from '@core';

// Slug validation: lowercase letters, numbers, hyphens
const slug = S.decodeSync(Slug)('my-feature');

// Auto-transform to slug format
const transformed = S.decodeSync(SlugFromString)('My Feature!'); // "my-feature"
```

## Database

### PostgreSQL Connection

`PgLive` provides a configured connection pool:
- Idle timeout: 10s, connection timeout: 10s
- Min 2 / max 10 connections
- Automatic camelCase ↔ snake_case field name transformation

### Migrations

```typescript
import { discoverFromPath, runMigrations } from '@core/database';

// Each package discovers its own migrations
export const TodoMigrations = discoverFromPath({
  path: join(__dirname, 'migrations'),
  prefix: 'todo',
});

// App combines and runs all migrations
await runMigrations(AuthMigrations, TodoMigrations, QuizMigrations);
```

### Seeders

```typescript
import { makeSeeder, runSeed } from '@core/database';

export const users = makeSeeder(
  { name: 'users', defaultCount: 50, dependsOn: [] },
  (count) => Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    // ... seeding logic
    return { name: 'users', existing: 0, created: count };
  })
);

// Run with dependency-aware topological sorting
await runSeed(...auth({ users: 100 }), ...todo({ todos: 200 }));
```

### Test Utilities

```typescript
import { makePgTestMigrations, withTransactionRollback } from '@core/database';

const PgTest = makePgTestMigrations(TodoMigrations);
const TestLayer = TodoRepo.DefaultWithoutDependencies.pipe(Layer.provideMerge(PgTest));

it.layer(TestLayer, { timeout: 30_000 })('TodoRepo', (it) => {
  it.scoped('creates a todo', Effect.fn(function* () {
    const repo = yield* TodoRepo;
    // each test auto-rolls back
  }, withTransactionRollback));
});
```

## Client Utilities

### RPC Configuration

```typescript
import { RpcProtocol } from '@core/client/rpc-config';

// Resolves base URL: browser origin → Netlify env → localhost fallback
// Configures RPC client for /api/rpc endpoint
```

### Form Validation

```typescript
import { makeFormOptions } from '@core/client/form-utils';

const formOptions = makeFormOptions(CreateTodoInput, {
  onSubmit: true,
  onChange: true,
});
```

### Atom Serialization (SSR)

```typescript
import { serializable, dehydrate } from '@core/client/atom-utils';

// Mark atoms for SSR hydration
const myAtom = remoteAtom.pipe(
  serializable({ key: '@todo/items', schema: Result.Schema({...}) })
);
```

### Hydration Timing

```typescript
import { useHydrationTiming, HydrationDebugPanel } from '@core/client/use-hydration-timing';

// Measures SSR delivery + hydration + total time
const metrics = useHydrationTiming('my-page');
```

## Server

### OpenTelemetry Tracing

```typescript
import { TracerLive } from '@core/server';

// Exports Effect.fn spans to Jaeger at http://localhost:4318/v1/traces
// View traces at http://localhost:16686
const ServerLayer = MyService.Default.pipe(Layer.provideMerge(TracerLive));
```
