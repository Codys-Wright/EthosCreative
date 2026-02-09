import { describe, expect } from 'vitest';
import { it } from '@effect/vitest';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import type { RoomId, UserId, MessageId } from '../domain/schema.js';
import { ChatUser } from '../domain/schema.js';
import { ChatService, ChatServiceLive } from './chat-service.js';

describe('ChatService', () => {
  it.layer(ChatServiceLive)('user operations', (it) => {
    it.effect('upsertUser creates and retrieves a user', () =>
      Effect.gen(function* () {
        const service = yield* ChatService;
        const user = new ChatUser({
          id: 'user1' as UserId,
          name: 'Alice',
          username: 'alice',
          avatarUrl: Option.none(),
          status: 'online',
          roleColor: Option.none(),
        });

        const created = yield* service.upsertUser(user);
        expect(created.id).toBe('user1');
        expect(created.name).toBe('Alice');

        const found = yield* service.getUser('user1' as UserId);
        expect(Option.isSome(found)).toBe(true);
        if (Option.isSome(found)) {
          expect(found.value.name).toBe('Alice');
        }
      }),
    );

    it.effect('getUser returns None for unknown user', () =>
      Effect.gen(function* () {
        const service = yield* ChatService;
        const found = yield* service.getUser('nonexistent-user' as UserId);
        expect(Option.isNone(found)).toBe(true);
      }),
    );

    it.effect('upsertUser updates existing user', () =>
      Effect.gen(function* () {
        const service = yield* ChatService;
        const user1 = new ChatUser({
          id: 'upsert-test' as UserId,
          name: 'Before',
          username: 'before',
          avatarUrl: Option.none(),
          status: 'online',
          roleColor: Option.none(),
        });
        yield* service.upsertUser(user1);

        const user1Updated = new ChatUser({
          id: 'upsert-test' as UserId,
          name: 'After',
          username: 'before',
          avatarUrl: Option.none(),
          status: 'away',
          roleColor: Option.none(),
        });
        yield* service.upsertUser(user1Updated);

        const found = yield* service.getUser('upsert-test' as UserId);
        expect(Option.isSome(found)).toBe(true);
        if (Option.isSome(found)) {
          expect(found.value.name).toBe('After');
          expect(found.value.status).toBe('away');
        }
      }),
    );

    it.effect('getUsers retrieves multiple users', () =>
      Effect.gen(function* () {
        const service = yield* ChatService;

        yield* service.upsertUser(
          new ChatUser({
            id: 'multi-u1' as UserId,
            name: 'Alice',
            username: 'alice',
            avatarUrl: Option.none(),
            status: 'online',
            roleColor: Option.none(),
          }),
        );
        yield* service.upsertUser(
          new ChatUser({
            id: 'multi-u2' as UserId,
            name: 'Bob',
            username: 'bob',
            avatarUrl: Option.none(),
            status: 'online',
            roleColor: Option.none(),
          }),
        );

        const users = yield* service.getUsers([
          'multi-u1' as UserId,
          'multi-u2' as UserId,
          'multi-u3' as UserId,
        ]);
        expect(users).toHaveLength(2);
        const names = users.map((u) => u.name).sort();
        expect(names).toEqual(['Alice', 'Bob']);
      }),
    );
  });

  it.layer(ChatServiceLive)('room operations', (it) => {
    it.effect('createRoom creates a new room', () =>
      Effect.gen(function* () {
        const service = yield* ChatService;
        const room = yield* service.createRoom(
          {
            name: 'General',
            type: 'channel',
            description: Option.some('Main channel'),
            memberIds: ['user2' as UserId],
          },
          'user1' as UserId,
        );

        expect(room.name).toBe('General');
        expect(room.type).toBe('channel');
        expect(room.memberIds).toContain('user1');
        expect(room.memberIds).toContain('user2');
      }),
    );

    it.effect('getRoom retrieves an existing room', () =>
      Effect.gen(function* () {
        const service = yield* ChatService;
        const created = yield* service.createRoom(
          {
            name: 'GetRoom Test',
            type: 'group',
            description: Option.none(),
            memberIds: [],
          },
          'getroom-user' as UserId,
        );

        const found = yield* service.getRoom(created.id);
        expect(Option.isSome(found)).toBe(true);
        if (Option.isSome(found)) {
          expect(found.value.name).toBe('GetRoom Test');
        }
      }),
    );

    it.effect('getRoom returns None for unknown room', () =>
      Effect.gen(function* () {
        const service = yield* ChatService;
        const found = yield* service.getRoom('unknown-room' as RoomId);
        expect(Option.isNone(found)).toBe(true);
      }),
    );

    it.effect('joinRoom adds a user to a room', () =>
      Effect.gen(function* () {
        const service = yield* ChatService;
        const room = yield* service.createRoom(
          { name: 'Join Test', type: 'channel', description: Option.none(), memberIds: [] },
          'join-user1' as UserId,
        );

        yield* service.joinRoom(room.id, 'join-user2' as UserId);

        const found = yield* service.getRoom(room.id);
        expect(Option.isSome(found)).toBe(true);
        if (Option.isSome(found)) {
          expect(found.value.memberIds).toContain('join-user2');
        }
      }),
    );

    it.effect('leaveRoom removes a user from a room', () =>
      Effect.gen(function* () {
        const service = yield* ChatService;
        const room = yield* service.createRoom(
          {
            name: 'Leave Test',
            type: 'channel',
            description: Option.none(),
            memberIds: ['leave-user2' as UserId],
          },
          'leave-user1' as UserId,
        );

        yield* service.leaveRoom(room.id, 'leave-user2' as UserId);

        const found = yield* service.getRoom(room.id);
        expect(Option.isSome(found)).toBe(true);
        if (Option.isSome(found)) {
          expect(found.value.memberIds).not.toContain('leave-user2');
        }
      }),
    );
  });

  // getUserRooms needs its own layer to ensure clean state
  it.layer(ChatServiceLive)('getUserRooms', (it) => {
    it.effect('returns rooms the user is a member of', () =>
      Effect.gen(function* () {
        const service = yield* ChatService;
        yield* service.createRoom(
          { name: 'Room A', type: 'channel', description: Option.none(), memberIds: [] },
          'rooms-user1' as UserId,
        );
        yield* service.createRoom(
          { name: 'Room B', type: 'channel', description: Option.none(), memberIds: [] },
          'rooms-user1' as UserId,
        );
        yield* service.createRoom(
          { name: 'Room C', type: 'channel', description: Option.none(), memberIds: [] },
          'rooms-user2' as UserId,
        );

        const user1Rooms = yield* service.getUserRooms('rooms-user1' as UserId);
        expect(user1Rooms).toHaveLength(2);
        const names = user1Rooms.map((r) => r.name).sort();
        expect(names).toEqual(['Room A', 'Room B']);
      }),
    );
  });

  it.layer(ChatServiceLive)('message operations', (it) => {
    it.effect('sendMessage creates a message and returns event', () =>
      Effect.gen(function* () {
        const service = yield* ChatService;
        const room = yield* service.createRoom(
          { name: 'Msg Chat', type: 'channel', description: Option.none(), memberIds: [] },
          'msg-user1' as UserId,
        );

        const event = yield* service.sendMessage(
          {
            roomId: room.id,
            content: 'Hello, world!',
            replyToId: Option.none(),
            attachmentIds: [],
          },
          'msg-user1' as UserId,
        );

        expect(event._tag).toBe('MessageSent');
        expect(event.message.content).toBe('Hello, world!');
        expect(event.message.roomId).toBe(room.id);
        expect(event.message.senderId).toBe('msg-user1');
      }),
    );

    it.effect('getMessages returns messages in a room', () =>
      Effect.gen(function* () {
        const service = yield* ChatService;
        const room = yield* service.createRoom(
          { name: 'GetMsg Chat', type: 'channel', description: Option.none(), memberIds: [] },
          'getmsg-user1' as UserId,
        );

        yield* service.sendMessage(
          { roomId: room.id, content: 'First', replyToId: Option.none(), attachmentIds: [] },
          'getmsg-user1' as UserId,
        );
        yield* service.sendMessage(
          { roomId: room.id, content: 'Second', replyToId: Option.none(), attachmentIds: [] },
          'getmsg-user1' as UserId,
        );

        const messages = yield* service.getMessages(room.id);
        expect(messages).toHaveLength(2);
        // Messages are returned most recent first
        expect(messages[0].content).toBe('Second');
        expect(messages[1].content).toBe('First');
      }),
    );

    it.effect('getMessages respects limit', () =>
      Effect.gen(function* () {
        const service = yield* ChatService;
        const room = yield* service.createRoom(
          { name: 'Limit Chat', type: 'channel', description: Option.none(), memberIds: [] },
          'limit-user1' as UserId,
        );

        for (let i = 0; i < 5; i++) {
          yield* service.sendMessage(
            {
              roomId: room.id,
              content: `Message ${i}`,
              replyToId: Option.none(),
              attachmentIds: [],
            },
            'limit-user1' as UserId,
          );
        }

        const messages = yield* service.getMessages(room.id, 3);
        expect(messages).toHaveLength(3);
      }),
    );

    it.effect('getMessages returns empty for unknown room', () =>
      Effect.gen(function* () {
        const service = yield* ChatService;
        const messages = yield* service.getMessages('unknown-room' as RoomId);
        expect(messages).toHaveLength(0);
      }),
    );

    it.effect('getMessage finds a specific message', () =>
      Effect.gen(function* () {
        const service = yield* ChatService;
        const room = yield* service.createRoom(
          { name: 'FindMsg Chat', type: 'channel', description: Option.none(), memberIds: [] },
          'findmsg-user1' as UserId,
        );

        const event = yield* service.sendMessage(
          { roomId: room.id, content: 'Find me', replyToId: Option.none(), attachmentIds: [] },
          'findmsg-user1' as UserId,
        );

        const found = yield* service.getMessage(event.message.id);
        expect(Option.isSome(found)).toBe(true);
        if (Option.isSome(found)) {
          expect(found.value.content).toBe('Find me');
        }
      }),
    );

    it.effect('getMessage returns None for unknown message', () =>
      Effect.gen(function* () {
        const service = yield* ChatService;
        const found = yield* service.getMessage('unknown-msg' as MessageId);
        expect(Option.isNone(found)).toBe(true);
      }),
    );

    it.effect('sendMessage updates room lastMessageAt', () =>
      Effect.gen(function* () {
        const service = yield* ChatService;
        const room = yield* service.createRoom(
          { name: 'LastMsg Chat', type: 'channel', description: Option.none(), memberIds: [] },
          'lastmsg-user1' as UserId,
        );

        // Initially no lastMessageAt
        const beforeSend = yield* service.getRoom(room.id);
        expect(Option.isSome(beforeSend)).toBe(true);
        if (Option.isSome(beforeSend)) {
          expect(Option.isNone(beforeSend.value.lastMessageAt)).toBe(true);
        }

        yield* service.sendMessage(
          { roomId: room.id, content: 'Hello', replyToId: Option.none(), attachmentIds: [] },
          'lastmsg-user1' as UserId,
        );

        const afterSend = yield* service.getRoom(room.id);
        expect(Option.isSome(afterSend)).toBe(true);
        if (Option.isSome(afterSend)) {
          expect(Option.isSome(afterSend.value.lastMessageAt)).toBe(true);
        }
      }),
    );
  });
});
