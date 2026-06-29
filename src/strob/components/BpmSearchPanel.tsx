"use client";

import { useState } from "react";
import type { BpmSearchResult } from "@strob/lib/bpm/types";

type BpmSearchPanelProps = {
  beatMultiplier: number;
  onApplyBpm: (bpm: number, meta: { title: string; artist: string }) => void;
};

export function BpmSearchPanel({
  beatMultiplier,
  onApplyBpm,
}: BpmSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BpmSearchResult[]>([]);
  const [configured, setConfigured] = useState(true);

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/strob/api/bpm/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        setConfigured(data.configured !== false);
        setError(data.message ?? "Search failed");
        setResults([]);
        return;
      }
      setConfigured(true);
      setResults(data.results ?? []);
      if (data.error) {
        setError(String(data.error));
      } else if ((data.results ?? []).length === 0) {
        setError('No matches — try "Closer Chainsmokers" or "Closer - The Chainsmokers".');
      }
    } catch {
      setError("Search request failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!configured) {
    return (
      <div className="mt-4 rounded-xl border border-zinc-700/60 bg-zinc-950/80 p-3">
        <p className="text-sm font-medium text-zinc-200">BPM search · v3</p>
        <p className="mt-2 text-xs text-amber-400/90">
          Add GETSONGBPM_API_KEY on the server (free at getsongbpm.com/api).
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-zinc-700/60 bg-zinc-950/80 p-3">
      <p className="text-sm font-medium text-zinc-200">BPM search · v3</p>
      <p className="mt-1 text-xs text-zinc-500">
        Lookup tempo by song name — also used automatically when Spotify has no
        BPM.
      </p>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="e.g. Closer Chainsmokers"
          className="min-w-0 flex-1 rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500"
        />
        <button
          type="button"
          onClick={search}
          disabled={loading || !query.trim()}
          className="rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-600 disabled:opacity-40"
        >
          {loading ? "…" : "Search"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-amber-400/90">{error}</p>}
      {results.length > 0 && (
        <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                disabled={r.bpm == null}
                onClick={() =>
                  r.bpm != null &&
                  onApplyBpm(r.bpm, { title: r.title, artist: r.artist })
                }
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-zinc-800 disabled:opacity-40"
              >
                <span className="truncate text-zinc-200">
                  {r.title}
                  <span className="text-zinc-500"> — {r.artist}</span>
                </span>
                <span className="shrink-0 text-zinc-400">
                  {r.bpm != null ? `${r.bpm} BPM` : "—"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[10px] text-zinc-600">
        BPM data via{" "}
        <a
          href="https://getsongbpm.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-zinc-400"
        >
          GetSongBPM
        </a>
        . Applies CPS using your {beatMultiplier}× beat multiplier.
      </p>
    </div>
  );
}
