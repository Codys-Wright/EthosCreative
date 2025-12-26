# Auth Implementation Plan: Organizations, Teams, OAuth, Passkeys & 2FA

**Created:** 2025-12-26  
**Status:** Ready for Implementation

---

## Overview

Add comprehensive authentication features to the existing better-auth setup using Effect-Atom for state management:

- **Google OAuth** for social login
- **Organizations** with members, invitations, and roles
- **Teams** within organizations
- **Passkeys** for passwordless authentication
- **2FA** with TOTP and backup codes
- **Custom UI components** using Effect-Atom (no context provider needed)
- **Email Service** as mocked Effect Service
- **TanStack Form** for all form handling

---

## Technology Stack

- **Backend:** Better Auth with plugins (organization, passkey, twoFactor)
- **State Management:** Effect-Atom (reactive atoms with Effect integration)
- **Forms:** @tanstack/react-form with Effect Schema validation
- **UI:** Custom components using ShadCN namespace pattern
- **Database:** PostgreSQL with Better Auth auto-migrations
- **OAuth:** Google OAuth (extensible for GitHub, Discord, etc.)

---

## Architecture Principles

1. **No Context Providers:** All state management via Effect-Atom atoms
2. **Effect-First:** All async operations use Effect for type-safe error handling
3. **Namespace Pattern:** UI components follow ShadCN's `Component.SubComponent` pattern
4. **Atomic Updates:** Optimistic cache updates for instant UI feedback
5. **Type Safety:** Effect Schemas for runtime validation and type inference

---

## Phase 1: Server Infrastructure

### 1.1 Update Environment Configuration

**File:** `src/features/auth/server/better-auth.config.ts`

**Changes:**
- Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as redacted configs
- Add `APP_NAME` with default value "TanStack App"
- Update `BetterAuthConfigValues` type to include new fields

**New Config:**
```typescript
export type BetterAuthConfigValues = {
  readonly BETTER_AUTH_URL: string;
  readonly BETTER_AUTH_SECRET: Redacted.Redacted<string>;
  readonly DATABASE_URL: Redacted.Redacted<string>;
  readonly CLIENT_ORIGIN: string;
  readonly GOOGLE_CLIENT_ID: Option.Option<Redacted.Redacted<string>>;
  readonly GOOGLE_CLIENT_SECRET: Option.Option<Redacted.Redacted<string>>;
  readonly APP_NAME: string;
};
```

---

### 1.2 Create Email Service

**New File:** `src/features/auth/server/email.service.ts`

**Purpose:** Mock email service for invitations, password resets, etc.

**Implementation:**
```typescript
import * as Effect from "effect/Effect";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId: string;
}

export class EmailService extends Effect.Service<EmailService>()(
  "EmailService",
  {
    effect: Effect.sync(() => ({
      send: (message: EmailMessage) =>
        Effect.gen(function* () {
          // Mock implementation - logs to console
          yield* Effect.logInfo("📧 Email would be sent:");
          yield* Effect.logInfo(`   To: ${message.to}`);
          yield* Effect.logInfo(`   Subject: ${message.subject}`);
          yield* Effect.logInfo(`   Body: ${message.html.substring(0, 100)}...`);
          
          return {
            success: true,
            messageId: `mock-${Date.now()}`,
          } satisfies SendEmailResult;
        }),
    })),
  }
) {}
```

**Future:** Replace with real email service (Resend, SendGrid, etc.)

---

### 1.3 Update Better Auth Service with Plugins

**File:** `src/features/auth/server/better-auth.service.ts`

**Changes:**
- Import organization, twoFactor, passkey plugins
- Add `sendEmail` callback parameter
- Configure all plugins with appropriate options

**New Imports:**
```typescript
import { organization } from "better-auth/plugins/organization";
import { twoFactor } from "better-auth/plugins/two-factor";
import { passkey } from "better-auth/plugins/passkey";
```

**Updated `makeBetterAuthOptions`:**
```typescript
export const makeBetterAuthOptions = (params: {
  baseURL: string;
  secret: string;
  clientOrigin: string;
  db: unknown;
  googleClientId?: string;
  googleClientSecret?: string;
  appName: string;
  sendEmail: (to: string, subject: string, html: string) => Promise<void>;
}): BetterAuthOptions => ({
  baseURL: params.baseURL,
  secret: params.secret,
  appName: params.appName,
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await params.sendEmail(
        user.email,
        "Reset your password",
        `<p>Click the link below to reset your password:</p><a href="${url}">${url}</a>`
      );
    },
  },
  
  database: {
    db: params.db,
    type: "postgres",
    casing: "camel",
  },
  
  socialProviders: {
    google: params.googleClientId && params.googleClientSecret ? {
      clientId: params.googleClientId,
      clientSecret: params.googleClientSecret,
    } : undefined,
  },
  
  plugins: [
    openAPI(),
    
    organization({
      allowUserToCreateOrganization: true,
      creatorRole: "owner",
      membershipLimit: 100,
      organizationLimit: 10,
      
      sendInvitationEmail: async (data) => {
        await params.sendEmail(
          data.email,
          `Invitation to join ${data.organization.name}`,
          `<p>You've been invited to join ${data.organization.name}.</p>`
        );
      },
      
      teams: {
        enabled: true,
        maximumTeams: 10,
      },
    }),
    
    twoFactor({
      issuer: params.appName,
      otpOptions: {
        length: 6,
        period: 30,
      },
    }),
    
    passkey({
      rpName: params.appName,
      rpID: new URL(params.baseURL).hostname,
      origin: params.clientOrigin,
    }),
  ],
  
  trustedOrigins: [params.clientOrigin, params.baseURL],
});
```

**Update `makeBetterAuth` Effect:**
```typescript
const makeBetterAuth = Effect.gen(function* () {
  const env = yield* BetterAuthConfig;
  const kysely = yield* BetterAuthDatabase;
  const emailService = yield* EmailService;

  const options = makeBetterAuthOptions({
    baseURL: env.BETTER_AUTH_URL,
    secret: getAuthSecret(env),
    clientOrigin: env.CLIENT_ORIGIN,
    db: kysely,
    googleClientId: Option.isSome(env.GOOGLE_CLIENT_ID) 
      ? Redacted.value(env.GOOGLE_CLIENT_ID.value) 
      : undefined,
    googleClientSecret: Option.isSome(env.GOOGLE_CLIENT_SECRET)
      ? Redacted.value(env.GOOGLE_CLIENT_SECRET.value)
      : undefined,
    appName: env.APP_NAME,
    sendEmail: async (to, subject, html) => {
      await Effect.runPromise(
        emailService.send({ to, subject, html })
      );
    },
  });

  const { runMigrations } = yield* Effect.promise(() => getMigrations(options));
  yield* Effect.promise(runMigrations);

  return betterAuth(options);
});

