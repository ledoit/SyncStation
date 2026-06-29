export const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
].join(" ");

export const SPOTIFY_COOKIE = {
  access: "strob_spotify_access",
  refresh: "strob_spotify_refresh",
  expires: "strob_spotify_expires",
  state: "strob_spotify_oauth_state",
} as const;

/** Force https on deployed hosts; keep http only for local dev. */
export function normalizeOrigin(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withScheme);
    const isLocal =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname.endsWith(".local");

    if (isLocal) {
      url.protocol = "http:";
    } else {
      url.protocol = "https:";
    }
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.origin;
  } catch {
    return trimmed;
  }
}

export function getAppOrigin(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);
  }
  if (process.env.VERCEL_URL) {
    return normalizeOrigin(process.env.VERCEL_URL);
  }
  return "http://localhost:3000";
}

export function getSpotifyRedirectUri(): string {
  if (process.env.SPOTIFY_REDIRECT_URI) {
    return normalizeOrigin(
      process.env.SPOTIFY_REDIRECT_URI.replace(
        /\/strob\/api\/spotify\/callback\/?$/,
        "",
      ),
    ) + "/strob/api/spotify/callback";
  }
  return `${getAppOrigin()}/strob/api/spotify/callback`;
}

export function spotifyConfigured(): boolean {
  return Boolean(
    process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET,
  );
}
