import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

const normalizeUrl = (url: URL): string => url.toString().replace(/\/$/, "");

export class EnvVars extends Effect.Service<EnvVars>()("EnvVars", {
  accessors: true,
  effect: Effect.gen(function* () {
    return {
      // API_URL falls back to Netlify's DEPLOY_URL/URL env vars at runtime
      API_URL: yield* Config.url("API_URL").pipe(
        Config.orElse(() => Config.url("DEPLOY_URL")),
        Config.orElse(() => Config.url("URL")),
        Config.map(normalizeUrl),
        Config.withDefault("http://localhost:3000")
      ),
      DATABASE_URL: yield* Config.redacted("DATABASE_URL").pipe(
        Config.orElse(() => Config.redacted("NETLIFY_DATABASE_URL"))
      ),
      UPLOADTHING_SECRET: yield* Config.redacted("UPLOADTHING_SECRET").pipe(
        Config.withDefault(Redacted.make(""))
      ),
    } as const;
  }),
}) {}