export class BetterAuthService extends Effect.Service<BetterAuthService>()(
  "BetterAuthService",
  {
    effect: makeBetterAuth,
    dependencies: [
      BetterAuthDatabase.Default,
      BetterAuthConfig.Default,
      EmailService.Default,
    ],
  },
) {}
```

---

### 1.4 Database Migrations

**Auto-Generated Tables:**

Better Auth will automatically create these tables when plugins are enabled:

- `organization` - Organization records (id, name, slug, logo, metadata, createdAt)
- `member` - Organization memberships (id, organizationId, userId, role, createdAt)
- `invitation` - Pending invitations (id, organizationId, email, role, status, expiresAt)
- `team` - Teams within organizations (id, name, organizationId, createdAt)
- `teamMember` - Team memberships (id, teamId, userId, role)
- `passkey` - WebAuthn credentials (id, name, publicKey, userId, createdAt)
- `twoFactor` - 2FA settings (userId, secret, backupCodes)

**No manual migrations needed** - Better Auth handles schema creation and updates.

---

### 1.5 Update .env.example

**File:** `.env.example`

**Add:**
```env
# Application
APP_NAME=TanStack App

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth (optional, for future)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

---

## Phase 2: Domain Layer - Effect Schemas

### 2.1 Organization Schemas

**New File:** `src/features/auth/domain/organization.schema.ts`

**Purpose:** Type-safe schemas for organizations, members, and invitations

**Schema Definitions:**

```typescript
import * as Schema from "effect/Schema";
import { UserId } from "./auth.user-id.js";

// Branded types
export const OrganizationId = Schema.String.pipe(Schema.brand("OrganizationId"));
export type OrganizationId = typeof OrganizationId.Type;

export const OrganizationRole = Schema.Literal("owner", "admin", "member");
export type OrganizationRole = typeof OrganizationRole.Type;

// Main entities
export const Organization = Schema.Struct({
  id: OrganizationId,
  name: Schema.String,
  slug: Schema.String,
  logo: Schema.NullOr(Schema.String),
  metadata: Schema.optional(Schema.Unknown),
  createdAt: Schema.DateTimeUtc,
});
export type Organization = typeof Organization.Type;

export const Member = Schema.Struct({
  id: Schema.String,
  organizationId: OrganizationId,
  userId: UserId,
  role: OrganizationRole,
  createdAt: Schema.DateTimeUtc,
  user: Schema.Struct({
    id: UserId,
    name: Schema.String,
    email: Schema.String,
    image: Schema.NullOr(Schema.String),
  }),
});
export type Member = typeof Member.Type;

export const Invitation = Schema.Struct({
  id: Schema.String,
  organizationId: OrganizationId,
  email: Schema.String,
  role: OrganizationRole,
  status: Schema.Literal("pending", "accepted", "rejected", "canceled"),
  expiresAt: Schema.DateTimeUtc,
  inviterId: Schema.optional(UserId),
  organizationName: Schema.optional(Schema.String),
});
export type Invitation = typeof Invitation.Type;

// Input schemas with validation
export const CreateOrganizationInput = Schema.Struct({
  name: Schema.String.pipe(
    Schema.minLength(1, { message: () => "Organization name is required" }),
    Schema.maxLength(100, { message: () => "Organization name must be less than 100 characters" })
  ),
  slug: Schema.optional(
    Schema.String.pipe(
      Schema.pattern(/^[a-z0-9-]+$/, { message: () => "Slug can only contain lowercase letters, numbers, and hyphens" }),
      Schema.minLength(3, { message: () => "Slug must be at least 3 characters" }),
      Schema.maxLength(50, { message: () => "Slug must be less than 50 characters" })
    )
  ),
});
export type CreateOrganizationInput = typeof CreateOrganizationInput.Type;

export const UpdateOrganizationInput = Schema.Struct({
  name: Schema.optional(Schema.String.pipe(Schema.minLength(1), Schema.maxLength(100))),
  slug: Schema.optional(Schema.String.pipe(Schema.pattern(/^[a-z0-9-]+$/), Schema.minLength(3))),
  logo: Schema.optional(Schema.NullOr(Schema.String)),
});
export type UpdateOrganizationInput = typeof UpdateOrganizationInput.Type;

export const InviteMemberInput = Schema.Struct({
  organizationId: OrganizationId,
  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: () => "Invalid email address" })
  ),
  role: OrganizationRole,
});
export type InviteMemberInput = typeof InviteMemberInput.Type;

export const UpdateMemberRoleInput = Schema.Struct({
  memberId: Schema.String,
  role: OrganizationRole,
});
export type UpdateMemberRoleInput = typeof UpdateMemberRoleInput.Type;
```

---

### 2.2 Team Schemas

**New File:** `src/features/auth/domain/team.schema.ts`

**Purpose:** Type-safe schemas for teams and team members

