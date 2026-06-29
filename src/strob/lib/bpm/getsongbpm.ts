import type { BpmMatch, BpmSearchResult } from "./types";

const API_BASE = "https://api.getsongbpm.com";

type GetSongBpmArtist = { id?: string; name?: string };
type GetSongBpmRawItem = {
  id?: string;
  song_id?: string;
  title?: string;
  song_title?: string;
  name?: string;
  tempo?: string | number;
  artist?: GetSongBpmArtist | GetSongBpmArtist[];
};

type GetSongBpmSearchPayload =
  | GetSongBpmRawItem[]
  | { error?: string; message?: string };

type GetSongBpmSearchResponse = {
  search?: GetSongBpmSearchPayload;
};

type GetSongBpmSongResponse = {
  song?: GetSongBpmRawItem & { tempo?: string | number };
};

export function getsongbpmConfigured(): boolean {
  return Boolean(process.env.GETSONGBPM_API_KEY?.trim());
}

function parseTempo(tempo: string | number | undefined): number | null {
  if (tempo == null) return null;
  const n = typeof tempo === "number" ? tempo : Number.parseFloat(String(tempo));
  if (!Number.isFinite(n) || n <= 0 || n > 300) return null;
  return Math.round(n);
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(feat\.[^)]+\)/gi, "")
    .replace(/\(with[^)]+\)/gi, "")
    .replace(/\s*[-–—]\s*[^-–—]+$/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Strip remix/version suffixes for cleaner lookups. */
export function cleanTrackTitle(raw: string): string {
  return raw
    .replace(/\s*[-–—]\s*(.*?(remix|mix|edit|version).*?)$/i, "")
    .replace(/\s*\([^)]*(remix|mix|edit)[^)]*\)/gi, "")
    .trim();
}

export function primaryArtist(raw: string): string {
  return raw.split(/,|&/)[0]?.trim() ?? raw;
}

function buildBothLookup(title: string, artist: string): string {
  return `song:${cleanTrackTitle(title)}+artist:${primaryArtist(artist)}`;
}

function parseSearchItems(payload: GetSongBpmSearchPayload | undefined): {
  items: GetSongBpmRawItem[];
  error: string | null;
} {
  if (!payload) return { items: [], error: null };
  if (Array.isArray(payload)) return { items: payload, error: null };
  if (typeof payload === "object" && payload.error) {
    return { items: [], error: payload.error };
  }
  return { items: [], error: null };
}

function itemTitle(item: GetSongBpmRawItem): string {
  return (item.song_title ?? item.title ?? "").trim();
}

function itemArtistName(item: GetSongBpmRawItem): string {
  if (Array.isArray(item.artist)) {
    return item.artist[0]?.name?.trim() ?? "";
  }
  if (item.artist && typeof item.artist === "object") {
    return item.artist.name?.trim() ?? "";
  }
  // type=song search returns artist name in `name`
  return (item.name ?? "").trim();
}

function itemId(item: GetSongBpmRawItem): string | null {
  const id = item.song_id ?? item.id;
  return id ? String(id) : null;
}

function matchScore(
  title: string,
  artist: string,
  candidate: GetSongBpmRawItem,
): number {
  const wantTitle = normalize(cleanTrackTitle(title));
  const wantArtist = normalize(primaryArtist(artist));
  const gotTitle = normalize(itemTitle(candidate));
  const gotArtist = normalize(itemArtistName(candidate));
  let score = 0;
  if (gotTitle && wantTitle && gotTitle === wantTitle) score += 50;
  else if (gotTitle && wantTitle && (gotTitle.includes(wantTitle) || wantTitle.includes(gotTitle))) {
    score += 28;
  }
  if (gotArtist && wantArtist && gotArtist === wantArtist) score += 40;
  else if (
    gotArtist &&
    wantArtist &&
    (gotArtist.includes(wantArtist) ||
      wantArtist.includes(gotArtist) ||
      wantArtist.split(" ").some((w) => w.length > 2 && gotArtist.includes(w)))
  ) {
    score += 22;
  }
  return score;
}

