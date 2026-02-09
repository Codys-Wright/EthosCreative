import { RpcProtocol } from '@core/client/rpc-config';
import { AtomRpc } from '@effect-atom/atom-react';
import { LessonPartRpc } from '../domain/index.js';

/**
 * LessonPartClient - RPC client for the LessonPart feature.
 *
 * Provides:
 * - LessonPartClient.query("lessonPart_getById", ...) - for read queries
 * - LessonPartClient.mutation("lessonPart_create") - for mutations
 * - LessonPartClient.runtime - for custom atoms
 * - LessonPartClient.layer - for Effect services
 * - LessonPartClient (as Context.Tag) - yields the raw RPC client
 */
export class LessonPartClient extends AtomRpc.Tag<LessonPartClient>()('@course/LessonPartClient', {
  group: LessonPartRpc,
  protocol: RpcProtocol,
}) {}