```typescript
import * as Schema from "effect/Schema";
import { OrganizationId } from "./organization.schema.js";
import { UserId } from "./auth.user-id.js";

// Branded types
export const TeamId = Schema.String.pipe(Schema.brand("TeamId"));
export type TeamId = typeof TeamId.Type;

export const TeamRole = Schema.Literal("owner", "member");
export type TeamRole = typeof TeamRole.Type;

// Main entities
export const Team = Schema.Struct({
  id: TeamId,
  name: Schema.String,
  organizationId: OrganizationId,
  createdAt: Schema.DateTimeUtc,
});
export type Team = typeof Team.Type;

export const TeamMember = Schema.Struct({
  id: Schema.String,
  teamId: TeamId,
  userId: UserId,
  role: TeamRole,
  user: Schema.Struct({
    id: UserId,
    name: Schema.String,
    email: Schema.String,
    image: Schema.NullOr(Schema.String),
  }),
});
export type TeamMember = typeof TeamMember.Type;

// Input schemas
export const CreateTeamInput = Schema.Struct({
  organizationId: OrganizationId,
  name: Schema.String.pipe(
    Schema.minLength(1, { message: () => "Team name is required" }),
    Schema.maxLength(50, { message: () => "Team name must be less than 50 characters" })
  ),
});
export type CreateTeamInput = typeof CreateTeamInput.Type;

export const UpdateTeamInput = Schema.Struct({
  name: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(50)),
});
export type UpdateTeamInput = typeof UpdateTeamInput.Type;

export const AddTeamMemberInput = Schema.Struct({
  teamId: TeamId,
  userId: UserId,
  role: TeamRole,
});
export type AddTeamMemberInput = typeof AddTeamMemberInput.Type;
```

---

### 2.3 Security Schemas

**New File:** `src/features/auth/domain/security.schema.ts`

**Purpose:** Type-safe schemas for passkeys, 2FA, sessions, and accounts

```typescript
import * as Schema from "effect/Schema";
import { UserId } from "./auth.user-id.js";

// Passkeys
export const Passkey = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  publicKey: Schema.String,
  counter: Schema.Number,
  userId: UserId,
  createdAt: Schema.DateTimeUtc,
});
export type Passkey = typeof Passkey.Type;

export const AddPasskeyInput = Schema.Struct({
  name: Schema.String.pipe(
    Schema.minLength(1, { message: () => "Passkey name is required" }),
    Schema.maxLength(50, { message: () => "Passkey name must be less than 50 characters" })
  ),
});
export type AddPasskeyInput = typeof AddPasskeyInput.Type;

// Two-Factor Authentication
export const TwoFactorStatus = Schema.Struct({
  enabled: Schema.Boolean,
  backupCodesCount: Schema.Number,
});
export type TwoFactorStatus = typeof TwoFactorStatus.Type;

export const EnableTwoFactorResult = Schema.Struct({
  totpURI: Schema.String,
  backupCodes: Schema.Array(Schema.String),
});
export type EnableTwoFactorResult = typeof EnableTwoFactorResult.Type;

export const VerifyTOTPInput = Schema.Struct({
  code: Schema.String.pipe(
    Schema.pattern(/^\d{6}$/, { message: () => "Code must be 6 digits" })
  ),
});
export type VerifyTOTPInput = typeof VerifyTOTPInput.Type;

// Sessions
export const ActiveSession = Schema.Struct({
  id: Schema.String,
  token: Schema.String,
  userAgent: Schema.NullOr(Schema.String),
  ipAddress: Schema.NullOr(Schema.String),
  createdAt: Schema.DateTimeUtc,
  expiresAt: Schema.DateTimeUtc,
  isCurrent: Schema.Boolean,
});
export type ActiveSession = typeof ActiveSession.Type;

// Linked Accounts (OAuth providers)
export const Account = Schema.Struct({
  id: Schema.String,
  providerId: Schema.String, // "credential", "google", "github", etc.
  accountId: Schema.String,
  userId: UserId,
  createdAt: Schema.DateTimeUtc,
});
export type Account = typeof Account.Type;

// Account management
export const UpdateUserInput = Schema.Struct({
  name: Schema.optional(Schema.String.pipe(Schema.minLength(1), Schema.maxLength(100))),
  image: Schema.optional(Schema.NullOr(Schema.String)),
});
export type UpdateUserInput = typeof UpdateUserInput.Type;

export const ChangePasswordInput = Schema.Struct({
  currentPassword: Schema.String.pipe(
    Schema.minLength(1, { message: () => "Current password is required" })
  ),
  newPassword: Schema.String.pipe(
    Schema.minLength(8, { message: () => "Password must be at least 8 characters" }),
    Schema.maxLength(100, { message: () => "Password must be less than 100 characters" })
  ),
});
export type ChangePasswordInput = typeof ChangePasswordInput.Type;

export const ChangeEmailInput = Schema.Struct({
  newEmail: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: () => "Invalid email address" })
  ),
});
export type ChangeEmailInput = typeof ChangeEmailInput.Type;

export const DeleteAccountInput = Schema.Struct({
  password: Schema.String.pipe(
    Schema.minLength(1, { message: () => "Password is required" })
  ),
});
export type DeleteAccountInput = typeof DeleteAccountInput.Type;
```

---

### 2.4 Update Domain Index

**File:** `src/features/auth/domain/index.ts`

**Add exports:**
```typescript
export * from "./auth.schema.js";
export * from "./auth.user-id.js";
export * from "./auth.context.js";
export * from "./organization.schema.js";
export * from "./team.schema.js";
export * from "./security.schema.js";
```

---

## Phase 3: Client Layer - Auth Client with Plugins

### 3.1 Update Auth Client

**File:** `src/features/auth/client/auth.client.ts`

**Changes:**
- Import Better Auth client plugins
- Add plugins to client configuration
- Export inferred types

