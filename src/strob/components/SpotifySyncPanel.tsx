"use client";

import { formatBpmSource } from "@strob/lib/bpm/resolve";
import type { BpmSource } from "@strob/lib/bpm/types";
import { BPM_MULTIPLIERS } from "@strob/lib/cps";
import { strobPath } from "@strob/lib/paths";

type SpotifySyncPanelProps = {
  sessionCode: string;
  configured: boolean;
  connected: boolean;
  syncEnabled: boolean;
  track: {
    name: string;
    artist: string;
    bpm: number | null;
    bpmSource?: BpmSource | null;
    isPlaying: boolean;
  } | null;
  error: string | null;
  beatMultiplier: number;
  onBeatMultiplierChange: (m: number) => void;
  onEnableSync: () => void;
  onDisableSync: () => void;
  onLogout: () => void;
};

export function SpotifySyncPanel({
  sessionCode,
  configured,
  connected,
  syncEnabled,
  track,
  error,
  beatMultiplier,
  onBeatMultiplierChange,
  onEnableSync,
  onDisableSync,
  onLogout,
}: SpotifySyncPanelProps) {
  const loginHref = `/strob/api/spotify/login?returnTo=${encodeURIComponent(strobPath(`/c/${sessionCode}`))}`;

  if (!configured) {
    return (
      <p className="mt-4 text-xs text-zinc-500">
        Spotify sync is not configured on this deployment.
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-zinc-700/60 bg-zinc-950/80 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-200">Spotify</p>
        {!connected ? (
          <a
            href={loginHref}
            className="rounded-lg bg-[#1db954] px-3 py-1.5 text-sm font-semibold text-black hover:bg-[#1ed760]"
          >
            Connect Spotify
          </a>
        ) : (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            Disconnect
          </button>
        )}
      </div>

      {connected && track && (
        <p className="mt-2 truncate text-xs text-zinc-400">
          {track.name} — {track.artist}
          {track.bpm != null
            ? ` · ${track.bpm} BPM${track.bpmSource ? ` (${formatBpmSource(track.bpmSource)})` : ""}`
            : " · BPM unknown — try BPM search below"}
          {!track.isPlaying ? " (paused)" : ""}
        </p>
      )}

      {connected && (
        <>
          <p className="mt-3 text-xs text-zinc-500">Beat multiplier</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {BPM_MULTIPLIERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onBeatMultiplierChange(value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  beatMultiplier === value
                    ? "bg-violet-600 text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            {!syncEnabled ? (
              <button
                type="button"
                onClick={onEnableSync}
                disabled={!track?.bpm}
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40"
              >
                Sync CPS to beat
              </button>
            ) : (
              <button
                type="button"
                onClick={onDisableSync}
                className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
              >
                Manual CPS (stop sync)
              </button>
            )}
          </div>
          {syncEnabled && (
            <p className="mt-2 text-xs text-emerald-400/90">
              Syncing — move the slider anytime to override manually.
            </p>
          )}
        </>
      )}

      {error && <p className="mt-2 text-xs text-amber-400">{error}</p>}
    </div>
  );
}
