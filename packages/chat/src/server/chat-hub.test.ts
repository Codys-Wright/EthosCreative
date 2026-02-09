import { describe, expect } from 'vitest';
import { it } from '@effect/vitest';
import * as Effect from 'effect/Effect';
import * as Mailbox from 'effect/Mailbox';
import * as Option from 'effect/Option';
import type { ConnectionId } from '@sse';
import {
  type RoomId,
  type UserId,
  type ChatEvent,
  UserTypingEvent,
  UserPresenceChangedEvent,
  UserPresence,
} from '../domain/schema.js';
import { ChatHub, ChatHubLive } from './chat-hub.js';

// Helper to create test events
const makeTypingEvent = (roomId: string, userId: string, isTyping: boolean): ChatEvent =>
  new UserTypingEvent({
    _tag: 'UserTyping',
    roomId: roomId as RoomId,
    userId: userId as UserId,
    username: `user-${userId}`,
    isTyping,
  });

const makePresenceEvent = (userId: string, status: 'online' | 'offline'): ChatEvent =>
  new UserPresenceChangedEvent({
    _tag: 'UserPresenceChanged',
    presence: new UserPresence({
      userId: userId as UserId,
      status,
      customStatus: Option.none(),
      lastSeenAt: Date.now(),
    }),
  });

const makeConn = (id: string) =>
  Effect.gen(function* () {
    const mailbox = yield* Mailbox.make<ChatEvent>();
    return { connectionId: id as ConnectionId, mailbox };
  });

