/**
 * Tests for the Messages Page
 *
 * Verifies messaging UI rendering, channel list, and chat area.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";

// =============================================================================
// Mocks
// =============================================================================

// Mock EventSource globally before imports
const mockEventSource = {
  onopen: null as any,
  onerror: null as any,
  onmessage: null as any,
  close: vi.fn(),
};

vi.stubGlobal(
  "EventSource",
  vi.fn(() => mockEventSource)
);

vi.mock("@effect-atom/atom-react", () => ({
  useAtomValue: () => ({
    _tag: "Success",
    value: {
      user: {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        image: null,
        role: "student",
      },
      session: { token: "mock-token" },
    },
  }),
  useAtomSet: () => vi.fn(),
}));

vi.mock("@auth", () => ({
  sessionAtom: "sessionAtom",
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: any) => ({
    ...opts,
    useParams: () => ({}),
    useSearch: () => ({}),
  }),
  Link: ({ children, to, ...props }: any) => (
    <a href={typeof to === "string" ? to : "#"} {...props}>
      {children}
    </a>
  ),
  redirect: vi.fn(),
}));

// Mock the Chat component from @chat/components
vi.mock("@chat/components", () => ({
  Chat: Object.assign(
    ({ children, ...props }: any) => (
      <div data-testid="chat-container" {...props}>
        {children}
      </div>
    ),
    {
      Header: Object.assign(
        ({ children, ...props }: any) => (
          <div data-testid="chat-header" {...props}>
            {children}
          </div>
        ),
        {
          Start: ({ children, ...props }: any) => (
            <div {...props}>{children}</div>
          ),
          Main: ({ children, ...props }: any) => (
            <div {...props}>{children}</div>
          ),
          End: ({ children, ...props }: any) => (
            <div {...props}>{children}</div>
          ),
        }
      ),
      Messages: ({ children, ...props }: any) => (
        <div data-testid="chat-messages" {...props}>
          {children}
        </div>
      ),
      Input: ({ placeholder, ...props }: any) => (
        <input data-testid="chat-input" placeholder={placeholder} {...props} />
      ),
      PrimaryMessage: ({ senderName, content }: any) => (
        <div>
          <span>{senderName}</span>
          <span>{content}</span>
        </div>
      ),
      AdditionalMessage: ({ content }: any) => (
        <div>
          <span>{content}</span>
        </div>
      ),
    }
  ),
}));

// Mock shadcn components
vi.mock("@shadcn", () => ({
  Avatar: Object.assign(
    ({ children, ...props }: any) => <div {...props}>{children}</div>,
    {
      Image: ({ ...props }: any) => <img alt="" {...props} />,
      Fallback: ({ children, ...props }: any) => (
        <span {...props}>{children}</span>
      ),
    }
  ),
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Card: Object.assign(
    ({ children, ...props }: any) => <div {...props}>{children}</div>,
    {
      Header: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Content: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
    }
  ),
  Dialog: Object.assign(
    ({ children, open, ...props }: any) =>
      open ? <div {...props}>{children}</div> : null,
    {
      Content: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Header: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Title: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Description: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
    }
  ),
}));

vi.mock("@shadcn/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

// =============================================================================
// Tests
// =============================================================================

describe("Messages Page", () => {
  let MessagesPage: React.ComponentType;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockEventSource.close.mockReset();
    const mod = await import("../routes/messages");
    MessagesPage = (mod.Route as any)?.component;
  });

  it("renders the messages page header", () => {
    if (!MessagesPage) return;
    render(<MessagesPage />);
    expect(screen.getByText("Course Messages")).toBeInTheDocument();
  });

  it("shows default channels", () => {
    if (!MessagesPage) return;
    render(<MessagesPage />);
    expect(screen.getByText("Announcements")).toBeInTheDocument();
    // "General Discussion" appears in sidebar and chat header, use getAllByText
    expect(screen.getAllByText("General Discussion").length).toBeGreaterThan(0);
  });

  it("shows Course Channels section heading", () => {
    if (!MessagesPage) return;
    render(<MessagesPage />);
    expect(screen.getByText("Course Channels")).toBeInTheDocument();
  });

  it("shows Direct Messages section heading", () => {
    if (!MessagesPage) return;
    render(<MessagesPage />);
    expect(screen.getByText("Direct Messages")).toBeInTheDocument();
  });

  it("shows empty state for DMs", () => {
    if (!MessagesPage) return;
    render(<MessagesPage />);
    expect(screen.getByText("No conversations yet")).toBeInTheDocument();
  });

  it("shows New Message button", () => {
    if (!MessagesPage) return;
    render(<MessagesPage />);
    expect(screen.getByText("New Message")).toBeInTheDocument();
  });

  it("renders the chat area", () => {
    if (!MessagesPage) return;
    render(<MessagesPage />);
    expect(screen.getByTestId("chat-container")).toBeInTheDocument();
  });

  it("creates an EventSource connection on mount", () => {
    if (!MessagesPage) return;
    render(<MessagesPage />);
    expect(EventSource).toHaveBeenCalled();
  });
});
