'use client';

import { useState, useEffect } from 'react';
import { secondsUntil } from '@/lib/utils/format';

export function useCooldown(nextAvailableAt: string | null) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    nextAvailableAt ? secondsUntil(nextAvailableAt) : 0
  );

  useEffect(() => {
    if (!nextAvailableAt) {
      setRemainingSeconds(0);
      return;
    }

    setRemainingSeconds(secondsUntil(nextAvailableAt));

    const timer = setInterval(() => {
      const remaining = secondsUntil(nextAvailableAt);
      setRemainingSeconds(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [nextAvailableAt]);

  const isExpired = remainingSeconds <= 0;

  return { remainingSeconds, isExpired };
}

export function useCountdown(initialSeconds: number, onExpire?: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) {
      onExpire?.();
      return;
    }
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds, onExpire]);

  return seconds;
}
