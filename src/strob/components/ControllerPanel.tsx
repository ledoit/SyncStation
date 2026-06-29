"use client";

import { MAX_CPS, MIN_CPS } from "@strob/lib/colors";
import type { SessionState } from "@strob/lib/session-state";
import { ColorPalette } from "./ColorPalette";
import { BpmSearchPanel } from "./BpmSearchPanel";
import { SpotifySyncPanel } from "./SpotifySyncPanel";

type SpotifyProps = {
  configured: boolean;
  connected: boolean;
  syncEnabled: boolean;
  track: {
    name: string;
    artist: string;
    bpm: number | null;
    isPlaying: boolean;
  } | null;
  error: string | null;
  beatMultiplier: number;
  onBeatMultiplierChange: (m: number) => void;
  enableSync: () => void;
  disableSync: () => void;
  logout: () => void;
};

type ControllerPanelProps = {
  sessionCode: string;
  state: SessionState;
  connected: boolean;
  canControl: boolean;
  viewerCount: number;
  onPatch: (patch: Partial<SessionState>) => void;
  onManualCps: (cps: number) => void;
  onApplyBpm: (bpm: number, meta: { title: string; artist: string }) => void;
  viewerUrl: string;
  spotify: SpotifyProps;
};

export function ControllerPanel({
  sessionCode,
  state,
  connected,
  canControl,
  viewerCount,
  onPatch,
  onManualCps,
  onApplyBpm,
  viewerUrl,
  spotify,
}: ControllerPanelProps) {
  const copyViewerLink = async () => {
    await navigator.clipboard.writeText(viewerUrl);
  };

  const cpsLabel = spotify.syncEnabled
    ? `${state.cps.toFixed(2)} / sec (synced)`
    : `${state.cps.toFixed(2)} / sec`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-h-[85vh] max-w-3xl overflow-y-auto p-4">
      <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">Session</p>
            <p className="font-mono text-2xl font-bold tracking-[0.3em] text-zinc-100">
              {sessionCode}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span
              className={`inline-block h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-red-500"}`}
            />
            {!connected
              ? "Connecting…"
              : !canControl
                ? "Claiming session…"
                : `${viewerCount} connected`}
          </div>
        </div>

        <ColorPalette
          colors={state.colors}
          onChange={(colors) => onPatch({ colors })}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label
              htmlFor="cps"
              className="mb-1 block text-sm font-medium text-zinc-300"
            >
              Change color:{" "}
              <span className="text-zinc-100">{cpsLabel}</span>
            </label>
            <input
              id="cps"
              type="range"
              min={MIN_CPS}
              max={MAX_CPS}
              step={0.05}
              value={state.cps}
              onChange={(e) => onManualCps(Number(e.target.value))}
              className="w-full accent-violet-400"
            />
          </div>

          <button
            type="button"
            onClick={() => onPatch({ playing: !state.playing })}
            className={`h-14 min-w-[7rem] rounded-xl px-6 text-lg font-semibold transition ${
              state.playing
                ? "bg-red-500/90 text-white hover:bg-red-500"
                : "bg-emerald-500/90 text-white hover:bg-emerald-500"
            }`}
          >
            {state.playing ? "Turn Off" : "Turn On"}
          </button>
        </div>

        <SpotifySyncPanel
          sessionCode={sessionCode}
          configured={spotify.configured}
          connected={spotify.connected}
          syncEnabled={spotify.syncEnabled}
          track={spotify.track}
          error={spotify.error}
          beatMultiplier={spotify.beatMultiplier}
          onBeatMultiplierChange={spotify.onBeatMultiplierChange}
          onEnableSync={spotify.enableSync}
          onDisableSync={spotify.disableSync}
          onLogout={spotify.logout}
        />

        <BpmSearchPanel
          beatMultiplier={spotify.beatMultiplier}
          onApplyBpm={onApplyBpm}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyViewerLink}
            className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            Copy viewer link
          </button>
          <a
            href={viewerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            Open viewer
          </a>
        </div>
      </div>
    </div>
  );
}