```typescript
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { passkeyClient } from "better-auth/client/plugins";
import { twoFactorClient } from "better-auth/client/plugins";

/**
 * Better Auth client for React components with organization, passkey, and 2FA support.
 * 
 * Features:
 * - Email/password authentication
 * - Google OAuth
 * - Organizations with members and invitations
 * - Teams within organizations
 * - Passkeys (WebAuthn)
 * - Two-factor authentication (TOTP)
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  plugins: [
    organizationClient(),
    passkeyClient(),
    twoFactorClient(),
  ],
});

// Export inferred types from the client
export type AuthClient = typeof authClient;
export type Session = typeof authClient.$Infer.Session;
export type Organization = typeof authClient.$Infer.Organization;
export type Member = typeof authClient.$Infer.Member;
export type Invitation = typeof authClient.$Infer.Invitation;
export type Team = typeof authClient.$Infer.Team;
```

---

## Phase 4: Effect-Atom State Management

### 4.1 New Directory Structure

```
src/features/auth/client/
  atoms/
    session.atoms.ts       # Session + sign in/out/up + OAuth
    organization.atoms.ts  # Organizations + members + invitations
    team.atoms.ts          # Teams + team members
    security.atoms.ts      # Passkeys, 2FA, sessions, linked accounts
    account.atoms.ts       # Profile updates, password, email
    index.ts               # Re-exports
  auth.client.ts           # Better Auth client (updated)
  index.ts                 # Client exports
```

---

### 4.2 Session Atoms (Refactored)

**File:** `src/features/auth/client/atoms/session.atoms.ts`

**Purpose:** Session management, sign in/out/up, and OAuth

**Refactor existing `auth.atoms.tsx` and add:**

```typescript
import { Atom, Result } from "@effect-atom/atom-react";
import * as Effect from "effect/Effect";
import {
  type SessionData,
  type SignInInput,
  type SignUpInput,
} from "../../domain/index.js";
import { authClient } from "../auth.client.js";

/**
 * AuthApi - Effect Service wrapper around Better Auth client
 */
class AuthApi extends Effect.Service<AuthApi>()("@features/auth/AuthApi", {
  effect: Effect.sync(() => ({
    getSession: () =>
      Effect.tryPromise({
        try: async () => {
          const result = await authClient.getSession();
          return result.data as SessionData;
        },
        catch: (error) => new Error(`Failed to get session: ${error}`),
      }),

    signIn: (input: SignInInput) =>
      Effect.tryPromise({
        try: async () => {
          const result = await authClient.signIn.email(input);
          if (result.error) {
            throw new Error(result.error.message || "Sign in failed");
          }
          return result.data;
        },
        catch: (error) =>
          new Error(`Sign in failed: ${error instanceof Error ? error.message : error}`),
      }),

    signInWithGoogle: () =>
      Effect.tryPromise({
        try: async () => {
          const result = await authClient.signIn.social({
            provider: "google",
            callbackURL: window.location.origin,
          });
          if (result.error) {
            throw new Error(result.error.message || "Google sign in failed");
          }
          // OAuth redirect happens automatically
          return result.data;
        },
        catch: (error) => new Error(`Google sign in failed: ${error}`),
      }),

    signInWithPasskey: () =>
      Effect.tryPromise({
        try: async () => {
          const result = await authClient.signIn.passkey();
          if (result.error) {
            throw new Error(result.error.message || "Passkey sign in failed");
          }
          return result.data;
        },
        catch: (error) => new Error(`Passkey sign in failed: ${error}`),
      }),

    signOut: () =>
      Effect.tryPromise({
        try: async () => {
          const result = await authClient.signOut();
          return result.data;
        },
        catch: (error) => new Error(`Sign out failed: ${error}`),
      }),

    signUp: (input: SignUpInput) =>
      Effect.tryPromise({
        try: async () => {
          const result = await authClient.signUp.email(input);
          if (result.error) {
            throw new Error(result.error.message || "Sign up failed");
          }
          return result.data;
        },
        catch: (error) =>
          new Error(`Sign up failed: ${error instanceof Error ? error.message : error}`),
      }),
  })),
}) {}

export const authRuntime = Atom.runtime(AuthApi.Default);

// Session Atom (keep existing implementation)
export const sessionAtom = (() => {
  const remoteAtom = authRuntime.atom(
    Effect.gen(function* () {
      const api = yield* AuthApi;
      return yield* api.getSession();
    })
  );

  return Object.assign(
    Atom.writable(
      (get) => get(remoteAtom),
      (ctx, session: SessionData) => {
        ctx.setSelf(Result.success(session));
      },
      (refresh) => {
        refresh(remoteAtom);
      }
    ),
    { remote: remoteAtom }
  );
})();

// Sign In Atom (keep existing)
export const signInAtom = authRuntime.fn<SignInInput>()(
  Effect.fnUntraced(function* (input, get) {
    const api = yield* AuthApi;
    const signInResponse = yield* api.signIn(input);
    const freshSession = yield* api.getSession();
    get.set(sessionAtom, freshSession);
    return signInResponse;
  })
);

// NEW: Google Sign In Atom
export const signInWithGoogleAtom = authRuntime.fn<void>()(
  Effect.fnUntraced(function* (_, _get) {
    const api = yield* AuthApi;
    return yield* api.signInWithGoogle();
  })
);

// NEW: Passkey Sign In Atom
export const signInWithPasskeyAtom = authRuntime.fn<void>()(
  Effect.fnUntraced(function* (_, get) {
    const api = yield* AuthApi;
    const result = yield* api.signInWithPasskey();
    const freshSession = yield* api.getSession();
    get.set(sessionAtom, freshSession);
    return result;
  })
);

// Sign Out Atom (keep existing)
export const signOutAtom = authRuntime.fn<void>()(
  Effect.fnUntraced(function* (_, get) {
    const api = yield* AuthApi;
    const result = yield* api.signOut();
    get.set(sessionAtom, null);
    return result;
  })
);

// Sign Up Atom (keep existing)
export const signUpAtom = authRuntime.fn<SignUpInput>()(
  Effect.fnUntraced(function* (input, get) {
    const api = yield* AuthApi;
    const signUpResponse = yield* api.signUp(input);
    const freshSession = yield* api.getSession();
    get.set(sessionAtom, freshSession);
    return signUpResponse;
  })
);
```

