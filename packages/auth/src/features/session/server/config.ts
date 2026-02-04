import * as Config from "effect/Config";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Redacted from "effect/Redacted";

export type AuthConfigValues = {
  readonly BETTER_AUTH_URL: string;
  readonly BETTER_AUTH_SECRET: Redacted.Redacted<string>;
  readonly DATABASE_URL: Redacted.Redacted<string>;
  readonly CLIENT_ORIGIN: string;
  readonly GOOGLE_CLIENT_ID: Option.Option<Redacted.Redacted<string>>;
  readonly GOOGLE_CLIENT_SECRET: Option.Option<Redacted.Redacted<string>>;
  readonly APP_NAME: string;
};

const authConfig: Config.Config<AuthConfigValues> = Config.all({
  // BETTER_AUTH_URL falls back to Netlify's DEPLOY_URL/URL env vars at runtime
  BETTER_AUTH_URL: Config.string("BETTER_AUTH_URL").pipe(
    Config.orElse(() => Config.string("DEPLOY_URL")),
    Config.orElse(() => Config.string("URL"))
  ),
  BETTER_AUTH_SECRET: Config.redacted("BETTER_AUTH_SECRET"),
  DATABASE_URL: Config.redacted("DATABASE_URL").pipe(
    Config.orElse(() => Config.redacted("NETLIFY_DATABASE_URL"))
  ),
  // CLIENT_ORIGIN falls back to Netlify's DEPLOY_URL/URL env vars at runtime
  CLIENT_ORIGIN: Config.string("CLIENT_ORIGIN").pipe(
    Config.orElse(() => Config.string("DEPLOY_URL")),
    Config.orElse(() => Config.string("URL")),
    Config.withDefault("http://localhost:5173")
  ),
  GOOGLE_CLIENT_ID: Config.option(Config.redacted("GOOGLE_CLIENT_ID")),
  GOOGLE_CLIENT_SECRET: Config.option(Config.redacted("GOOGLE_CLIENT_SECRET")),
  APP_NAME: Config.withDefault(Config.string("APP_NAME"), "TanStack App"),
});

export class AuthConfig extends Effect.Service<AuthConfig>()("AuthConfig", {
  effect: authConfig,
  dependencies: [Layer.setConfigProvider(ConfigProvider.fromEnv())],
}) {}
