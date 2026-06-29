import { DEFAULT_CPS, MOODLIGHT_COLOR_SLOTS, paletteColors } from "./colors";

export type SessionState = {
  colors: string[];
  cps: number;
  playing: boolean;
  epochMs: number;
  colorIndexAtEpoch: number;
};

export type ServerMessage =
  | { type: "sync"; state: SessionState; viewerCount: number }
  | { type: "error"; message: string }
  | { type: "claimed"; ok: true };

export type ClientMessage =
  | { type: "claim"; token: string }
  | { type: "patch"; token: string; state: Partial<SessionState> };

export function createInitialState(): SessionState {
  return {
    colors: [...MOODLIGHT_COLOR_SLOTS],
    cps: DEFAULT_CPS,
    playing: false,
    epochMs: Date.now(),
    colorIndexAtEpoch: 0,
  };
}

export function getColorIndexAt(
  state: SessionState,
  atMs: number = Date.now(),
): number {
  const palette = paletteColors(state.colors);
  if (palette.length === 0) return 0;

  if (!state.playing) {
    return state.colorIndexAtEpoch % palette.length;
  }

  const elapsedSec = Math.max(0, (atMs - state.epochMs) / 1000);
  const steps = Math.floor(elapsedSec * state.cps);
  return (state.colorIndexAtEpoch + steps) % palette.length;
}

export function getCurrentColor(
  state: SessionState,
  atMs: number = Date.now(),
): string {
  const palette = paletteColors(state.colors);
  if (palette.length === 0) return "#000000";
  return palette[getColorIndexAt(state, atMs)] ?? "#000000";
}

/** Re-anchor playback when CPS or palette changes mid-run. */
export function reanchorState(
  state: SessionState,
  atMs: number = Date.now(),
): SessionState {
  if (!state.playing) return state;
  return {
    ...state,
    colorIndexAtEpoch: getColorIndexAt(state, atMs),
    epochMs: atMs,
  };
}

export function applyPatch(
  current: SessionState,
  patch: Partial<SessionState>,
): SessionState {
  const now = Date.now();
  let next: SessionState = { ...current, ...patch };

  if (patch.playing === true && !current.playing) {
    next = {
      ...next,
      playing: true,
      epochMs: now,
      colorIndexAtEpoch: getColorIndexAt(current, now),
    };
  }

  if (patch.playing === false && current.playing) {
    const idx = getColorIndexAt(current, now);
    next = {
      ...next,
      playing: false,
      colorIndexAtEpoch: idx,
      epochMs: now,
    };
  }

  if (
    current.playing &&
    next.playing &&
    (patch.cps !== undefined || patch.colors !== undefined)
  ) {
    next = reanchorState(next, now);
  }

  return next;
}
