import { MAX_CPS, MIN_CPS } from "./colors";

/** Color changes per second from tempo and beat multiplier (changes per beat). */
export function bpmToCps(bpm: number, beatMultiplier: number): number {
  if (bpm <= 0 || beatMultiplier <= 0) return MIN_CPS;
  const raw = (bpm / 60) * beatMultiplier;
  return clampCps(raw);
}

export function clampCps(cps: number): number {
  return Math.min(MAX_CPS, Math.max(MIN_CPS, cps));
}

export const BPM_MULTIPLIERS = [
  { value: 0.25, label: "¼×" },
  { value: 0.5, label: "½×" },
  { value: 1, label: "1×" },
  { value: 2, label: "2×" },
  { value: 4, label: "4×" },
] as const;

export const DEFAULT_BEAT_MULTIPLIER = 1;