describe('ChatHub', () => {
  it.layer(ChatHubLive)('connection management', (it) => {
    it.effect('starts with zero connections', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        expect(yield* hub.getConnectionCount()).toBe(0);
      }),
    );

    it.effect('registers and counts connections', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        const conn = yield* makeConn('cm-c1');

        yield* hub.registerConnection(conn.connectionId, conn.mailbox, 'cm-user1' as UserId);
        // Count includes connections from previous tests in this block
        const count = yield* hub.getConnectionCount();
        expect(count).toBeGreaterThanOrEqual(1);
      }),
    );

    it.effect('unregisters connections', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        const conn = yield* makeConn('cm-unreg');

        yield* hub.registerConnection(conn.connectionId, conn.mailbox, 'cm-unreg-user' as UserId);
        const before = yield* hub.getConnectionCount();
        yield* hub.unregisterConnection(conn.connectionId);
        const after = yield* hub.getConnectionCount();
        expect(after).toBe(before - 1);
      }),
    );

    it.effect('unregister is safe for unknown connections', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        const before = yield* hub.getConnectionCount();
        yield* hub.unregisterConnection('unknown' as ConnectionId);
        const after = yield* hub.getConnectionCount();
        expect(after).toBe(before);
      }),
    );
  });

  it.layer(ChatHubLive)('room subscription', (it) => {
    it.effect('registers connection with initial rooms', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        const conn = yield* makeConn('rs-c1');

        yield* hub.registerConnection(
          conn.connectionId,
          conn.mailbox,
          'rs-user1' as UserId,
          ['rs-room1' as RoomId, 'rs-room2' as RoomId],
        );

        expect(yield* hub.getRoomConnectionCount('rs-room1' as RoomId)).toBe(1);
        expect(yield* hub.getRoomConnectionCount('rs-room2' as RoomId)).toBe(1);
      }),
    );

    it.effect('subscribes and unsubscribes from rooms dynamically', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        const conn = yield* makeConn('rs-dyn');

        yield* hub.registerConnection(conn.connectionId, conn.mailbox, 'rs-dyn-user' as UserId);
        yield* hub.subscribeToRoom(conn.connectionId, 'rs-dyn-room' as RoomId);
        expect(yield* hub.getRoomConnectionCount('rs-dyn-room' as RoomId)).toBe(1);

        yield* hub.unsubscribeFromRoom(conn.connectionId, 'rs-dyn-room' as RoomId);
        expect(yield* hub.getRoomConnectionCount('rs-dyn-room' as RoomId)).toBe(0);
      }),
    );

    it.effect('cleans up room connections on unregister', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        const conn = yield* makeConn('rs-cleanup');

        yield* hub.registerConnection(
          conn.connectionId,
          conn.mailbox,
          'rs-cleanup-user' as UserId,
          ['rs-cleanup-room' as RoomId],
        );
        expect(yield* hub.getRoomConnectionCount('rs-cleanup-room' as RoomId)).toBe(1);

        yield* hub.unregisterConnection(conn.connectionId);
        expect(yield* hub.getRoomConnectionCount('rs-cleanup-room' as RoomId)).toBe(0);
      }),
    );

    it.effect('subscribe is safe for unknown connection', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        yield* hub.subscribeToRoom('unknown' as ConnectionId, 'unknown-room' as RoomId);
        expect(yield* hub.getRoomConnectionCount('unknown-room' as RoomId)).toBe(0);
      }),
    );
  });

  it.layer(ChatHubLive)('event broadcasting', (it) => {
    it.effect('broadcastToRoom sends to all room connections', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        const conn1 = yield* makeConn('eb-c1');
        const conn2 = yield* makeConn('eb-c2');

        yield* hub.registerConnection(
          conn1.connectionId,
          conn1.mailbox,
          'eb-user1' as UserId,
          ['eb-room1' as RoomId],
        );
        yield* hub.registerConnection(
          conn2.connectionId,
          conn2.mailbox,
          'eb-user2' as UserId,
          ['eb-room1' as RoomId],
        );

        const event = makeTypingEvent('eb-room1', 'eb-user1', true);
        const sent = yield* hub.broadcastToRoom('eb-room1' as RoomId, event);
        expect(sent).toBe(2);

        const msg1 = yield* conn1.mailbox.take;
        const msg2 = yield* conn2.mailbox.take;
        expect(msg1._tag).toBe('UserTyping');
        expect(msg2._tag).toBe('UserTyping');
      }),
    );

    it.effect('broadcastToRoom returns 0 for empty room', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        const sent = yield* hub.broadcastToRoom(
          'eb-empty-room' as RoomId,
          makeTypingEvent('eb-empty-room', 'user1', true),
        );
        expect(sent).toBe(0);
      }),
    );

    it.effect('broadcast sends to all connections globally', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        const conn1 = yield* makeConn('eb-global1');
        const conn2 = yield* makeConn('eb-global2');

        yield* hub.registerConnection(
          conn1.connectionId,
          conn1.mailbox,
          'eb-g-user1' as UserId,
          ['eb-g-room1' as RoomId],
        );
        yield* hub.registerConnection(
          conn2.connectionId,
          conn2.mailbox,
          'eb-g-user2' as UserId,
          ['eb-g-room2' as RoomId],
        );

        const event = makePresenceEvent('eb-g-user1', 'online');
        const sent = yield* hub.broadcast(event);
        // Should send to at least the 2 we just added
        expect(sent).toBeGreaterThanOrEqual(2);
      }),
    );

    it.effect('sendToUser sends to all connections of a user', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        const conn1 = yield* makeConn('eb-su1');
        const conn2 = yield* makeConn('eb-su2');
        const conn3 = yield* makeConn('eb-su3');

        // User has 2 connections (e.g., desktop + mobile)
        yield* hub.registerConnection(
          conn1.connectionId,
          conn1.mailbox,
          'eb-su-user1' as UserId,
        );
        yield* hub.registerConnection(
          conn2.connectionId,
          conn2.mailbox,
          'eb-su-user1' as UserId,
        );
        // Different user
        yield* hub.registerConnection(
          conn3.connectionId,
          conn3.mailbox,
          'eb-su-user2' as UserId,
        );

        const event = makePresenceEvent('eb-su-user1', 'offline');
        const sent = yield* hub.sendToUser('eb-su-user1' as UserId, event);
        expect(sent).toBe(2);
      }),
    );

    it.effect('sendToUser returns 0 for unknown user', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        const sent = yield* hub.sendToUser(
          'unknown-user' as UserId,
          makePresenceEvent('unknown', 'online'),
        );
        expect(sent).toBe(0);
      }),
    );

    it.effect('sendToConnection sends to a specific connection', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        const conn1 = yield* makeConn('eb-sc1');

        yield* hub.registerConnection(
          conn1.connectionId,
          conn1.mailbox,
          'eb-sc-user1' as UserId,
        );

        const event = makeTypingEvent('eb-sc-room1', 'eb-sc-user1', true);
        const result = yield* hub.sendToConnection(conn1.connectionId, event);
        expect(result).toBe(true);

        const msg = yield* conn1.mailbox.take;
        expect(msg._tag).toBe('UserTyping');
      }),
    );

    it.effect('sendToConnection returns false for unknown connection', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        const result = yield* hub.sendToConnection(
          'unknown-conn' as ConnectionId,
          makeTypingEvent('room1', 'user1', true),
        );
        expect(result).toBe(false);
      }),
    );
  });

  it.layer(ChatHubLive)('presence tracking', (it) => {
    it.effect('getRoomUsers returns distinct users in a room', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        const conn1 = yield* makeConn('pt-c1');
        const conn2 = yield* makeConn('pt-c2');
        const conn3 = yield* makeConn('pt-c3');

        // User1 has 2 connections in pt-room1
        yield* hub.registerConnection(
          conn1.connectionId,
          conn1.mailbox,
          'pt-user1' as UserId,
          ['pt-room1' as RoomId],
        );
        yield* hub.registerConnection(
          conn2.connectionId,
          conn2.mailbox,
          'pt-user1' as UserId,
          ['pt-room1' as RoomId],
        );
        // User2 has 1 connection in pt-room1
        yield* hub.registerConnection(
          conn3.connectionId,
          conn3.mailbox,
          'pt-user2' as UserId,
          ['pt-room1' as RoomId],
        );

        const users = yield* hub.getRoomUsers('pt-room1' as RoomId);
        expect(users).toHaveLength(2);
        expect(users).toContain('pt-user1');
        expect(users).toContain('pt-user2');
      }),
    );

    it.effect('getRoomUsers returns empty for unknown room', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        const users = yield* hub.getRoomUsers('pt-unknown' as RoomId);
        expect(users).toHaveLength(0);
      }),
    );

    it.effect('user connections clean up properly on unregister', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        const conn1 = yield* makeConn('pt-clean1');
        const conn2 = yield* makeConn('pt-clean2');

        yield* hub.registerConnection(
          conn1.connectionId,
          conn1.mailbox,
          'pt-clean-user' as UserId,
          ['pt-clean-room' as RoomId],
        );
        yield* hub.registerConnection(
          conn2.connectionId,
          conn2.mailbox,
          'pt-clean-user' as UserId,
          ['pt-clean-room' as RoomId],
        );

        // Unregister one connection - user should still be in room
        yield* hub.unregisterConnection(conn1.connectionId);
        const users = yield* hub.getRoomUsers('pt-clean-room' as RoomId);
        expect(users).toContain('pt-clean-user');

        // Unregister second connection - user should be gone
        yield* hub.unregisterConnection(conn2.connectionId);
        const usersAfter = yield* hub.getRoomUsers('pt-clean-room' as RoomId);
        expect(usersAfter).toHaveLength(0);
      }),
    );
  });

  it.layer(ChatHubLive)('typing indicators via broadcast', (it) => {
    it.effect('typing event reaches room members', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        const conn1 = yield* makeConn('ti-c1');
        const conn2 = yield* makeConn('ti-c2');

        yield* hub.registerConnection(
          conn1.connectionId,
          conn1.mailbox,
          'ti-user1' as UserId,
          ['ti-room1' as RoomId],
        );
        yield* hub.registerConnection(
          conn2.connectionId,
          conn2.mailbox,
          'ti-user2' as UserId,
          ['ti-room1' as RoomId],
        );

        const typingEvent = makeTypingEvent('ti-room1', 'ti-user1', true);
        yield* hub.broadcastToRoom('ti-room1' as RoomId, typingEvent);

        const received1 = yield* conn1.mailbox.take;
        const received2 = yield* conn2.mailbox.take;
        expect(received1._tag).toBe('UserTyping');
        expect(received2._tag).toBe('UserTyping');
      }),
    );

    it.effect('stop typing event reaches room members', () =>
      Effect.gen(function* () {
        const hub = yield* ChatHub;
        const conn1 = yield* makeConn('ti-stop');

        yield* hub.registerConnection(
          conn1.connectionId,
          conn1.mailbox,
          'ti-stop-user' as UserId,
          ['ti-stop-room' as RoomId],
        );

        const stopEvent = makeTypingEvent('ti-stop-room', 'ti-stop-user', false);
        yield* hub.broadcastToRoom('ti-stop-room' as RoomId, stopEvent);

        const received = yield* conn1.mailbox.take;
        expect(received._tag).toBe('UserTyping');
        if (received._tag === 'UserTyping') {
          expect(received.isTyping).toBe(false);
        }
      }),
    );
  });
});
