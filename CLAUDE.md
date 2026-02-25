# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Runtime & Tooling

- **Runtime**: Bun (not Node/npm/pnpm)
- **Monorepo**: Nx with Bun workspaces
- **Build**: Vite 7 + TanStack Start (SSR via Nitro)
- **Language**: TypeScript 5.7 (strict mode, ESNext target)
- **Core library**: Effect-TS (services, schemas, RPC, SQL, atoms)

## Monorepo Structure

```
apps/
  my-artist-type/    # Artist personality quiz app (port 3000)
  songmaking/        # Course/lesson platform app (port 3001)
  explore/           # SSE/chat playground (port 4200)

packages/
  core/              # Database utils, domain schemas, client/server infra
  auth/              # Better Auth + Effect (Google OAuth, passkeys)
  quiz/              # Quiz engine (survey-style, no correct answers)
  course/            # Course platform (9 features: course, section, lesson, etc.)
  artist-types/      # Artist type definitions
  example/           # ** Reference implementation — read this first **
  todo/              # Simple CRUD example
  chat/              # Real-time chat
  sse/               # Server-sent events
  email/             # Email (Resend)
  playground/        # Experimental features
  ui/
    shadcn/          # shadcn/ui with namespace pattern (Card.Header, Dialog.Content)
    components/      # Custom components
    theme/           # Theming
```

## Commands

```bash
# Development
bun run dev                  # Start my-artist-type (nx serve)
bun run dev --project=songmaking  # Start songmaking app

# Quality checks
bun lint                     # Lint with oxlint
bun check                    # TypeScript type check (root)
bun check:fast               # Lint + typecheck
bun check:all                # Lint + typecheck + test
bun format                   # Format with Biome

# Testing
bun vitest run <path>        # Run specific test file
bun test                     # Run all tests (vitest run)
bun test:watch               # Watch mode

# Database (from apps/my-artist-type/)
bun run db:setup             # Reset + migrate + seed
bun run db:migrate           # Run migrations only
bun run db:seed              # Seed fake data

# Nx targets
bunx nx serve <app>          # Dev server
bunx nx typecheck <project>  # Type check specific project
bunx nx test <project>       # Test specific project
```

## Vertical Slice Architecture

Every feature package follows this layered structure. See `packages/example/README.md` for the complete reference implementation with detailed READMEs at every layer.

```
features/<name>/
  domain/            # Schemas, branded types, tagged errors, RPC/API definitions
  database/          # Repository (Effect SQL queries)
  server/            # Service (business logic), RPC/API handler implementations
  client/            # RPC client, atoms, components, views, routes
```

**File creation order**: domain → database → server → client (dependencies flow downward)

### Package-Level Infrastructure

Each package also has:
```
core/server/
  api.ts             # Combined HTTP API from all features
  layer.ts           # Combined Effect layers (ApiLive, RpcLive)
  runtime.ts         # ManagedRuntime for SSR server functions
```

### Three Export Entry Points

```
@example             # Client + domain (schemas, atoms, components, server functions)
@example/server      # Server-only (services, RPC/API handlers, runtime)
@example/database    # Database-only (migrations, seeders)
```

## Effect-TS Patterns

### Schemas & Branded Types

```ts
import * as S from "effect/Schema";

export const FeatureId = S.String.pipe(S.brand("FeatureId"));
export type FeatureId = typeof FeatureId.Type;

export const Feature = S.Struct({
  id: FeatureId,
  name: S.String.pipe(S.minLength(1)),
  createdAt: S.DateTimeUtc,
});

export class FeatureNotFound extends S.TaggedError<FeatureNotFound>()(
  "FeatureNotFound",
  { id: FeatureId }
) {}
```

### Service Pattern

```ts
export class FeatureService extends Effect.Service<FeatureService>()(
  "FeatureService",
  {
    dependencies: [FeatureRepository.Default],
    effect: Effect.gen(function* () {
      const repo = yield* FeatureRepository;
      return {
        list: () => repo.list(),
        getById: (id: FeatureId) => repo.getById(id),
      } as const;
    }),
  }
) {}
```

### RPC Pattern

```ts
// Domain: define endpoints
export class FeatureRpc extends RpcGroup.make(
  Rpc.make("list", { success: S.Array(Feature) }),
  Rpc.make("getById", { success: Feature, error: FeatureNotFound, payload: { id: FeatureId } }),
).prefix("feature_") {}

// Server: implement handlers
export const FeatureRpcLive = FeatureRpc.toLayer(
  Effect.gen(function* () {
    const service = yield* FeatureService;
    return FeatureRpc.of({
      feature_list: Effect.fn(function* () { return yield* service.list(); }),
      feature_getById: Effect.fn(function* ({ id }) { return yield* service.getById(id); }),
    });
  }),
).pipe(Layer.provide(FeatureService.Default));

// Client: create RPC client
export class FeatureClient extends AtomRpc.Tag<FeatureClient>()(
  "@example/FeatureClient",
  { group: FeatureRpc, protocol: RpcProtocol }
) {}
```

### Atom Pattern (Effect Atom + SSR)

