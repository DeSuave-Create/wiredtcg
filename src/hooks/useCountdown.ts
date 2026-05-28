import { useEffect, useState } from 'react';

export const KICKSTARTER_LAUNCH_DATE = new Date('2026-06-01T00:00:00-07:00');

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
}

function compute(target: Date): CountdownState {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
  }
  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    isLive: false,
  };
}

export function useCountdown(target: Date = KICKSTARTER_LAUNCH_DATE): CountdownState {
  const [state, setState] = useState<CountdownState>(() => compute(target));

  useEffect(() => {
    if (state.isLive) return;
    const id = setInterval(() => setState(compute(target)), 1000);
    return () => clearInterval(id);
  }, [target, state.isLive]);

  return state;
}

export const pad2 = (n: number) => n.toString().padStart(2, '0');
