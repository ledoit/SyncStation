/** Eight slots from moodlight.org `main.js` — 7 colors + blank 8th holder. */
export const MOODLIGHT_COLOR_SLOTS = [
  "#ff0000",
  "#7fff00",
  "#ffff00",
  "#0000ff",
  "#ff7f00",
  "#bf00bf",
  "#000000",
  "", // blank slot (moodlight shows #555 until user picks)
] as const;

export const MOODLIGHT_SLOT_COUNT = MOODLIGHT_COLOR_SLOTS.length;

/** @deprecated use MOODLIGHT_COLOR_SLOTS */
export const MOODLIGHT_DEFAULT_COLORS = MOODLIGHT_COLOR_SLOTS;

export const BLANK_SLOT_COLOR = "#555555";

/** Moodlight loads Disco preset at init (~5 changes/sec). */
export const DEFAULT_CPS = 5;

export const MIN_CPS = 0.05;
export const MAX_CPS = 30;

export function normalizeHex(color: string): string {
  const raw = color.trim().replace(/^#/, "");
  if (!raw || !/^[0-9a-fA-F]{6}$/.test(raw)) {
    return "";
  }
  return `#${raw.toLowerCase()}`;
}

/** Colors used in the strobe sequence (skips empty slots). */
export function paletteColors(colors: string[]): string[] {
  return colors.map(normalizeHex).filter((c) => c.length > 0);
}
