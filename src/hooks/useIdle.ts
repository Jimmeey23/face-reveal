import { useEffect, useState } from "react";

/** Returns true after `ms` of no pointer/keyboard activity (when enabled). */
export function useIdle(ms: number, enabled: boolean) {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIdle(false);
      return;
    }
    let timer: number;
    const reset = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), ms);
    };
    const events: (keyof WindowEventMap)[] = ["mousemove", "mousedown", "keydown", "touchstart", "wheel"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [ms, enabled]);

  return idle;
}
