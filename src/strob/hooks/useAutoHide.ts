"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_HIDE_MS = 2500;

export function useAutoHide(delayMs = DEFAULT_HIDE_MS) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), delayMs);
  }, [delayMs]);

  useEffect(() => {
    show();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show]);

  useEffect(() => {
    const onActivity = () => show();

    window.addEventListener("mousemove", onActivity, { passive: true });
    window.addEventListener("mousedown", onActivity, { passive: true });
    window.addEventListener("touchstart", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity, { passive: true });
    window.addEventListener("scroll", onActivity, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("mousedown", onActivity);
      window.removeEventListener("touchstart", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("scroll", onActivity);
    };
  }, [show]);

  return { visible, show };
}
