import { describe, expect, it } from 'vitest';
import { sseHeaders } from './sse-response.js';

describe('SSE Response Helpers', () => {
  describe('sseHeaders', () => {
    it('returns correct Content-Type', () => {
      const headers = sseHeaders();
      expect(headers['Content-Type']).toBe('text/event-stream');
    });

    it('disables caching', () => {
      const headers = sseHeaders();
      expect(headers['Cache-Control']).toBe('no-cache, no-transform');
    });

    it('sets keep-alive connection', () => {
      const headers = sseHeaders();
      expect(headers['Connection']).toBe('keep-alive');
    });

    it('disables nginx buffering', () => {
      const headers = sseHeaders();
      expect(headers['X-Accel-Buffering']).toBe('no');
    });
  });
});
