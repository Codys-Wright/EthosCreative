# TanStack Start Monorepo

A full-stack TypeScript monorepo with TanStack Start, Effect, and Better Auth.

## Quick Start

```bash
bun install
cp apps/my-artist-type/.env.example apps/my-artist-type/.env
bun run dev
```

## Stack

- **Framework:** TanStack Start + Vite
- **Monorepo:** Nx
- **Runtime:** Bun
- **Backend:** Effect-TS
- **Auth:** Better Auth
- **Database:** PostgreSQL + Kysely
- **UI:** Tailwind CSS + shadcn/ui

## Structure

```
apps/
  my-artist-type/    # Main app
  songmaking/        # Course platform app
  explore/           # SSE/chat playground

packages/
  auth/              # Authentication (Better Auth + Effect)
  core/              # Shared database & utilities
  quiz/              # Quiz feature
  artist-types/      # Artist types feature
  course/            # Course/lesson feature
  chat/              # Real-time chat
  ui/shadcn/         # UI components
  ui/components/     # Custom components
```

## Commands

```bash
bun run dev          # Start dev server
bun run build        # Build for production
bun run typecheck    # Type check
bun run lint         # Lint with oxlint
```

## Database

```bash
cd apps/my-artist-type
docker-compose up -d              # Start PostgreSQL
bun run scripts/migrate.ts        # Run migrations
bun run scripts/seed.ts           # Seed data
```

## License

MIT
