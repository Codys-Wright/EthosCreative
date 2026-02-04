/**
 * Server function to check if the current user is an instructor/admin.
 * Used in route protection for admin-only pages and courses.
 */

import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { serverRuntime } from "../core/server/server-runtime.js";
import { AuthService } from "@auth/server";
import * as Effect from "effect/Effect";

export interface InstructorCheckResult {
  isAuthenticated: boolean;
  isInstructor: boolean;
  userId?: string;
  role?: string;
}

/**
 * Check if the current user is authenticated and has instructor/admin privileges.
 */
export const checkInstructor = createServerFn({ method: "GET" }).handler(
  async (): Promise<InstructorCheckResult> => {
    const result = await serverRuntime.runPromiseExit(
      Effect.gen(function* () {
        const auth = yield* AuthService;
        const headers = getRequestHeaders();

        const session = yield* Effect.tryPromise({
          try: () => auth.api.getSession({ headers }),
          catch: (error) => new Error(`Failed to get session: ${error}`),
        });

        if (!session) {
          return {
            isAuthenticated: false,
            isInstructor: false,
          };
        }

        // Better Auth's native type may not include role, but our DB schema has it
        const user = session.user as { id: string; role?: string | null };
        const role = user.role ?? undefined;

        const isInstructor =
          role === "admin" || role === "superadmin" || role === "instructor";

        return {
          isAuthenticated: true,
          isInstructor,
          userId: session.user.id,
          role,
        };
      }).pipe(
        Effect.catchAll(() =>
          Effect.succeed({
            isAuthenticated: false,
            isInstructor: false,
          })
        )
      )
    );

    if (result._tag === "Success") {
      return result.value;
    }

    return {
      isAuthenticated: false,
      isInstructor: false,
    };
  }
);
