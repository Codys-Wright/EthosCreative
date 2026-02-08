import { RpcAuthenticationMiddleware } from '@auth/server';
import { CourseRpcGroup } from '@course/rpc';

/**
 * DomainRpc - Composed RPC group for the songmaking app.
 *
 * Includes all course-related RPC endpoints (progress, enrollment, etc.)
 * with authentication middleware applied.
 */
export const DomainRpc = CourseRpcGroup
  .middleware(RpcAuthenticationMiddleware);
