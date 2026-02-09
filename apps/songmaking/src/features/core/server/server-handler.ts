import {
  AuthContext,
  BetterAuthRouter,
  RpcAuthenticationMiddlewareLive,
  AuthService,
} from '@auth/server';
import { CourseRpcLayer } from '@course/server';
import * as HttpLayerRouter from '@effect/platform/HttpLayerRouter';
import * as HttpServerResponse from '@effect/platform/HttpServerResponse';
import * as RpcSerialization from '@effect/rpc/RpcSerialization';
import * as RpcServer from '@effect/rpc/RpcServer';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Logger from 'effect/Logger';
import { DomainRpc, RpcLoggerLive } from './domain.js';

// RPC Router - Serves all course RPC endpoints
const RpcRouter = RpcServer.layerHttpRouter({
  group: DomainRpc,
  path: '/api/rpc',
  protocol: 'http',
  disableTracing: true,
  disableFatalDefects: true,
}).pipe(
  Layer.provide(CourseRpcLayer),
  Layer.provide(RpcLoggerLive),
  Layer.provide(RpcAuthenticationMiddlewareLive),
  Layer.provide(AuthService.Default),
  Layer.provide(RpcSerialization.layerNdjson),
);

// Health check route
const HealthRoute = HttpLayerRouter.use((router) =>
  router.add('GET', '/api/health', HttpServerResponse.text('OK')),
);

// Combine all routes
const AllRoutes = Layer.mergeAll(RpcRouter, HealthRoute, BetterAuthRouter).pipe(
  Layer.provideMerge(AuthService.Default),
  Layer.provide(Layer.mergeAll(AuthContext.Mock, Logger.pretty)),
);

const memoMap = Effect.runSync(Layer.makeMemoMap);

const { handler, dispose } = HttpLayerRouter.toWebHandler(AllRoutes, {
  memoMap,
});

// Export dispose for potential graceful shutdown handling
export { dispose };

// Handler for TanStack Start integration
export const effectHandler = ({ request }: { request: Request }) =>
  handler(request, Context.empty() as any);
