# @chat

Real-time chat system with rooms, messages, reactions, typing indicators, and presence — built on Effect-TS and SSE.

## Overview

A Discord/GroupMe-style chat package providing:

- **Rooms** — Direct messages, group chats, and channels
- **Messages** — Send, edit, delete, pin, with attachment support
- **Reactions** — Emoji reactions with per-user tracking
- **Typing indicators** — Real-time typing awareness
- **Presence** — Online/offline/away/DND status tracking
- **Read receipts** — Unread message counts per room
- **SSE-based real-time** — Event streaming via the `@sse` package

## Exports

| Entry point | Import as | Contents |
|---|---|---|
| `@chat` | Domain | Schemas, branded IDs, event types, RPC definitions |
| `@chat/server` | Server | ChatService, ChatHub (SSE event hub) |
| `@chat/client` | Client | RPC client, atoms, React hooks |
| `@chat/components` | UI | Chat component, ChatPage |

## Domain

### Core Entities

| Entity | Description |
|---|---|
| `ChatUser` | User with status, avatar, role color |
| `ChatRoom` | Room (`direct`, `group`, `channel`) with members |
| `ChatMessage` | Message with replies, attachments, edit/delete/pin flags |
| `MessageReaction` | Per-message emoji reactions |
| `RoomMember` | Room membership with role (owner/admin/moderator/member) |
| `UserPresence` | Online status with custom status message |

### Real-Time Events (12 types)

`MessageSent`, `MessageEdited`, `MessageDeleted`, `ReactionAdded`, `ReactionRemoved`, `UserJoined`, `UserLeft`, `UserTyping`, `UserPresenceChanged`, `MessageRead`, `MessagePinned`, `MessageUnpinned`

## Usage

### Client

```typescript
import { useRooms, useSelectedRoom, useSendMessage } from '@chat/client';
import { Chat, ChatPage } from '@chat/components';

const rooms = useRooms();
const sendMessage = useSendMessage();
```

### Server

```typescript
import { ChatService, ChatHubLive } from '@chat/server';

// In-memory implementation (demo); replace with database-backed for production
```

## RPC Endpoints

- **Rooms**: `listRooms`, `getRoom`, `createRoom`, `joinRoom`, `leaveRoom`
- **Messages**: `listMessages`, `sendMessage`, `editMessage`, `deleteMessage`
- **Reactions**: `addReaction`, `removeReaction`
- **Real-time**: `connect` (SSE stream), `sendTyping`, `updatePresence`, `markAsRead`

## Dependencies

- **`@core`** — RPC protocol, atom utilities
- **`@sse`** — SSE infrastructure for real-time event streaming
- **`@shadcn`** — UI components (Avatar, Button, ScrollArea, etc.)