---

### 4.3 Organization Atoms

**New File:** `src/features/auth/client/atoms/organization.atoms.ts`

**Purpose:** Organization CRUD, members, and invitations

See full implementation in Phase 4.2 of the original plan above (very long, includes all organization atoms).

**Key Atoms:**
- `organizationsAtom` - List of user's organizations with cache updates
- `activeOrganizationAtom` - Currently active organization
- `createOrganizationAtom` - Create new organization
- `setActiveOrganizationAtom` - Switch active organization
- `deleteOrganizationAtom` - Delete organization
- `createMembersAtom(orgId)` - Factory for per-org members list
- `inviteMemberAtom` - Invite member to organization
- `removeMemberAtom` - Remove member from organization
- `updateMemberRoleAtom` - Update member role
- `createInvitationsAtom(orgId)` - Factory for per-org invitations list
- `cancelInvitationAtom` - Cancel pending invitation

---

### 4.4 Team Atoms

**New File:** `src/features/auth/client/atoms/team.atoms.ts`

**Purpose:** Teams within organizations

**Key Atoms:**
- `createTeamsAtom(orgId)` - Factory for per-org teams list
- `createTeamAtom` - Create new team
- `deleteTeamAtom` - Delete team
- `updateTeamAtom` - Update team name
- `createTeamMembersAtom(teamId)` - Factory for per-team members list
- `addTeamMemberAtom` - Add member to team
- `removeTeamMemberAtom` - Remove member from team

---

### 4.5 Security Atoms

**New File:** `src/features/auth/client/atoms/security.atoms.ts`

**Purpose:** Passkeys, 2FA, sessions, and linked accounts

**Key Atoms:**

**Passkeys:**
- `passkeysAtom` - List of user's passkeys
- `addPasskeyAtom` - Register new passkey
- `deletePasskeyAtom` - Delete passkey

**Two-Factor:**
- `twoFactorStatusAtom` - 2FA enabled status and backup codes count
- `enableTwoFactorAtom` - Enable 2FA (returns TOTP URI and backup codes)
- `disableTwoFactorAtom` - Disable 2FA
- `verifyTOTPAtom` - Verify TOTP code

**Sessions:**
- `sessionsAtom` - List of active sessions
- `revokeSessionAtom` - Revoke a session

**Linked Accounts:**
- `accountsAtom` - List of linked OAuth providers
- `unlinkAccountAtom` - Unlink OAuth provider

---

### 4.6 Account Atoms

**New File:** `src/features/auth/client/atoms/account.atoms.ts`

**Purpose:** User profile updates, password, email

**Key Atoms:**
- `updateUserAtom` - Update name/image
- `changePasswordAtom` - Change password
- `changeEmailAtom` - Change email
- `deleteAccountAtom` - Delete user account

---

### 4.7 Atoms Index

**New File:** `src/features/auth/client/atoms/index.ts`

```typescript
// Session & Authentication
export * from "./session.atoms.js";

// Organizations & Members
export * from "./organization.atoms.js";

// Teams
export * from "./team.atoms.js";

// Security (Passkeys, 2FA, Sessions)
export * from "./security.atoms.js";

// Account Management
export * from "./account.atoms.js";
```

---

## Phase 5: UI Components

### 5.1 Directory Structure

```
src/features/auth/ui/
  components/
    user/
      user-avatar.tsx           # User avatar with fallback
      user-button.tsx           # User dropdown button
      user-view.tsx             # User name + email display
      index.ts
    organization/
      organization-switcher.tsx # Organization/personal account switcher
      organization-view.tsx     # Organization name display
      organization-logo.tsx     # Organization logo with fallback
      create-organization-dialog.tsx
      delete-organization-dialog.tsx
      update-organization-dialog.tsx
      members-card.tsx          # Members list card
      member-cell.tsx           # Single member row
      invite-member-dialog.tsx
      update-member-role-dialog.tsx
      remove-member-dialog.tsx
      invitations-card.tsx      # Invitations list card
      invitation-cell.tsx       # Single invitation row
      index.ts
    team/
      teams-card.tsx            # Teams list card
      team-cell.tsx             # Single team row
      create-team-dialog.tsx
      delete-team-dialog.tsx
      update-team-dialog.tsx
      team-members-card.tsx
      team-member-cell.tsx
      index.ts
    settings/
      account-settings-card.tsx # Combined account settings
      update-name-card.tsx
      update-avatar-card.tsx
      change-email-card.tsx
      change-password-card.tsx
      delete-account-card.tsx
      delete-account-dialog.tsx
      sessions-card.tsx         # Active sessions list
      session-cell.tsx          # Single session row
      providers-card.tsx        # Linked OAuth providers
      provider-cell.tsx         # Single provider row
      passkeys-card.tsx         # Passkeys list
      passkey-cell.tsx          # Single passkey row
      two-factor-card.tsx       # 2FA settings
      two-factor-setup-dialog.tsx
      backup-codes-dialog.tsx
      index.ts
    auth/
      sign-in-card.tsx          # Sign in form
      sign-up-card.tsx          # Sign up form
      social-buttons.tsx        # OAuth buttons (Google)
      passkey-button.tsx        # Passkey sign in button
      two-factor-verify.tsx     # 2FA verification during login
      forgot-password-card.tsx
      reset-password-card.tsx
      index.ts
  hooks/
    use-current-organization.ts
    use-has-permission.ts
    index.ts
  localization/
    auth-localization.ts      # All UI strings
    error-codes.ts            # Error message mappings
    index.ts
  lib/
    social-providers.ts       # Provider icons and metadata
    utils.ts                  # Shared utilities
    index.ts
  index.ts                    # Main UI exports
```

---

### 5.2 Component Design Patterns

**TanStack Form Integration:**

All forms use `@tanstack/react-form` with Effect Schema validation:

