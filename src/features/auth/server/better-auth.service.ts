import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db";
import * as Effect from "effect/Effect";
import { openAPI } from "better-auth/plugins";
import { BetterAuthConfig, getAuthSecret } from "./better-auth.config.js";
import { BetterAuthDatabase } from "./better-auth.database.js";

export type BetterAuthInstance = ReturnType<typeof betterAuth>;

const makeBetterAuth = Effect.gen(function* () {
	const env = yield* BetterAuthConfig;
	const kysely = yield* BetterAuthDatabase;

	const options = {
		baseURL: env.BETTER_AUTH_URL,
		secret: getAuthSecret(env),
		emailAndPassword: {
			enabled: true,
		},
		database: {
			db: kysely,
			type: "postgres" as const,
			casing: "camel" as const,
		},
		plugins: [openAPI()],
		trustedOrigins: [env.CLIENT_ORIGIN, env.BETTER_AUTH_URL],
	};

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
