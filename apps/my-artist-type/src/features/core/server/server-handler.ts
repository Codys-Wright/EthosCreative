import {
  AuthContext,
  BetterAuthRouter,
  RpcAuthenticationMiddlewareLive,
  AuthService,
  makeOnLinkAccountHandler,
} from "@auth/server";
import { ArtistTypeRpcLive } from "@artist-types/server";
import { TodoApiRoutes, TodoRpcLive } from "@todo/server";
import { ExampleApiLive, ExampleRpcLive } from "@example/server";
import { QuizRpcLive, ResponsesRepo } from "@quiz/server";
import { UserId } from "@quiz/features/responses/domain/schema.js";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as RpcSerialization from "@effect/rpc/RpcSerialization";
import * as RpcServer from "@effect/rpc/RpcServer";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import * as Logger from "effect/Logger";
import { DomainRpc, RpcLoggerLive, RpcTracerLive } from "./domain";
import { TracerLive } from "./tracing.js";

// =============================================================================
// OnLinkAccountHandler - Migrates quiz responses when anonymous user claims account
// =============================================================================

/**
 * When an anonymous user claims their account (signs in with Google, email, etc.),
 * Better Auth creates a new user and deletes the anonymous one.
 * This handler migrates quiz responses from the old anonymous user to the new user.
 */
const QuizLinkAccountHandler = makeOnLinkAccountHandler((data) =>
  Effect.gen(function* () {
    const repo = yield* ResponsesRepo;
    yield* Effect.logInfo(
      `[OnLinkAccount] Migrating responses from anonymous user ${data.anonymousUserId} to ${data.newUserId}`
    );
    yield* repo.updateUserIdForResponses(
      data.anonymousUserId as UserId,
      data.newUserId as UserId
    );
    yield* Effect.logInfo("[OnLinkAccount] Response migration complete");
  })
);

/**
 * Custom AuthService layer with quiz response migration handler.
 * Replaces the default no-op handler with our quiz-specific handler.
 */
const AuthServiceWithQuizMigration = AuthService.withLinkAccountHandler(
  Layer.provide(QuizLinkAccountHandler, ResponsesRepo.Default)
);

const RpcRouter = RpcServer.layerHttpRouter({
  group: DomainRpc,
  path: "/api/rpc",
  protocol: "http",
  // Disable built-in RPC tracing since we use RpcTracer middleware
  disableTracing: true,
  disableFatalDefects: true,
}).pipe(
  Layer.provide(TodoRpcLive),
  Layer.provide(ExampleRpcLive),
  Layer.provide(QuizRpcLive),
  Layer.provide(ArtistTypeRpcLive),
  Layer.provide(RpcTracerLive),
  Layer.provide(RpcLoggerLive),
  Layer.provide(RpcAuthenticationMiddlewareLive),
  Layer.provide(AuthServiceWithQuizMigration),
  Layer.provide(RpcSerialization.layerNdjson)
);

const HealthRoute = HttpLayerRouter.use((router) =>
  router.add("GET", "/api/health", HttpServerResponse.text("OK"))
);

// Debug route to check env vars - REMOVE AFTER DEBUGGING
const DebugEnvRoute = HttpLayerRouter.use((router) =>
  router.add(
    "GET",
    "/api/debug-env",
    HttpServerResponse.json({
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "NOT SET",
      CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? "NOT SET",
      API_URL: process.env.API_URL ?? "NOT SET",
      URL: process.env.URL ?? "NOT SET",
      DEPLOY_URL: process.env.DEPLOY_URL ?? "NOT SET",
      DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL ?? "NOT SET",
      DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT SET",
      NETLIFY_DATABASE_URL: process.env.NETLIFY_DATABASE_URL
        ? "SET"
        : "NOT SET",
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "SET" : "NOT SET",
    })
  )
);

// Each package provides its own complete route layer with docs:
// - TodosApiRoutes: /api/todos/* routes + docs at its path
// - ExampleApiLive: /api/features/* routes + docs at /api/example/docs
// - AuthApiRoutes: /api/auth/* routes
// Note: Quiz uses RPC only (no HTTP API layer yet)
const AllRoutes = Layer.mergeAll(
  RpcRouter,
  TodoApiRoutes,
  ExampleApiLive,
  HealthRoute,
  DebugEnvRoute,
  BetterAuthRouter
).pipe(
  Layer.provideMerge(AuthServiceWithQuizMigration),
  Layer.provide(Layer.mergeAll(AuthContext.Mock, Logger.pretty))
);

const memoMap = Effect.runSync(Layer.makeMemoMap);

// Merge tracing layer with routes - must use provideMerge so the tracer is available
// at the runtime level for Effect.fn spans to be exported
const AllRoutesWithTracing = AllRoutes.pipe(Layer.provideMerge(TracerLive));

const { handler, dispose } = HttpLayerRouter.toWebHandler(
  AllRoutesWithTracing,
  {
    memoMap,
  }
);

// Export dispose for potential graceful shutdown handling
export { dispose };

// Revert to original pattern - the Context.empty() is needed for TanStack Start integration
export const effectHandler = ({ request }: { request: Request }) =>
  handler(request, Context.empty() as any);
