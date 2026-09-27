"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** One small lifecycle for replaceable local work. No result survives cancel/unmount. */
export function useLocalOperation() {
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const [phase, setPhase] = useState<"idle" | "reading" | "ready" | "error">(
    "idle",
  );
  const cancel = useCallback(() => {
    generation.current += 1;
    controller.current?.abort();
    controller.current = null;
    setPhase("idle");
  }, []);
  useEffect(
    () => () => {
      generation.current += 1;
      controller.current?.abort();
    },
    [],
  );
  const begin = useCallback(() => {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    const id = ++generation.current;
    setPhase("reading");
    const current = () => id === generation.current && !abort.signal.aborted;
    return {
      current,
      signal: abort.signal,
      finish: () => {
        if (current()) setPhase("ready");
      },
      fail: () => {
        if (current()) setPhase("error");
      },
    };
  }, []);
  return { begin, cancel, phase, busy: phase === "reading" };
}
