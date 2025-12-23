import { betterAuth } from "better-auth";
import type { BetterAuthOptions } from "better-auth";
import { getMigrations } from "better-auth/db";
import * as Effect from "effect/Effect";
import { openAPI } from "better-auth/plugins";
import { BetterAuthConfig, getAuthSecret } from "./better-auth.config.js";
import { BetterAuthDatabase } from "./better-auth.database.js";

export type BetterAuthInstance = ReturnType<typeof betterAuth>;

/**
 * Creates Better Auth options.
 * Exported so it can be reused in auth.ts for CLI tools.
 */
export const makeBetterAuthOptions = (params: {
	baseURL: string;
	secret: string;
	clientOrigin: string;
	db: unknown; // Kysely instance
}): BetterAuthOptions => ({
	baseURL: params.baseURL,
	secret: params.secret,
	emailAndPassword: {
		enabled: true,
	},
	database: {
		db: params.db,
		type: "postgres" as const,
		casing: "camel" as const,
	},
	plugins: [openAPI()],
	trustedOrigins: [params.clientOrigin, params.baseURL],
});

const makeBetterAuth = Effect.gen(function* () {
	const env = yield* BetterAuthConfig;
	const kysely = yield* BetterAuthDatabase;

	const options = makeBetterAuthOptions({
		baseURL: env.BETTER_AUTH_URL,
		secret: getAuthSecret(env),
		clientOrigin: env.CLIENT_ORIGIN,
		db: kysely,
	});

	const { runMigrations } = yield* Effect.promise(() =>
		getMigrations(options),
	);
	yield* Effect.promise(runMigrations);

	return betterAuth(options);
});

export class BetterAuthService extends Effect.Service<BetterAuthService>()(
	"BetterAuthService",
	{
		effect: makeBetterAuth,
		dependencies: [BetterAuthDatabase.Default, BetterAuthConfig.Default],
	},
) {}
