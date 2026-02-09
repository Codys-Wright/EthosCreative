import { describe, expect } from 'vitest';
import { it } from '@effect/vitest';
import * as Effect from 'effect/Effect';
import * as Mailbox from 'effect/Mailbox';
import type { ConnectionId } from '../domain/schema.js';
import { createSseHubImpl } from './sse-hub.js';

type TestEvent = { readonly _tag: string; readonly data: string };

const makeHub = () => createSseHubImpl<TestEvent>('TestHub');

const makeConnection = (id: string) =>
  Effect.gen(function* () {
    const mailbox = yield* Mailbox.make<TestEvent>();
    const connectionId = id as ConnectionId;
    return { connectionId, mailbox };
  });

describe('SseHub (createSseHubImpl)', () => {
  it.effect('starts with zero connections', () =>
    Effect.gen(function* () {
      const hub = yield* makeHub();
      const count = yield* hub.getConnectionCount();
      expect(count).toBe(0);
    }),
  );

  it.effect('registers and tracks connections', () =>
    Effect.gen(function* () {
      const hub = yield* makeHub();
      const { connectionId, mailbox } = yield* makeConnection('conn-1');

      yield* hub.registerConnection(connectionId, mailbox);
      const count = yield* hub.getConnectionCount();
      expect(count).toBe(1);

      const ids = yield* hub.getConnectionIds();
      expect(ids).toContain('conn-1');
    }),
  );

  it.effect('unregisters connections and shuts down mailbox', () =>
    Effect.gen(function* () {
      const hub = yield* makeHub();
      const { connectionId, mailbox } = yield* makeConnection('conn-1');

      yield* hub.registerConnection(connectionId, mailbox);
      expect(yield* hub.getConnectionCount()).toBe(1);

      yield* hub.unregisterConnection(connectionId);
      expect(yield* hub.getConnectionCount()).toBe(0);
    }),
  );

  it.effect('unregister is idempotent for unknown connections', () =>
    Effect.gen(function* () {
      const hub = yield* makeHub();
      // Should not throw
      yield* hub.unregisterConnection('nonexistent' as ConnectionId);
      expect(yield* hub.getConnectionCount()).toBe(0);
    }),
  );

  it.effect('broadcasts events to all connections', () =>
    Effect.gen(function* () {
      const hub = yield* makeHub();
      const conn1 = yield* makeConnection('conn-1');
      const conn2 = yield* makeConnection('conn-2');

      yield* hub.registerConnection(conn1.connectionId, conn1.mailbox);
      yield* hub.registerConnection(conn2.connectionId, conn2.mailbox);

      const event: TestEvent = { _tag: 'TestEvent', data: 'broadcast' };
      yield* hub.broadcast(event);

      // Read from both mailboxes
      const msg1 = yield* conn1.mailbox.take;
      const msg2 = yield* conn2.mailbox.take;
      expect(msg1).toEqual(event);
      expect(msg2).toEqual(event);
    }),
  );

  it.effect('broadcast to empty hub is a no-op', () =>
    Effect.gen(function* () {
      const hub = yield* makeHub();
      // Should not throw
      yield* hub.broadcast({ _tag: 'TestEvent', data: 'noop' });
    }),
  );

  it.effect('sendTo sends to a specific connection', () =>
    Effect.gen(function* () {
      const hub = yield* makeHub();
      const conn1 = yield* makeConnection('conn-1');
      const conn2 = yield* makeConnection('conn-2');

      yield* hub.registerConnection(conn1.connectionId, conn1.mailbox);
      yield* hub.registerConnection(conn2.connectionId, conn2.mailbox);

      const event: TestEvent = { _tag: 'TestEvent', data: 'targeted' };
      const result = yield* hub.sendTo(conn1.connectionId, event);
      expect(result).toBe(true);

      const msg = yield* conn1.mailbox.take;
      expect(msg).toEqual(event);
    }),
  );

  it.effect('sendTo returns false for unknown connection', () =>
    Effect.gen(function* () {
      const hub = yield* makeHub();
      const result = yield* hub.sendTo('unknown' as ConnectionId, {
        _tag: 'TestEvent',
        data: 'nope',
      });
      expect(result).toBe(false);
    }),
  );

  it.effect('sendToMatching sends to connections matching metadata predicate', () =>
    Effect.gen(function* () {
      const hub = yield* makeHub();
      const conn1 = yield* makeConnection('conn-1');
      const conn2 = yield* makeConnection('conn-2');
      const conn3 = yield* makeConnection('conn-3');

      yield* hub.registerConnection(conn1.connectionId, conn1.mailbox, { role: 'admin' });
      yield* hub.registerConnection(conn2.connectionId, conn2.mailbox, { role: 'user' });
      yield* hub.registerConnection(conn3.connectionId, conn3.mailbox, { role: 'admin' });

      const event: TestEvent = { _tag: 'TestEvent', data: 'admin-only' };
      const count = yield* hub.sendToMatching((meta) => meta.role === 'admin', event);
      expect(count).toBe(2);

      const msg1 = yield* conn1.mailbox.take;
      const msg3 = yield* conn3.mailbox.take;
      expect(msg1).toEqual(event);
      expect(msg3).toEqual(event);
    }),
  );

  it.effect('sendToMatching returns 0 when no connections match', () =>
    Effect.gen(function* () {
      const hub = yield* makeHub();
      const conn1 = yield* makeConnection('conn-1');
      yield* hub.registerConnection(conn1.connectionId, conn1.mailbox, { role: 'user' });

      const count = yield* hub.sendToMatching(
        (meta) => meta.role === 'admin',
        { _tag: 'TestEvent', data: 'nope' },
      );
      expect(count).toBe(0);
    }),
  );

  it.effect('getConnectionIds returns all registered IDs', () =>
    Effect.gen(function* () {
      const hub = yield* makeHub();
      const conn1 = yield* makeConnection('conn-1');
      const conn2 = yield* makeConnection('conn-2');

      yield* hub.registerConnection(conn1.connectionId, conn1.mailbox);
      yield* hub.registerConnection(conn2.connectionId, conn2.mailbox);

      const ids = yield* hub.getConnectionIds();
      expect(ids).toHaveLength(2);
      expect(ids).toContain('conn-1');
      expect(ids).toContain('conn-2');
    }),
  );

  it.effect('registers connection with metadata', () =>
    Effect.gen(function* () {
      const hub = yield* makeHub();
      const conn = yield* makeConnection('conn-1');

      yield* hub.registerConnection(conn.connectionId, conn.mailbox, { userId: 'user-1' });
      expect(yield* hub.getConnectionCount()).toBe(1);
    }),
  );
});
