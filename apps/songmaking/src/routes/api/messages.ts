/**
 * Course Messages SSE API Endpoint
 *
 * Streams chat messages and events using Server-Sent Events.
 * Uses a shared hub so all connected clients see the same messages.
 */

import { createFileRoute } from "@tanstack/react-router";
import {
  messagingHub,
  type ChatEvent,
  getDmRoomId,
} from "../../features/messaging/server/messaging-hub.js";

// =============================================================================
// SSE Headers
// =============================================================================

const sseHeaders = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

const encodeEvent = (event: object): string => {
  return `data: ${JSON.stringify(event)}\n\n`;
};

// =============================================================================
// GET Handler - SSE Stream
// =============================================================================

const messagesSseHandler = async ({ request }: { request: Request }) => {
  const connectionId = crypto.randomUUID();
  const encoder = new TextEncoder();

  // Get user info from query params (passed from client session)
  const url = new URL(request.url);
  const userId =
    url.searchParams.get("userId") ?? `anon-${connectionId.slice(0, 8)}`;
  const userName = url.searchParams.get("userName") ?? undefined;
  const userImage = url.searchParams.get("userImage") ?? undefined;
  const userRole = url.searchParams.get("role") as
    | "instructor"
    | "student"
    | undefined;

  console.log(
    `[Messages SSE] Client connecting: ${connectionId} (user: ${userId})`
  );

  let keepaliveHandle: ReturnType<typeof setInterval> | null = null;
  let isOpen = true;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Register with the hub
      messagingHub.register(
        connectionId,
        userId,
        (event: ChatEvent) => {
          if (!isOpen) return;
          try {
            controller.enqueue(encoder.encode(encodeEvent(event)));
          } catch {
            // Stream closed
            isOpen = false;
          }
        },
        {
          name: userName,
          image: userImage,
          role: userRole,
        }
      );

      // Keepalive every 15 seconds
      keepaliveHandle = setInterval(() => {
        if (!isOpen) {
          if (keepaliveHandle) clearInterval(keepaliveHandle);
          return;
        }
        try {
          controller.enqueue(encoder.encode(`: keepalive ${Date.now()}\n\n`));
        } catch {
          if (keepaliveHandle) clearInterval(keepaliveHandle);
          isOpen = false;
        }
      }, 15000);
    },
    cancel() {
      console.log(`[Messages SSE] Client disconnected: ${connectionId}`);
      isOpen = false;
      if (keepaliveHandle) clearInterval(keepaliveHandle);
      messagingHub.unregister(connectionId);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: sseHeaders,
  });
};

// =============================================================================
// POST Handler - Send Message
// =============================================================================

const sendMessageHandler = async ({ request }: { request: Request }) => {
  try {
    const body = await request.json();
    const { roomId, senderId, content } = body as {
      roomId: string;
      senderId: string;
      content: string;
    };

    if (!roomId || !senderId || !content) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const message = messagingHub.sendMessage(roomId, senderId, content);

    if (!message) {
      return new Response(JSON.stringify({ error: "Permission denied" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Messages API] Error sending message:", err);
    return new Response(JSON.stringify({ error: "Failed to send message" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// =============================================================================
// Route
// =============================================================================

export const Route = createFileRoute("/api/messages")({
  server: {
    handlers: {
      GET: messagesSseHandler,
      POST: sendMessageHandler,
    },
  },
});
