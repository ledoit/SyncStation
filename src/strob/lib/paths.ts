/** URL prefix for Strob inside Menhir SyncStation. */
export const STROB_BASE = "/strob";

export function strobPath(path = ""): string {
  if (!path || path === "/") return STROB_BASE;
  return `${STROB_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export function strobViewerUrl(code: string, origin?: string): string {
  const path = strobPath(`/v/${code}`);
  if (origin) return `${origin.replace(/\/$/, "")}${path}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  return path;
}
