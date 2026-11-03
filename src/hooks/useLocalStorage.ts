import { useCallback, useEffect, useRef, useState } from "react";

function readValue<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw) as T;
    // merge for plain objects so new default keys are picked up
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && fallback && typeof fallback === "object") {
      return { ...(fallback as object), ...(parsed as object) } as T;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readValue(key, fallback));
  const [error, setError] = useState<string | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      setError(null);
    } catch {
      setError("Storage is full — try removing a few custom people.");
    }
  }, [key, value]);

  const update = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) => (typeof next === "function" ? (next as (p: T) => T)(prev) : next));
  }, []);

  return [value, update, error] as const;
}
