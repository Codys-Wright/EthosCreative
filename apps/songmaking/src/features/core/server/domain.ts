import { RpcAuthenticationMiddleware } from '@auth/server';
import {
  CourseRpc,
  SectionRpc,
  LessonRpc,
  LessonPartRpc,
  CategoryRpc,
  CertificateRpc,
  EnrollmentRpc,
  InstructorRpc,
  ProgressRpc,
  ReviewRpc,
} from '@course';
import * as RpcMiddleware from '@effect/rpc/RpcMiddleware';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import * as Layer from 'effect/Layer';

// ============================================================================
// RPC Middleware - Logging
// ============================================================================

export class RpcLogger extends RpcMiddleware.Tag<RpcLogger>()('RpcLogger', {
  wrap: true,
  optional: true,
}) {}

export const RpcLoggerLive = Layer.succeed(
  RpcLogger,
  RpcLogger.of((opts) =>
    Effect.flatMap(Effect.exit(opts.next), (exit) =>
      Exit.match(exit, {
        onSuccess: () => exit,
        onFailure: (cause) =>
          Effect.zipRight(
            Effect.annotateLogs(Effect.logError(`RPC request failed: ${opts.rpc._tag}`, cause), {
              'rpc.method': opts.rpc._tag,
              'rpc.clientId': opts.clientId,
            }),
            exit,
          ),
      }),
    ),
  ),
);

// ============================================================================
// DomainRpc - Composed RPC Group with Global Middleware
// ============================================================================

export const DomainRpc = CourseRpc.merge(SectionRpc)
  .merge(LessonRpc)
  .merge(LessonPartRpc)
  .merge(CategoryRpc)
  .merge(CertificateRpc)
  .merge(EnrollmentRpc)
  .merge(InstructorRpc)
  .merge(ProgressRpc)
  .merge(ReviewRpc)
  .middleware(RpcAuthenticationMiddleware)
  .middleware(RpcLogger);
