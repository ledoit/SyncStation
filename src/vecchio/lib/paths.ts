/** URL prefix for Vecchio inside Menhir SyncStation. */
export const VECCHIO_BASE = "/vecchio";

export function vecchioPath(path = ""): string {
  if (!path || path === "/") return VECCHIO_BASE;
  return `${VECCHIO_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
