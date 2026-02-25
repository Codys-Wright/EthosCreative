# @sse

Server-Sent Events infrastructure for real-time communication — connection management, event streaming, and auto-reconnecting clients.

## Overview

A domain-agnostic SSE toolkit built on Effect-TS providing:

- **Server** — Hub-based connection management, SSE response creation
- **Client** — Auto-reconnecting EventSource wrapper with exponential backoff
- **Domain** — Type-safe event schemas with encoding/decoding utilities
- **Atoms** — Effect Atom integration for reactive event consumption

## Exports

| Entry point | Import as | Contents |
|---|---|---|
| `@sse` | Domain | Event types, config, encoding/decoding |
| `@sse/server` | Server | SseHub, SSE response creators |
| `@sse/client` | Client | SSE client, atoms, PubSub |

## Server

### SSE Hub

Manages multiple connections with pub/sub broadcasting:

```typescript
import { createSseHubImpl } from '@sse/server';

// Each feature creates its own hub
const hub = yield* createSseHubImpl<ChatEvent>('ChatHub');

hub.broadcast(event);                      // Send to all
hub.sendTo(connectionId, event);           // Send to one
hub.sendToMatching(pred, event);           // Send to filtered set
hub.getConnectionCount();                  // Active connections
```

### SSE Response

```typescript
import { createSseResponse, createSseHubResponse, sseHeaders } from '@sse/server';

// From an Effect Stream
const response = createSseResponse({ connectionId, events: myStream });

// Hub-backed (auto registers/unregisters)
const response = createSseHubResponse({ connectionId, register, unregister });
```

## Client

### Auto-Reconnecting Client

```typescript
import { createSseClient } from '@sse/client';

const { events, connect } = createSseClient({
  url: '/api/events',
  eventSchema: MyEventSchema,
  config: { retryAttempts: 5, retryBaseDelay: 1000 },
});

// events is a Stream<MyEvent, SseConnectionError>
```

### Atom Integration

```typescript
import { makeSseConsumerAtom } from '@sse/client';

const atom = makeSseConsumerAtom({
  runtime: myRuntime,
  identifier: 'chat',
  url: '/api/chat',
  eventSchema: ChatEvent,
  predicate: (e): e is MessageSent => e._tag === 'MessageSent',
  handler: (event) => Effect.log(`New message: ${event.content}`),
});
```

## Domain

### Configuration

```typescript
{
  keepaliveInterval: 15000,   // Heartbeat interval (ms)
  maxDuration: 0,             // 0 = unlimited
  retryAttempts: 5,           // Reconnection attempts
  retryBaseDelay: 1000,       // Exponential backoff base (ms)
}
```

### Event Encoding

```typescript
import { encodeEvent, encodeKeepalive, makeEventDecoder } from '@sse';

encodeEvent(myEvent);     // "event: MyTag\ndata: {...}\n\n"
encodeKeepalive();        // ": keepalive 1234567890\n\n"
```

## Dependencies

None — this is infrastructure-only with no internal monorepo dependencies.

## Consumers

- **`@chat`** — Uses SSE for real-time chat event streaming
- **`apps/explore`** — SSE demo endpoints at `/api/events` and `/api/chat`
