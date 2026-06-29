"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { bpmToCps } from "@strob/lib/cps";
import { ControllerPanel } from "@strob/components/ControllerPanel";
import { StrobeCanvas } from "@strob/components/StrobeCanvas";
import { DEFAULT_BEAT_MULTIPLIER } from "@strob/lib/cps";
import {
  controllerStorageKey,
  generateControllerToken,
  isValidSessionCode,
  normalizeSessionCode,
} from "@strob/lib/session-code";
import { getStoredBeatMultiplier } from "@strob/lib/spotify/client-storage";
import {
  notifyManualCpsOverride,
  useSpotifySync,
} from "@strob/hooks/useSpotifySync";
import { useSessionParty } from "@strob/hooks/useSessionParty";
import { strobPath, strobViewerUrl } from "@strob/lib/paths";

export default function ControllerPage() {
  const params = useParams();
  const code = normalizeSessionCode(String(params.code ?? ""));
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [beatMultiplier, setBeatMultiplier] = useState(DEFAULT_BEAT_MULTIPLIER);
  const appliedBpmRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isValidSessionCode(code)) return;
    let stored = sessionStorage.getItem(controllerStorageKey(code));
    if (!stored) {
      stored = generateControllerToken();
      sessionStorage.setItem(controllerStorageKey(code), stored);
    }
    setToken(stored);
    setBeatMultiplier(getStoredBeatMultiplier());
  }, [code]);

  const viewerUrl = useMemo(() => strobViewerUrl(code), [code]);

  const { state, viewerCount, connected, canControl, patch } = useSessionParty({
    room: code,
    controllerToken: token,
    onError: setAuthError,
  });

  const onCpsFromBpm = useCallback(
    (cps: number) => {
      if (canControl) patch({ cps });
    },
    [canControl, patch],
  );

  const spotify = useSpotifySync({
    enabled: true,
    canControl,
    beatMultiplier,
    onCpsFromBpm,
  });

  const handleManualCps = useCallback(
    (cps: number) => {
      notifyManualCpsOverride();
      spotify.disableSync();
      patch({ cps });
    },
    [patch, spotify],
  );

  const handleBeatMultiplier = useCallback(
    (m: number) => {
      setBeatMultiplier(m);
      spotify.setBeatMultiplier(m);
      if (appliedBpmRef.current != null && canControl) {
        patch({ cps: bpmToCps(appliedBpmRef.current, m) });
      }
    },
    [spotify, canControl, patch],
  );

  const handleApplyBpm = useCallback(
    (bpm: number) => {
      appliedBpmRef.current = bpm;
      notifyManualCpsOverride();
      spotify.disableSync();
      if (canControl) patch({ cps: bpmToCps(bpm, beatMultiplier) });
    },
    [beatMultiplier, canControl, patch, spotify],
  );

  if (!isValidSessionCode(code)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-zinc-300">
        <div className="text-center">
          <p>Invalid session code.</p>
          <Link href={strobPath()} className="mt-4 inline-block text-violet-400 underline">
            Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <StrobeCanvas state={state} />
      {authError && (
        <div className="fixed top-4 left-1/2 z-30 -translate-x-1/2 rounded-lg bg-red-900/90 px-4 py-2 text-sm text-red-100">
          {authError}
        </div>
      )}
      <ControllerPanel
        sessionCode={code}
        state={state}
        connected={connected}
        canControl={canControl}
        viewerCount={viewerCount}
        onPatch={patch}
        onManualCps={handleManualCps}
        onApplyBpm={handleApplyBpm}
        viewerUrl={viewerUrl}
        spotify={{
          ...spotify,
          beatMultiplier,
          onBeatMultiplierChange: handleBeatMultiplier,
        }}
      />
      <Link
        href={strobPath()}
        className="fixed top-4 left-4 z-30 rounded-lg bg-black/50 px-3 py-1.5 text-sm text-white/70 backdrop-blur hover:text-white"
      >
        Strob
      </Link>
    </>
  );
}