```tsx
import { useForm } from "@tanstack/react-form";
import { makeFormOptions } from "@/lib/forms/make-form-options";
import * as Schema from "effect/Schema";

const form = useForm({
  ...makeFormOptions({
    defaultValues: { ... },
    schema: YourSchema,
    validator: "onSubmit",
  }),
  onSubmit: async ({ value }) => {
    // Handle submit
  },
});
```

**Effect-Atom Integration:**

All state uses atoms, no Context API:

```tsx
import { useAtom, useAtomValue, Result } from "@effect-atom/atom-react";

const sessionResult = useAtomValue(sessionAtom);
const [createResult, create] = useAtom(createOrganizationAtom);

// Check states
const isPending = Result.isInitial(sessionResult) && sessionResult.waiting;
const hasError = Result.isFailure(createResult);
const data = Result.isSuccess(sessionResult) ? sessionResult.value : null;
```

**ShadCN Namespace Pattern:**

All compound components use namespace pattern:

```tsx
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description</Card.Description>
  </Card.Header>
  <Card.Content>Content</Card.Content>
</Card>
```

---

### 5.3 Key Component Examples

**UserAvatar:**
- Displays user image or initials
- Skeleton loading state
- Supports sizes: sm, default, lg, xl

**UserButton:**
- Dropdown with user info
- Sign out action
- Links to account settings
- Icon or full button modes

**OrganizationSwitcher:**
- Switch between personal account and organizations
- Create organization dialog
- Settings link for active org
- Supports "icon" and "default" sizes

**SignInCard:**
- Email/password form with TanStack Form
- Social buttons (Google)
- Passkey button
- Link to sign up
- Error handling

**ChangePasswordCard:**
- Current password + new password fields
- TanStack Form validation
- Effect-Atom for submission
- Success/error feedback

---

### 5.4 Localization

**File:** `src/features/auth/ui/localization/auth-localization.ts`

All UI strings in one place for easy i18n:

```typescript
export const authLocalization = {
  // General
  LOADING: "Loading...",
  SAVE: "Save",
  CANCEL: "Cancel",
  DELETE: "Delete",
  
  // Auth
  SIGN_IN: "Sign In",
  SIGN_UP: "Sign Up",
  SIGN_OUT: "Sign Out",
  
  // Organization
  CREATE_ORGANIZATION: "Create Organization",
  ORGANIZATION_NAME: "Organization Name",
  MEMBERS: "Members",
  
  // Security
  CHANGE_PASSWORD: "Change Password",
  ENABLE_2FA: "Enable Two-Factor Authentication",
  PASSKEYS: "Passkeys",
  
  // Errors
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_ALREADY_EXISTS: "An account with this email already exists",
  // ... etc
} as const;
```

---

## Phase 6: Routes

### 6.1 Route Structure

```
src/routes/
  account/
    settings.tsx       # Profile settings (name, avatar, email)
    security.tsx       # Security settings (password, 2FA, passkeys, sessions)
  organization/
    settings.tsx       # Organization settings (name, slug, logo)
    members.tsx        # Members + invitations management
    teams.tsx          # Teams management
  auth/
    callback.tsx       # OAuth callback handler
    forgot-password.tsx
    reset-password.tsx
    two-factor.tsx     # 2FA verification during login
  sign-in.tsx          # Update existing
  sign-up.tsx          # Update existing
```

---

### 6.2 Example Routes

**Account Settings:**

```tsx
// src/routes/account/settings.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@shadcn";
import { useAtomValue, Result } from "@effect-atom/atom-react";
import { sessionAtom } from "@/features/auth/client/atoms";
import {
  UpdateNameCard,
  UpdateAvatarCard,
  ChangeEmailCard,
  DeleteAccountCard,
} from "@/features/auth/ui";

export const Route = createFileRoute("/account/settings")({
  component: AccountSettingsPage,
});

function AccountSettingsPage() {
  const sessionResult = useAtomValue(sessionAtom);

  if (!Result.isSuccess(sessionResult) || !sessionResult.value) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <Card.Content className="py-8 text-center text-muted-foreground">
            Please sign in to access account settings.
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <h1 className="text-2xl font-bold">Account Settings</h1>
      
      <UpdateAvatarCard />
      <UpdateNameCard />
      <ChangeEmailCard />
      <DeleteAccountCard />
    </div>
  );
}
```

**Organization Members:**

```tsx
// src/routes/organization/members.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useAtomValue, Result } from "@effect-atom/atom-react";
import { activeOrganizationAtom } from "@/features/auth/client/atoms";
import { MembersCard, InvitationsCard } from "@/features/auth/ui";

export const Route = createFileRoute("/organization/members")({
  component: OrganizationMembersPage,
});

function OrganizationMembersPage() {
  const activeOrgResult = useAtomValue(activeOrganizationAtom);

  if (!Result.isSuccess(activeOrgResult) || !activeOrgResult.value) {
    return (
      <div className="container max-w-4xl py-8">
        <p className="text-muted-foreground">No active organization selected.</p>
      </div>
    );
  }

  const org = activeOrgResult.value;

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <h1 className="text-2xl font-bold">{org.name} - Members</h1>
      
      <MembersCard organizationId={org.id} />
      <InvitationsCard organizationId={org.id} />
    </div>
  );
}
```

---

## Phase 7: Update Existing Files

### 7.1 Update Navigation Component

**File:** `src/components/navigation.tsx`

**Changes:**
- Replace basic user display with `UserButton`
- Add `OrganizationSwitcher`
- Keep existing navigation structure

```tsx
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@shadcn";
import { UserButton } from "@/features/auth/ui";
import { OrganizationSwitcher } from "@/features/auth/ui";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/account/settings", label: "Account" },
  { path: "/organization/settings", label: "Organization" },
];

export function Navigation() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <nav className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive
                      ? "text-foreground border-b-2 border-primary pb-1"
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-3">
            <OrganizationSwitcher size="default" />
            <UserButton size="icon" />
          </div>
        </div>
      </div>
    </nav>
  );
}
```

---

### 7.2 Update Auth Feature Index

**File:** `src/features/auth/index.ts`

