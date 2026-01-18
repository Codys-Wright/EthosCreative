/**
 * Server function to check if the current user is an admin.
 * Used in route protection for admin-only pages.
 */

import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
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
    const result = await serverRuntime.runPromiseExit(
      Effect.gen(function* () {
        const auth = yield* AuthService;
        const headers = getRequestHeaders();

        yield* Effect.logInfo('[checkAdmin] Checking admin status with headers...');

        // Get session with explicit headers from TanStack Start request
        const session = yield* Effect.tryPromise({
          try: () =>
            auth.api.getSession({
              headers,
            }),
          catch: (error) => new Error(`Failed to get session: ${error}`),
        });

        yield* Effect.logInfo('[checkAdmin] Raw session result:', { session });

        if (!session) {
          yield* Effect.logInfo('[checkAdmin] No session found');
          return {
            isAuthenticated: false,
            isAdmin: false,
          };
        }

        yield* Effect.logInfo('[checkAdmin] Session retrieved:', {
          userId: session.user.id,
          role: session.user.role,
          isAnonymous: session.user.isAnonymous,
        });

        const isAdmin =
          session.user.role === 'admin' || session.user.role === 'superadmin';

        yield* Effect.logInfo('[checkAdmin] Admin check:', { isAdmin });

        return {
          isAuthenticated: true,
          isAdmin,
          userId: session.user.id,
          role: session.user.role,
        };
      }).pipe(
        Effect.catchAll((error) =>
          Effect.gen(function* () {
            yield* Effect.logError('[checkAdmin] Error checking admin:', error);
            return {
              isAuthenticated: false,
              isAdmin: false,
            };
          }),
        ),
      ),
    );

    if (result._tag === 'Success') {
      return result.value;
    }

    // Should not reach here due to catchAll, but handle just in case
    return {
      isAuthenticated: false,
      isAdmin: false,
    };
  },
);
