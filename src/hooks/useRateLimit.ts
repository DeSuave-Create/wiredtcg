import { useRef, useCallback } from 'react';

interface RateLimitOptions {
  limit: number; // Maximum calls per window
  windowMs: number; // Time window in milliseconds
}

export const useRateLimit = (options: RateLimitOptions) => {
  const callTimestamps = useRef<number[]>([]);

  const isAllowed = useCallback(() => {
    const now = Date.now();
    const { limit, windowMs } = options;

    // Remove timestamps outside the current window
    callTimestamps.current = callTimestamps.current.filter(
      timestamp => now - timestamp < windowMs
    );

    // Check if we're within the limit
    if (callTimestamps.current.length >= limit) {
      return false;
    }

    // Add current timestamp
    callTimestamps.current.push(now);
    return true;
  }, [options]);

  const getRemainingTime = useCallback(() => {
    const now = Date.now();
    const { limit, windowMs } = options;

    // Clean old timestamps
    callTimestamps.current = callTimestamps.current.filter(
      timestamp => now - timestamp < windowMs
    );

    if (callTimestamps.current.length < limit) {
      return 0;
    }

    // Return time until oldest call expires
    const oldestCall = callTimestamps.current[0];
    return Math.max(0, windowMs - (now - oldestCall));
  }, [options]);

  return { isAllowed, getRemainingTime };
};