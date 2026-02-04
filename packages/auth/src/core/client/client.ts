import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  anonymousClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

/**
 * Better Auth client for React components with admin, organization, passkey, 2FA, and anonymous auth support.
 *
 * Features:
 * - Email/password authentication
 * - Google OAuth
 * - Anonymous authentication (no signup required)
 * - Account linking (connect multiple auth methods)
 * - Admin operations (create users, ban, impersonate, etc.)
 * - Organizations with members and invitations
 * - Teams within organizations
 * - Passkeys (WebAuthn)
 * - Two-factor authentication (TOTP)
 *
 * @example
 * ```tsx
 * // Sign in anonymously (no email/password required)
 * await authClient.signIn.anonymous();
 *
 * // Sign in with email/password
 * await authClient.signIn.email({
 *   email: "user@example.com",
 *   password: "password123",
 * });
 *
 * // Sign in with Google
 * await authClient.signIn.social({ provider: "google" });
 *
 * // Link a social account to existing session
 * await authClient.linkSocial({
 *   provider: "google",
 *   callbackURL: "/callback",
 * });
 *
 * // Create organization
 * await authClient.organization.create({ name: "My Org" });
 *
 * // Admin: Ban user
 * await authClient.admin.banUser({
 *   userId: "user-id",
 *   banReason: "Spamming",
 * });
 *
 * // Get session
 * const { data: session } = await authClient.getSession();
 *
 * // Sign out
 * await authClient.signOut();
 * ```
 */
const getBaseURL = () => {
  // Use VITE_API_URL if available (set in netlify.toml and .env)
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fall back to window.location.origin in browser
  if (
    typeof window !== "undefined" &&
    window.location?.origin &&
    window.location.origin !== "null"
  ) {
    return window.location.origin;
  }
  return "";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [
    adminClient(),
    anonymousClient(),
    organizationClient({
      teams: {
        enabled: true,
      },
    }),
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
