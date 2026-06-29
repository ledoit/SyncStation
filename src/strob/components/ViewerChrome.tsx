"use client";

import Link from "next/link";
import { useAutoHide } from "@strob/hooks/useAutoHide";
import type { SessionState } from "@strob/lib/session-state";
import { strobPath } from "@strob/lib/paths";

type ViewerChromeProps = {
  sessionCode: string;
  state: SessionState;
  viewerCount: number;
  connected: boolean;
};

export function ViewerChrome({
  sessionCode,
  state,
  viewerCount,
  connected,
}: ViewerChromeProps) {
  const { visible } = useAutoHide(2500);

  return (
    <>
      <div
        className={`pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`fixed bottom-4 left-4 rounded-lg bg-black/40 px-3 py-2 text-sm text-white/80 backdrop-blur ${
            visible ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <div className="font-mono text-lg tracking-widest">{sessionCode}</div>
          <div className="text-xs text-white/60">{viewerCount} connected</div>
          <div className="text-xs text-white/60">
            {state.playing ? `${state.cps} changes/sec` : "Paused"}
          </div>
        </div>
        <p className="fixed bottom-4 right-4 text-xs text-white/40">
          Press F11 for full screen
        </p>
        <Link
          href={strobPath()}
          className={`fixed top-4 left-4 rounded-lg bg-black/50 px-3 py-1.5 text-sm text-white/70 backdrop-blur hover:text-white ${
            visible ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          Leave
        </Link>
        {!connected && (
          <div className="pointer-events-auto fixed top-4 left-1/2 -translate-x-1/2 rounded-lg bg-zinc-900/90 px-4 py-2 text-sm text-zinc-200">
            Connecting to session…
          </div>
        )}
      </div>
    </>
  );
}
