import { checkRateLimit, RateLimitConfig } from '../../frontend/lib/rate-limit';

describe('Rate Limiting', () => {
  const testConfig: RateLimitConfig = {
    windowMs: 60000,
    maxRequests: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const result = checkRateLimit('test-ip', 'test-action', testConfig);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should allow multiple requests within limit', () => {
      for (let i = 0; i < 4; i++) {
        const result = checkRateLimit('test-ip', 'test-action', testConfig);
        expect(result.allowed).toBe(true);
      }
    });

    it('should block requests over limit', () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit('test-ip', 'test-action', testConfig);
      }
      
      const result = checkRateLimit('test-ip', 'test-action', testConfig);
      
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', () => {
      jest.useFakeTimers();
      
      checkRateLimit('test-ip', 'test-action', testConfig);
      
      jest.advanceTimersByTime(61000);
      
      const result = checkRateLimit('test-ip', 'test-action', testConfig);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      
      jest.useRealTimers();
    });

    it('should track different actions separately', () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit('test-ip', 'action1', testConfig);
      }
      
      const result1 = checkRateLimit('test-ip', 'action1', testConfig);
      const result2 = checkRateLimit('test-ip', 'action2', testConfig);
      
      expect(result1.allowed).toBe(false);
      expect(result2.allowed).toBe(true);
      
      jest.useRealTimers();
    });

    it('should track different IPs separately', () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit('ip1', 'test-action', testConfig);
      }
      
      const result1 = checkRateLimit('ip1', 'test-action', testConfig);
      const result2 = checkRateLimit('ip2', 'test-action', testConfig);
      
      expect(result1.allowed).toBe(false);
      expect(result2.allowed).toBe(true);
      
      jest.useRealTimers();
    });
  });
});