```typescript
// Domain schemas
export * from "./domain/index.js";

// Client atoms and auth client
export * from "./client/atoms/index.js";
export { authClient } from "./client/auth.client.js";
export type { AuthClient, Session, Organization, Member } from "./client/auth.client.js";

// UI components and hooks
export * from "./ui/index.js";
```

---

### 7.3 Update Client Index

**File:** `src/features/auth/client/index.ts`

```typescript
export * from "./atoms/index.js";
export { authClient } from "./auth.client.js";
export type { AuthClient, Session, Organization, Member } from "./auth.client.js";
```

---

## Implementation Order - Sprint Breakdown

### Sprint 1: Foundation (Server + Domain)
**Estimated Time:** 2-3 hours

**Tasks:**
1. ✅ Update `.env.example` with new OAuth vars
2. ✅ Update `better-auth.config.ts` with new env vars
3. ✅ Create `email.service.ts` (mocked)
4. ✅ Update `better-auth.service.ts` with all plugins
5. ✅ Create `organization.schema.ts`
6. ✅ Create `team.schema.ts`
7. ✅ Create `security.schema.ts`
8. ✅ Update `domain/index.ts`
9. ✅ Update `auth.client.ts` with plugins
10. ✅ Test: Run app, verify migrations execute successfully

**Validation:**
- App starts without errors
- Database has new tables (organization, member, team, passkey, etc.)
- Better Auth OpenAPI endpoint shows new routes

---

### Sprint 2: Core Auth Atoms + UI
**Estimated Time:** 4-5 hours

**Tasks:**
1. ✅ Refactor `auth.atoms.tsx` → `atoms/session.atoms.ts`
2. ✅ Add Google OAuth atom
3. ✅ Add passkey sign-in atom
4. ✅ Create `atoms/index.ts`
5. ✅ Create `UserAvatar` component
6. ✅ Create `UserView` component
7. ✅ Create `UserButton` component
8. ✅ Create `SocialButtons` component
9. ✅ Create `PasskeyButton` component
10. ✅ Update `SignInCard` with social + passkey
11. ✅ Update `SignUpCard` with social
12. ✅ Create `/auth/callback.tsx` route
13. ✅ Update `navigation.tsx` with `UserButton`
14. ✅ Test: Sign in, sign out, OAuth flow

**Validation:**
- Can sign in with email/password
- Google OAuth redirects correctly
- UserButton shows correct state
- Sign out works

---

### Sprint 3: Account Management
**Estimated Time:** 3-4 hours

**Tasks:**
1. ✅ Create `account.atoms.ts`
2. ✅ Create `UpdateNameCard`
3. ✅ Create `UpdateAvatarCard` (mocked upload)
4. ✅ Create `ChangeEmailCard`
5. ✅ Create `ChangePasswordCard`
6. ✅ Create `DeleteAccountCard`
7. ✅ Create `DeleteAccountDialog`
8. ✅ Create `/account/settings.tsx` route
9. ✅ Test: Update name, change password

**Validation:**
- Can update user name
- Can change password
- Delete account requires confirmation

---

### Sprint 4: Organizations
**Estimated Time:** 6-7 hours

**Tasks:**
1. ✅ Create `organization.atoms.ts`
2. ✅ Create `OrganizationLogo` component
3. ✅ Create `OrganizationView` component
4. ✅ Create `OrganizationSwitcher`
5. ✅ Create `CreateOrganizationDialog`
6. ✅ Create `DeleteOrganizationDialog`
7. ✅ Create `MembersCard`
8. ✅ Create `MemberCell`
9. ✅ Create `InviteMemberDialog`
10. ✅ Create `UpdateMemberRoleDialog`
11. ✅ Create `RemoveMemberDialog`
12. ✅ Create `InvitationsCard`
13. ✅ Create `InvitationCell`
14. ✅ Create `/organization/settings.tsx`
15. ✅ Create `/organization/members.tsx`
16. ✅ Update `navigation.tsx` with `OrganizationSwitcher`
17. ✅ Test: Create org, invite members, switch orgs

**Validation:**
- Can create organization
- Can switch between personal and org
- Can invite members (see email logs)
- Can remove members
- Can update member roles

---

### Sprint 5: Teams
**Estimated Time:** 3-4 hours

**Tasks:**
1. ✅ Create `team.atoms.ts`
2. ✅ Create `TeamsCard`
3. ✅ Create `TeamCell`
4. ✅ Create `CreateTeamDialog`
5. ✅ Create `DeleteTeamDialog`
6. ✅ Create `UpdateTeamDialog`
7. ✅ Create `TeamMembersCard`
8. ✅ Create `TeamMemberCell`
9. ✅ Create `/organization/teams.tsx`
10. ✅ Test: Create teams, add members

**Validation:**
- Can create teams within organization
- Can add organization members to teams
- Can delete teams

---

### Sprint 6: Security
**Estimated Time:** 5-6 hours

**Tasks:**
1. ✅ Create `security.atoms.ts`
2. ✅ Create `SessionsCard`
3. ✅ Create `SessionCell`
4. ✅ Create `PasskeysCard`
5. ✅ Create `PasskeyCell`
6. ✅ Create `TwoFactorCard`
7. ✅ Create `TwoFactorSetupDialog`
8. ✅ Create `BackupCodesDialog`
9. ✅ Create `ProvidersCard`
10. ✅ Create `ProviderCell`
11. ✅ Create `/account/security.tsx`
12. ✅ Create `/auth/two-factor.tsx` (verification flow)
13. ✅ Test: Enable 2FA, use passkey, revoke session

**Validation:**
- Can enable 2FA (see QR code, backup codes)
- Can disable 2FA with password
- Can add passkey (WebAuthn flow)
- Can sign in with passkey
- Can revoke sessions
- Can unlink OAuth provider

---

## Files Summary

### New Files (~50 files)

**Server:**
- `src/features/auth/server/email.service.ts`

