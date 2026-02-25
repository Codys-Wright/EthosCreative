# Ethos Creative

A monorepo for Ethos Creative applications, built with Effect-TS, TanStack Start, and Bun.

## Prerequisites

This project uses [Nix](https://nixos.org/) to manage its development environment. Nix ensures every contributor has the exact same versions of Bun, Node.js, PostgreSQL, and other tools — no manual installation, no version drift, no "works on my machine."

### Install Nix

If you don't have Nix installed, the recommended way is the [Determinate Systems installer](https://github.com/DeterminateSystems/nix-installer):

```bash
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
```

This installer enables flakes by default. If you installed Nix another way, make sure [flakes are enabled](https://wiki.nixos.org/wiki/Flakes#Enable_flakes_permanently).

### Enter the dev shell

**Every time you work on this project**, enter the Nix development shell first:

```bash
nix develop
```

This gives you:

- **Bun** — the project runtime and package manager
- **Node.js 22** — needed by some Nx tooling
- **PostgreSQL client** — for database operations

You can also use [direnv](https://direnv.net/) with [nix-direnv](https://github.com/nix-community/nix-direnv) to activate the shell automatically when you `cd` into the project.

## Getting started

Once inside `nix develop`:

```bash
# Install dependencies
bun install

# Start the database (requires Docker)
cd apps/my-artist-type && docker compose up -d && cd -

# Run migrations and seed data
cd apps/my-artist-type && bun run db:setup && cd -

# Copy the example env file and fill in your values
cp apps/my-artist-type/.env.example apps/my-artist-type/.env

# Start the dev server
bun run dev
```

## Apps

| App | Port | Description |
|-----|------|-------------|
| `my-artist-type` | 3000 | Artist personality quiz |
| `songmaking` | 3001 | Course & lesson platform |
| `explore` | 4200 | SSE/chat playground |

Start a specific app with:

```bash
bun run dev --project=<app-name>
```

## Common commands

```bash
bun run dev              # Start my-artist-type dev server
bun lint                 # Lint with oxlint
bun check                # TypeScript type check
bun check:fast           # Lint + typecheck
bun check:all            # Lint + typecheck + test
bun format               # Format with Biome
bun test                 # Run all tests
bun test:watch           # Watch mode
```

## Database

Each app has its own `docker-compose.yml` for PostgreSQL and observability tooling:

```bash
cd apps/my-artist-type
docker compose up -d       # Start PostgreSQL + Jaeger
bun run db:setup           # Reset + migrate + seed
bun run db:migrate         # Run migrations only
bun run db:seed            # Seed fake data
```

## Architecture

The project follows a **vertical slice architecture** with Effect-TS throughout. Each feature is structured as:

```
domain/     → Schemas, branded types, RPC definitions
database/   → Repository (Effect SQL queries)
server/     → Service (business logic), RPC handlers
client/     → RPC client, atoms, components, routes
```

See [`packages/example/README.md`](packages/example/README.md) for the complete reference implementation.

## Structure

```
apps/
  my-artist-type/    # Artist personality quiz app
  songmaking/        # Course/lesson platform app
  explore/           # SSE/chat playground

packages/
  core/              # Database utils, domain schemas, client/server infra
  auth/              # Better Auth + Effect (Google OAuth, passkeys)
  quiz/              # Quiz engine
  course/            # Course platform
  artist-types/      # Artist type definitions
  example/           # Reference implementation — read this first
  chat/              # Real-time chat
  ui/shadcn/         # shadcn/ui components
  ui/components/     # Custom components
  ui/theme/          # Theming
```

## Tech stack

- **Runtime**: [Bun](https://bun.sh/)
- **Monorepo**: [Nx](https://nx.dev/) + Bun workspaces
- **Framework**: [TanStack Start](https://tanstack.com/start) (SSR via Nitro)
- **Language**: TypeScript 5.7 (strict)
- **Core library**: [Effect-TS](https://effect.website/)
- **Database**: PostgreSQL 16 (via @effect/sql)
- **Auth**: [Better Auth](https://www.better-auth.com/) (Google OAuth, passkeys)
- **UI**: [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS 4](https://tailwindcss.com/)
- **Deployment**: [Netlify](https://www.netlify.com/)

## License

MIT
