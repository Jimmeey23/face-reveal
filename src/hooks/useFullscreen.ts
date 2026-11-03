import { useCallback, useEffect, useState } from "react";

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const supported = typeof document !== "undefined" && !!document.documentElement.requestFullscreen;

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      /* ignore */
    }
  }, []);

  return { isFullscreen, toggle, supported };
}
