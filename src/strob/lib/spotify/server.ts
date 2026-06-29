import { cookies } from "next/headers";
import { resolveBpm } from "@strob/lib/bpm/resolve";
import type { BpmSource } from "@strob/lib/bpm/types";
import { SPOTIFY_COOKIE, getSpotifyRedirectUri, spotifyConfigured } from "./config";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

export type SpotifyTrackInfo = {
  trackId: string;
  name: string;
  artist: string;
  bpm: number | null;
  bpmSource: BpmSource | null;
  isPlaying: boolean;
};

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};

type CurrentlyPlayingResponse = {
  is_playing?: boolean;
  item?: {
    id: string;
    name: string;
    artists: { name: string }[];
  } | null;
};

type AudioFeaturesResponse = {
  tempo: number;
};

async function spotifyFetch<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
): Promise<T | null> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (res.status === 204) return null;
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Spotify API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getSpotifyRedirectUri(),
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`Spotify token exchange failed: ${await res.text()}`);
  }
  return res.json() as Promise<TokenResponse>;
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<TokenResponse> {
  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`Spotify refresh failed: ${await res.text()}`);
  }
  return res.json() as Promise<TokenResponse>;
}

export async function setTokenCookies(tokens: TokenResponse) {
  const jar = await cookies();
  const expiresAt = Date.now() + tokens.expires_in * 1000;

  jar.set(SPOTIFY_COOKIE.access, tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: tokens.expires_in,
  });

  if (tokens.refresh_token) {
    jar.set(SPOTIFY_COOKIE.refresh, tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 60,
    });
  }

  jar.set(SPOTIFY_COOKIE.expires, String(expiresAt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
}

export async function clearTokenCookies() {
  const jar = await cookies();
  for (const name of Object.values(SPOTIFY_COOKIE)) {
    jar.delete(name);
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  if (!spotifyConfigured()) return null;

  const jar = await cookies();
  const access = jar.get(SPOTIFY_COOKIE.access)?.value;
  const refresh = jar.get(SPOTIFY_COOKIE.refresh)?.value;
  const expiresRaw = jar.get(SPOTIFY_COOKIE.expires)?.value;
  const expiresAt = expiresRaw ? Number(expiresRaw) : 0;

  if (access && Date.now() < expiresAt - 60_000) {
    return access;
  }

  if (!refresh) return null;

  const tokens = await refreshAccessToken(refresh);
  await setTokenCookies({
    ...tokens,
    refresh_token: tokens.refresh_token ?? refresh,
  });
  return tokens.access_token;
}

export async function fetchNowPlayingTrack(): Promise<SpotifyTrackInfo | null> {
  const accessToken = await getValidAccessToken();
  if (!accessToken) return null;

  let playing: CurrentlyPlayingResponse | null;
  try {
    playing = await spotifyFetch<CurrentlyPlayingResponse>(
      "/me/player/currently-playing",
      accessToken,
    );
  } catch {
    return null;
  }

  if (!playing) return null;

  const item = playing.item;
  if (!item?.id) return null;

  let spotifyTempo: number | null = null;
  try {
    const features = await spotifyFetch<AudioFeaturesResponse>(
      `/audio-features/${item.id}`,
      accessToken,
    );
    if (features && features.tempo > 0) spotifyTempo = features.tempo;
  } catch {
    /* New Spotify apps get 403 on audio-features — fallback in resolveBpm */
  }

  const title = item.name;
  const artist = item.artists.map((a) => a.name).join(", ");
  const resolved = await resolveBpm({
    title,
    artist,
    spotifyTrackId: item.id,
    spotifyTempo,
  });

  return {
    trackId: item.id,
    name: title,
    artist,
    bpm: resolved?.bpm ?? null,
    bpmSource: resolved?.source ?? null,
    isPlaying: playing.is_playing ?? false,
  };
}
