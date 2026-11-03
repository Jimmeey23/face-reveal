import { useEffect, useRef, useState } from "react";

interface Options {
  duration: number; // seconds
  active: boolean; // counting phase
  paused?: boolean;
  onTick?: (secondsLeft: number) => void;
  onComplete?: () => void;
}

/**
 * requestAnimationFrame-driven countdown with pause support.
 * Resets automatically whenever `active` flips to false.
 */
export function useCountdown({ duration, active, paused = false, onTick, onComplete }: Options) {
  const [remaining, setRemaining] = useState(duration);
  const elapsedRef = useRef(0);
  const lastWholeRef = useRef(Math.ceil(duration));
  const tickRef = useRef(onTick);
  const completeRef = useRef(onComplete);
  tickRef.current = onTick;
  completeRef.current = onComplete;

  useEffect(() => {
    if (!active) {
      elapsedRef.current = 0;
      lastWholeRef.current = Math.ceil(duration);
      setRemaining(duration);
      return;
    }
    if (paused) return;

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      elapsedRef.current += (now - last) / 1000;
      last = now;
      const rem = Math.max(0, duration - elapsedRef.current);
      setRemaining(rem);
      const whole = Math.ceil(rem);
      if (whole !== lastWholeRef.current) {
        lastWholeRef.current = whole;
        if (whole > 0) tickRef.current?.(whole);
      }
      if (rem <= 0) {
        completeRef.current?.();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, paused, duration]);

  return { remaining, progress: duration > 0 ? remaining / duration : 0 };
}
