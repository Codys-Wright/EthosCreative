# @auth

Authentication and authorization for the Ethos Creative monorepo, built on [Better Auth](https://www.better-auth.com/) and Effect-TS.

## Overview

This package provides a complete authentication system with:

- **Email/password** sign-up and sign-in
- **Google OAuth** social login with automatic account linking
- **Passkeys** (WebAuthn) for passwordless authentication
- **Anonymous auth** — users can start without signing up, then claim their account later
- **Organizations & teams** — multi-tenant support with role-based access control
- **Two-factor authentication** (TOTP)
- **Admin operations** — user management, impersonation, banning
- **Effect-Atom integration** — SSR-compatible reactive state for sessions, orgs, and invitations

## Exports

| Entry point | Import as | Contents |
|---|---|---|
| `@auth` | Client + Domain | Schemas, atoms, React components, auth client |
| `@auth/server` | Server only | AuthService, middleware (HTTP + RPC), config |
| `@auth/database` | Database only | Migrations, seeders (dev admin, fake users, orgs) |

## Features

| Feature | Description |
|---|---|
| **Session** | JWT sessions with active org/team context, cross-tab sync |
| **User** | Profiles with roles, ban status, 2FA flag, anonymous flag |
| **Organization** | Multi-tenant orgs with members, invitations, custom roles |
| **Team** | Sub-groups within organizations |
| **Member** | Role-based membership (owner/admin/member + custom roles) |
| **Invitation** | Invite system with pending/accepted/rejected/canceled states |
| **Account** | Linked auth providers, password reset, account settings |
| **Security** | Passkeys, 2FA (TOTP), session revocation |
| **Admin** | User management, impersonation, fine-grained permissions |
| **Permissions** | Access control for announcements, courses, quizzes, analytics |

## Usage

### Client

```typescript
import { sessionAtom, organizationsAtom, SignedIn, SignedOut } from '@auth';

// Conditional rendering
<SignedIn>Welcome back!</SignedIn>
<SignedOut>Please sign in.</SignedOut>

// Reactive session state
const session = useAtomValue(sessionAtom);
```

### Server

```typescript
import { AuthService, HttpAuthenticationMiddleware } from '@auth/server';

// Get current user in a server function
const auth = yield* AuthService;
const userId = yield* auth.currentUserId();
```

### Database

```typescript
import { runBetterAuthMigrations, CustomAuthMigrations, devAdmin, users } from '@auth/database';

// Seeders
const seeders = [devAdmin(), ...users(50)];
```

## Authentication Flows

1. **Email/password** — Standard registration and login forms
2. **Google OAuth** — Social login with trusted provider auto-linking
3. **Anonymous** — Quick start without signup; data migrates via `onLinkAccount` when claiming
4. **Passkeys** — WebAuthn-based passwordless auth
5. **Account linking** — Connect multiple auth methods to one account

## Configuration

| Variable | Description |
|---|---|
| `BETTER_AUTH_URL` | Auth service base URL |
| `BETTER_AUTH_SECRET` | Secret key for session signing |
| `DATABASE_URL` | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret (optional) |
| `APP_NAME` | Used for 2FA issuer and passkey RP name |

## Dependencies

- **`@core`** — Database utilities, migration discovery, tracing
- **`@email`** — EmailService for password resets and invitations
- **`@shadcn`** — UI components for auth forms and dialogs
