import { lookupGetSongBpm } from "./getsongbpm";
import type { BpmMatch, BpmSource } from "./types";

export type ResolveBpmInput = {
  title: string;
  artist: string;
  spotifyTrackId?: string;
  /** Pre-fetched from Spotify audio-features when available (legacy apps only). */
  spotifyTempo?: number | null;
};

export type ResolveBpmResult = BpmMatch | null;

async function trySpotifyFeatures(
  tempo: number | null | undefined,
  title: string,
  artist: string,
): Promise<ResolveBpmResult> {
  if (tempo == null || tempo <= 0) return null;
  return {
    bpm: Math.round(tempo),
    source: "spotify-features",
    title,
    artist,
  };
}

/**
 * Resolve BPM for a track. Spotify audio-features are unavailable for most
 * new Developer apps (403 since Nov 2024) — GetSongBPM is the primary source.
 */
export async function resolveBpm(
  input: ResolveBpmInput,
): Promise<ResolveBpmResult> {
  const { title, artist, spotifyTempo } = input;

  const fromSpotify = await trySpotifyFeatures(spotifyTempo, title, artist);
  if (fromSpotify) return fromSpotify;

  const fromGetSong = await lookupGetSongBpm(title, artist);
  if (fromGetSong) return fromGetSong;

  return null;
}

export function formatBpmSource(source: BpmSource): string {
  switch (source) {
    case "spotify-features":
      return "Spotify";
    case "getsongbpm":
      return "GetSongBPM";
    case "manual":
      return "Manual";
    default:
      return source;
  }
}
