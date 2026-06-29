"use client";

import { useEffect, useState } from "react";
import { paletteColors } from "@strob/lib/colors";
import { getColorIndexAt, getCurrentColor, type SessionState } from "@strob/lib/session-state";

export function useStrobeDisplay(state: SessionState) {
  const [color, setColor] = useState(() => getCurrentColor(state));

  useEffect(() => {
    setColor(getCurrentColor(state));

    if (!state.playing || state.cps <= 0) return;

    const palette = paletteColors(state.colors);
    if (palette.length === 0) return;

    const intervalMs = Math.max(16, 1000 / state.cps / 4);

    const tick = () => setColor(getCurrentColor(state));
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [state]);

  const index = getColorIndexAt(state);
  return { color, index };
}