async function apiGet<T>(path: string, params: Record<string, string>): Promise<{
  data: T | null;
  error: string | null;
  status: number;
}> {
  const apiKey = process.env.GETSONGBPM_API_KEY?.trim();
  if (!apiKey) return { data: null, error: "No API key", status: 0 };

  const url = new URL(`${API_BASE}/${path.replace(/^\//, "")}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "X-API-KEY": apiKey,
      "User-Agent": "Strob/1.0 (https://strob.vercel.app)",
    },
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    const isHtml = text.includes("<!DOCTYPE") || text.includes("<html");
    return {
      data: null,
      error: isHtml
        ? `GetSongBPM blocked or unavailable (HTTP ${res.status})`
        : text.slice(0, 200),
      status: res.status,
    };
  }

  try {
    return { data: JSON.parse(text) as T, error: null, status: res.status };
  } catch {
    return { data: null, error: "Invalid JSON from GetSongBPM", status: res.status };
  }
}

async function fetchSongTempoById(songId: string): Promise<number | null> {
  const { data, error } = await apiGet<GetSongBpmSongResponse>("song", {
    api_key: process.env.GETSONGBPM_API_KEY!.trim(),
    id: songId,
  });
  if (error || !data?.song) return null;
  return parseTempo(data.song.tempo);
}

async function enrichWithTempo(
  item: GetSongBpmRawItem,
): Promise<GetSongBpmRawItem> {
  let tempo = item.tempo;
  if (parseTempo(tempo) == null) {
    const id = itemId(item);
    if (id) {
      const fetched = await fetchSongTempoById(id);
      if (fetched != null) tempo = fetched;
    }
  }
  return { ...item, tempo };
}

async function searchRaw(
  type: "both" | "song" | "artist",
  lookup: string,
): Promise<{ items: GetSongBpmRawItem[]; error: string | null }> {
  const apiKey = process.env.GETSONGBPM_API_KEY!.trim();
  const { data, error } = await apiGet<GetSongBpmSearchResponse>("search", {
    api_key: apiKey,
    type,
    lookup,
    limit: "15",
  });

  if (error) return { items: [], error };
  const { items, error: searchError } = parseSearchItems(data?.search);
  if (searchError) return { items: [], error: searchError };
  return { items, error: null };
}

/** Guess title + artist from free-text search. */
export function parseQueryGuess(query: string): { title: string; artist: string } {
  const q = query.trim();
  if (q.includes(" - ")) {
    const [a, b] = q.split(" - ").map((s) => s.trim());
    return { title: cleanTrackTitle(b || a), artist: primaryArtist(a) };
  }
  const words = q.split(/\s+/);
  if (words.length >= 2) {
    const artist = words[words.length - 1];
    const title = words.slice(0, -1).join(" ");
    return { title: cleanTrackTitle(title), artist };
  }
  return { title: cleanTrackTitle(q), artist: "" };
}

export async function searchGetSongBpm(
  query: string,
): Promise<{ results: BpmSearchResult[]; error: string | null }> {
  const trimmed = query.trim();
  if (!trimmed || !getsongbpmConfigured()) {
    return { results: [], error: null };
  }

  const { title, artist } = parseQueryGuess(trimmed);
  const attempts: { type: "both" | "song"; lookup: string }[] = [];

  if (title && artist) {
    attempts.push({ type: "both", lookup: buildBothLookup(title, artist) });
  }
  attempts.push({ type: "song", lookup: title || trimmed });
  if (artist && title) {
    attempts.push({ type: "both", lookup: buildBothLookup(title, artist.split(" ").pop() ?? artist) });
  }

  const seen = new Set<string>();
  const results: BpmSearchResult[] = [];
  let lastError: string | null = null;

  for (const { type, lookup } of attempts) {
    const { items, error } = await searchRaw(type, lookup);
    if (error) lastError = error;
    for (const raw of items) {
      const enriched = await enrichWithTempo(raw);
      const t = itemTitle(enriched);
      const a = itemArtistName(enriched);
      const id = itemId(enriched) ?? `${t}-${a}`;
      if (!t || seen.has(id)) continue;
      seen.add(id);
      results.push({
        id,
        title: t,
        artist: a,
        bpm: parseTempo(enriched.tempo),
        source: "getsongbpm",
      });
    }
    if (results.length >= 5) break;
  }

  return { results, error: results.length === 0 ? lastError : null };
}

export async function lookupGetSongBpm(
  title: string,
  artist: string,
): Promise<BpmMatch | null> {
  if (!getsongbpmConfigured()) return null;

  const cleanTitle = cleanTrackTitle(title);
  const mainArtist = primaryArtist(artist);

  const attempts: { type: "both" | "song"; lookup: string }[] = [
    { type: "both", lookup: buildBothLookup(cleanTitle, mainArtist) },
    { type: "song", lookup: cleanTitle },
  ];

  let best: { item: GetSongBpmRawItem; score: number } | null = null;

  for (const { type, lookup } of attempts) {
    const { items } = await searchRaw(type, lookup);
    for (const raw of items) {
      const enriched = await enrichWithTempo(raw);
      const score = matchScore(cleanTitle, mainArtist, enriched);
      const bpm = parseTempo(enriched.tempo);
      if (bpm == null || score < 25) continue;
      if (!best || score > best.score) {
        best = { item: enriched, score };
      }
    }
    if (best && best.score >= 55) break;
  }

  if (!best) return null;

  const bpm = parseTempo(best.item.tempo);
  if (bpm == null) return null;

  return {
    bpm,
    source: "getsongbpm",
    title: itemTitle(best.item) || cleanTitle,
    artist: itemArtistName(best.item) || mainArtist,
  };
}

/** Probe API for health checks (no secrets returned). */
export async function probeGetSongBpm(): Promise<{
  ok: boolean;
  status: number;
  error: string | null;
}> {
  const { data, error, status } = await apiGet<GetSongBpmSearchResponse>("search", {
    api_key: process.env.GETSONGBPM_API_KEY!.trim(),
    type: "both",
    lookup: buildBothLookup("Closer", "The Chainsmokers"),
    limit: "3",
  });
  if (error) return { ok: false, status, error };
  const { items, error: searchError } = parseSearchItems(data?.search);
  if (searchError) return { ok: false, status, error: searchError };
  if (items.length === 0) {
    return { ok: false, status, error: "API reachable but no test results" };
  }
  return { ok: true, status, error: null };
}
