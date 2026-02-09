import { describe, expect, it } from 'vitest';
import * as Schema from 'effect/Schema';
import {
  ConnectionId,
  SseSystemEvent,
  encodeEvent,
  encodeKeepalive,
  makeEventDecoder,
  defaultSseConfig,
} from './schema.js';

describe('SSE Domain Schema', () => {
  describe('ConnectionId', () => {
    it('brands a string as ConnectionId', () => {
      const id = Schema.decodeUnknownSync(ConnectionId)('conn-123');
      expect(id).toBe('conn-123');
    });

    it('rejects non-string values', () => {
      expect(() => Schema.decodeUnknownSync(ConnectionId)(42)).toThrow();
    });
  });

  describe('SseSystemEvent', () => {
    it('decodes SseKeepalive', () => {
      const decoded = Schema.decodeUnknownSync(SseSystemEvent)({
        _tag: 'SseKeepalive',
        timestamp: 1234567890,
      });
      expect(decoded._tag).toBe('SseKeepalive');
    });

    it('decodes SseError', () => {
      const decoded = Schema.decodeUnknownSync(SseSystemEvent)({
        _tag: 'SseError',
        code: 'RATE_LIMIT',
        message: 'Too many requests',
      });
      expect(decoded._tag).toBe('SseError');
    });

    it('decodes SseConnected', () => {
      const decoded = Schema.decodeUnknownSync(SseSystemEvent)({
        _tag: 'SseConnected',
        connectionId: 'abc-123',
      });
      expect(decoded._tag).toBe('SseConnected');
    });
  });

  describe('encodeEvent', () => {
    it('encodes a tagged event to SSE format', () => {
      const event = { _tag: 'TestEvent', data: 'hello' };
      const result = encodeEvent(event);
      expect(result).toBe(`event: TestEvent\ndata: ${JSON.stringify(event)}\n\n`);
    });

    it('produces valid SSE wire format with event name and JSON data', () => {
      const event = { _tag: 'MessageSent', content: 'hi', roomId: 'r1' };
      const lines = encodeEvent(event).split('\n');
      expect(lines[0]).toBe('event: MessageSent');
      expect(lines[1]).toMatch(/^data: \{/);
      expect(lines[2]).toBe('');
      expect(lines[3]).toBe('');
    });
  });

  describe('encodeKeepalive', () => {
    it('encodes a keepalive comment', () => {
      const result = encodeKeepalive();
      expect(result).toMatch(/^: keepalive \d+\n\n$/);
    });
  });

  describe('makeEventDecoder', () => {
    const TestEvent = Schema.Struct({
      _tag: Schema.Literal('TestEvent'),
      value: Schema.Number,
    });

    it('decodes valid JSON data', () => {
      const decoder = makeEventDecoder(TestEvent);
      const result = decoder(JSON.stringify({ _tag: 'TestEvent', value: 42 }));
      expect(result).toEqual({ _tag: 'TestEvent', value: 42 });
    });

    it('throws on invalid JSON', () => {
      const decoder = makeEventDecoder(TestEvent);
      expect(() => decoder('not json')).toThrow();
    });

    it('throws on invalid schema', () => {
      const decoder = makeEventDecoder(TestEvent);
      expect(() => decoder(JSON.stringify({ _tag: 'Wrong', value: 'str' }))).toThrow();
    });
  });

  describe('defaultSseConfig', () => {
    it('has expected default values', () => {
      expect(defaultSseConfig.keepaliveInterval).toBe(15000);
      expect(defaultSseConfig.maxDuration).toBe(0);
      expect(defaultSseConfig.retryAttempts).toBe(5);
      expect(defaultSseConfig.retryBaseDelay).toBe(1000);
    });
  });
});
