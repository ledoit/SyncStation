const SYNC_KEY = "strob-spotify-sync";
const MULTIPLIER_KEY = "strob-spotify-multiplier";

export function isSpotifySyncEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SYNC_KEY) === "1";
}

export function setSpotifySyncEnabled(enabled: boolean) {
  sessionStorage.setItem(SYNC_KEY, enabled ? "1" : "0");
}

export function getStoredBeatMultiplier(): number {
  if (typeof window === "undefined") return 1;
  const raw = sessionStorage.getItem(MULTIPLIER_KEY);
  const n = raw ? Number(raw) : 1;
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function setStoredBeatMultiplier(multiplier: number) {
  sessionStorage.setItem(MULTIPLIER_KEY, String(multiplier));
}