```ts
export const featuresAtom = (() => {
  const remoteAtom = FeatureClient.runtime.atom(
    Effect.gen(function* () {
      const client = yield* FeatureClient;
      return yield* client("feature_list", undefined);
    })
  ).pipe(serializable({ key: "@example/features", schema: Result.Schema({...}) }));

  return Object.assign(
    Atom.writable((get) => get(remoteAtom), ...),
    { remote: remoteAtom }
  );
})();
```

### SQL Repository Pattern

```ts
export class FeatureRepository extends Effect.Service<FeatureRepository>()(
  "FeatureRepository",
  {
    dependencies: [PgLive],
    effect: Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      return {
        list: () => sql<Feature>`SELECT * FROM features`,
        getById: (id: FeatureId) =>
          sql<Feature>`SELECT * FROM features WHERE id = ${id}`.pipe(
            Effect.flatMap((rows) =>
              rows.length === 0 ? Effect.fail(new FeatureNotFound({ id })) : Effect.succeed(rows[0])
            )
          ),
      } as const;
    }),
  }
) {}
```

## Database

- **PostgreSQL 16** (Docker, port 5433)
- **ORM**: @effect/sql + @effect/sql-pg (not Drizzle/Prisma)
- **Query builder**: Kysely (only for Better Auth compatibility)
- **Migrations**: Custom Effect-based system in `@core/database`

### Migration pattern

```ts
// packages/<pkg>/src/database/migrations/0001_create_table.ts
export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`CREATE TABLE IF NOT EXISTS ...`;
});
```

Register in `migrations.ts` via `discoverFromPath()`, then import in the app's migrate script.

### Seeder pattern

Mark fake data with `fake = true` column. Seeders are idempotent (check existing count before inserting).

## Testing

- **Framework**: Vitest 3 + @effect/vitest
- **Component testing**: @testing-library/react + jsdom
- **Database tests**: @testcontainers/postgresql (requires Docker)

### Effect tests (with database)

```ts
const PgTest = makePgTestMigrations(QuizMigrations);
const TestLayer = MyRepo.DefaultWithoutDependencies.pipe(Layer.provideMerge(PgTest));

it.layer(TestLayer, { timeout: 30_000 })("MyRepo", (it) => {
  it.scoped("works", Effect.fn(function* () {
    const repo = yield* MyRepo;
    // test logic
  }, withTransactionRollback));
});
```

### Component tests

```ts
// Mock TanStack Router file-based routes
vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => ({ component: ... }) }));
// Mock Effect Atom hooks
vi.mock("@effect-atom/atom-react", () => ({ useAtomValue: () => mockData }));
```

### Config injection for tests

```ts
const testConfig = ConfigProvider.fromMap(new Map([["KEY", "value"]]));
Effect.withConfigProvider(testConfig);
```

## Deployment

- **Platform**: Netlify (serverless via Nitro)
- **Config**: `netlify.toml` in each app directory
- **Build**: TanStack Start outputs static files + serverless functions
- **Plugin**: @netlify/vite-plugin-tanstack-start

## UI Conventions

### ShadCN namespace pattern

All compound components use `Object.assign()` for dot notation:

```tsx
import { Card, Dialog } from "@shadcn";

<Card>
  <Card.Header><Card.Title>Title</Card.Title></Card.Header>
  <Card.Content>Content</Card.Content>
</Card>
```

### Formatting (Biome)

- Single quotes, JSX double quotes
- Semicolons always, trailing commas always
- 2-space indent, 100 char line width

### Effect Import Aliases

The Effect language service renames shadowed globals:

| Effect module | Alias |
|---|---|
| `Array` | `Arr` |
| `Function` | `Func` |
| `Boolean` | `Bool` |
| `Number` | `Num` |
| `String` | `Str` |

### Imports

- External packages first, then local imports
- Use `.js` extensions for local imports within packages (TypeScript module resolution)
- Use `.ts` extensions only for direct file references in apps

## Effect Solutions CLI

Curated best practices and patterns for Effect TypeScript:

```bash
bunx effect-solutions list              # List all topics
bunx effect-solutions show <slug...>    # Read topics
bunx effect-solutions search <term>     # Search topics
```

Local Effect source is at `~/.local/share/effect-solutions/effect` for API reference.

## btca (Up-to-date Tech Answers)

**Always run `btca` before writing Effect code** — Effect's API evolves rapidly and your training data may be outdated. Query it whenever you're unsure about an Effect API, pattern, or best practice:

```bash
btca ask -t effect -q "<question>"
```

Also available for other tech: `svelte`, `tailwindcss`, `opentui`, `runed`, `shiki`

## Key References

- `packages/example/README.md` — Complete architecture guide with file creation order
- `packages/example/src/database/README.md` — Migration & seeder details
- `packages/example/src/features/feature/domain/README.md` — Schema & RPC design
- `packages/example/src/features/feature/server/README.md` — Service & handler patterns
- `packages/example/src/features/feature/client/README.md` — Atom & SSR hydration patterns
- `packages/course/README.md` — Course platform feature overview
- `AGENTS.md` — Effect Solutions CLI, code style, shadcn component reference
