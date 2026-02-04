/**
 * Demo Events SSE API Endpoint
 *
 * Streams simulated activity for the Example Course demo.
 * Only accessible by admin users.
 */

import { createFileRoute } from "@tanstack/react-router";
import { demoHub, type DemoEvent } from "../../features/demo/server/demo-hub.js";

// =============================================================================
// SSE Headers
// =============================================================================

const sseHeaders = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

const encodeEvent = (event: DemoEvent): string => {
  return `data: ${JSON.stringify(event)}\n\n`;
};

// =============================================================================
// GET Handler - SSE Stream
// =============================================================================

const demoEventsSseHandler = async ({ request }: { request: Request }) => {
  const connectionId = crypto.randomUUID();
  const encoder = new TextEncoder();

  // Check admin role from query params (in production, verify server-side)
  const url = new URL(request.url);
  const role = url.searchParams.get("role");

  // Basic role check (in production, this would be verified server-side with session)
  if (!["admin", "superadmin", "instructor"].includes(role ?? "")) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(`[Demo SSE] Client connecting: ${connectionId}`);

  let isOpen = true;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Register with the demo hub
      demoHub.register(connectionId, (event: DemoEvent) => {
        if (!isOpen) return;
        try {
          controller.enqueue(encoder.encode(encodeEvent(event)));
        } catch {
          // Stream closed
          isOpen = false;
        }
      });
    },
    cancel() {
      console.log(`[Demo SSE] Client disconnected: ${connectionId}`);
      isOpen = false;
      demoHub.unregister(connectionId);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: sseHeaders,
  });
};

// =============================================================================
// GET Handler - Non-SSE (get current state)
// =============================================================================

const demoStateHandler = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const role = url.searchParams.get("role");
  const action = url.searchParams.get("action");

  // Basic role check
  if (!["admin", "superadmin", "instructor"].includes(role ?? "")) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (action === "progress") {
    // Return current student progress
    const progress = demoHub.getStudentProgress();
    const users = demoHub.getUsers();

    const progressData = users
      .filter((u) => u.role === "student")
      .map((user) => {
        const p = progress.get(user.id) ?? { completed: 0, total: 10 };
        return {
          user,
          completed: p.completed,
          total: p.total,
          percent: Math.round((p.completed / p.total) * 100),
        };
      });

    return new Response(JSON.stringify({ progress: progressData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (action === "users") {
    // Return all demo users
    const users = demoHub.getUsers();
    return new Response(JSON.stringify({ users }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (action === "history") {
    // Return message history
    const history = demoHub.getMessageHistory();
    return new Response(JSON.stringify({ history }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Default: return SSE stream check
  return new Response(
    JSON.stringify({
      message: "Demo events endpoint. Add ?stream=true for SSE.",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};

// =============================================================================
// Main Handler - Route based on Accept header or query param
// =============================================================================

const mainHandler = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const wantsStream = url.searchParams.get("stream") === "true";
  const acceptHeader = request.headers.get("Accept") ?? "";

  if (wantsStream || acceptHeader.includes("text/event-stream")) {
    return demoEventsSseHandler({ request });
  }

  return demoStateHandler({ request });
};

// =============================================================================
// Route
// =============================================================================

export const Route = createFileRoute("/api/demo-events")({
  server: {
    handlers: {
      GET: mainHandler,
    },
  },
});