**Domain:**
- `src/features/auth/domain/organization.schema.ts`
- `src/features/auth/domain/team.schema.ts`
- `src/features/auth/domain/security.schema.ts`

**Client Atoms:**
- `src/features/auth/client/atoms/session.atoms.ts` (refactored)
- `src/features/auth/client/atoms/organization.atoms.ts`
- `src/features/auth/client/atoms/team.atoms.ts`
- `src/features/auth/client/atoms/security.atoms.ts`
- `src/features/auth/client/atoms/account.atoms.ts`
- `src/features/auth/client/atoms/index.ts`

**UI Components (~30 files):**
- User: `user-avatar.tsx`, `user-view.tsx`, `user-button.tsx`
- Organization: `organization-switcher.tsx`, `organization-view.tsx`, `organization-logo.tsx`, `create-organization-dialog.tsx`, `delete-organization-dialog.tsx`, `members-card.tsx`, `member-cell.tsx`, `invite-member-dialog.tsx`, `update-member-role-dialog.tsx`, `remove-member-dialog.tsx`, `invitations-card.tsx`, `invitation-cell.tsx`
- Team: `teams-card.tsx`, `team-cell.tsx`, `create-team-dialog.tsx`, `delete-team-dialog.tsx`, `team-members-card.tsx`, `team-member-cell.tsx`
- Settings: `update-name-card.tsx`, `update-avatar-card.tsx`, `change-email-card.tsx`, `change-password-card.tsx`, `delete-account-card.tsx`, `sessions-card.tsx`, `session-cell.tsx`, `providers-card.tsx`, `provider-cell.tsx`, `passkeys-card.tsx`, `passkey-cell.tsx`, `two-factor-card.tsx`, `two-factor-setup-dialog.tsx`, `backup-codes-dialog.tsx`
- Auth: `social-buttons.tsx`, `passkey-button.tsx`, `two-factor-verify.tsx`, (update existing `sign-in-card.tsx`, `sign-up-card.tsx`)

**UI Infrastructure:**
- `src/features/auth/ui/hooks/use-current-organization.ts`
- `src/features/auth/ui/hooks/use-has-permission.ts`
- `src/features/auth/ui/localization/auth-localization.ts`
- `src/features/auth/ui/localization/error-codes.ts`
- `src/features/auth/ui/lib/social-providers.ts`
- `src/features/auth/ui/lib/utils.ts`
- `src/features/auth/ui/index.ts`

**Routes:**
- `src/routes/account/settings.tsx`
- `src/routes/account/security.tsx`
- `src/routes/organization/settings.tsx`
- `src/routes/organization/members.tsx`
- `src/routes/organization/teams.tsx`
- `src/routes/auth/callback.tsx`
- `src/routes/auth/two-factor.tsx`

### Modified Files (~10 files)

- `.env.example`
- `src/features/auth/server/better-auth.config.ts`
- `src/features/auth/server/better-auth.service.ts`
- `src/features/auth/client/auth.client.ts`
- `src/features/auth/client/index.ts`
- `src/features/auth/domain/index.ts`
- `src/features/auth/index.ts`
- `src/components/navigation.tsx`
- `src/routes/sign-in.tsx` (update to use new `SignInCard`)
- `src/routes/sign-up.tsx` (update to use new `SignUpCard`)

---

## Testing Checklist

### Core Auth
- [ ] Sign in with email/password
- [ ] Sign up with email/password
- [ ] Sign in with Google OAuth
- [ ] Sign in with passkey
- [ ] Sign out
- [ ] 2FA verification during login

### Account Management
- [ ] Update user name
- [ ] Update avatar (mocked)
- [ ] Change email
- [ ] Change password
- [ ] Delete account (with confirmation)

### Organizations
- [ ] Create organization
- [ ] Switch between personal and organization
- [ ] Update organization name
- [ ] Delete organization
- [ ] Invite member (check email logs)
- [ ] Remove member
- [ ] Update member role
- [ ] Cancel invitation

### Teams
- [ ] Create team
- [ ] Add members to team
- [ ] Remove members from team
- [ ] Update team name
- [ ] Delete team

### Security
- [ ] Enable 2FA (view QR code)
- [ ] Disable 2FA
- [ ] View backup codes
- [ ] Add passkey
- [ ] Delete passkey
- [ ] View active sessions
- [ ] Revoke session
- [ ] Link OAuth provider
- [ ] Unlink OAuth provider

---

## Next Steps After Implementation

1. **Replace Mock Email Service**
   - Integrate real email service (Resend, SendGrid, etc.)
   - Update `email.service.ts`

2. **Avatar Upload**
   - Implement UploadThing integration in `UpdateAvatarCard`
   - Add organization logo upload

3. **More OAuth Providers**
   - Add GitHub, Discord, Microsoft
   - Update `better-auth.service.ts` config
   - Add provider buttons to `SocialButtons`

4. **Permissions System**
   - Implement `useHasPermission` hook
   - Add permission checks to UI components
   - Create custom permissions beyond roles

5. **Email Verification**
   - Enable email verification in Better Auth
   - Create verification UI flow

6. **API Keys**
   - Add organization-level API keys
   - Create API keys UI components

7. **Analytics & Monitoring**
   - Track auth events
   - Monitor failed login attempts
   - Session analytics

---

## Notes

- **No AuthProvider Context:** All state managed via Effect-Atom atoms
- **TanStack Form:** All forms use `@tanstack/react-form` with Effect Schema
- **Type Safety:** Effect Schemas provide runtime validation + TypeScript types
- **Optimistic Updates:** Cache updates happen immediately for instant UI feedback
- **Error Handling:** All errors flow through Effect's error channel
- **Mocked Services:** Email service logs to console for development
- **Extensible:** Easy to add more OAuth providers, custom roles, etc.

---

## Reference Links

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Effect-Atom Docs](https://effect-ts.github.io/atom/)
- [TanStack Form Docs](https://tanstack.com/form/latest)
- [Effect Docs](https://effect.website/)

---

**End of Plan**
