/**
 * Server function to check if the current user is an admin.
 * Used in route protection for admin-only pages.
 */

import { createServerFn } from '@tanstack/react-start';
import { serverRuntime } from '../core/server/server-runtime.js';
import { AuthService } from '@auth/server';
import * as Effect from 'effect/Effect';

export interface AdminCheckResult {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userId?: string;
  role?: string;
}

/**
 * Check if the current user is authenticated and has admin privileges.
 */
export const checkAdmin = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AdminCheckResult> => {
    try {
      const result = await serverRuntime.runPromise(
        Effect.gen(function* () {
          const auth = yield* AuthService;

          // Better Auth automatically reads session from request context
          const session = yield* Effect.promise(() => auth.api.getSession());

          if (!session) {
            return {
              isAuthenticated: false,
              isAdmin: false,
            };
          }

          const isAdmin =
            session.user.role === 'admin' || session.user.role === 'superadmin';

          return {
            isAuthenticated: true,
            isAdmin,
            userId: session.user.id,
            role: session.user.role,
          };
        }),
      );

      return result;
    } catch (error) {
      console.error('[checkAdmin] Error checking admin status:', error);
      return {
        isAuthenticated: false,
        isAdmin: false,
      };
    }
  },
);
