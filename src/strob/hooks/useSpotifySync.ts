"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { bpmToCps } from "@strob/lib/cps";
import {
  getStoredBeatMultiplier,
  isSpotifySyncEnabled,
  setSpotifySyncEnabled,
  setStoredBeatMultiplier,
} from "@strob/lib/spotify/client-storage";

type TrackPayload = {
  trackId: string;
  name: string;
  artist: string;
  bpm: number | null;
  bpmSource?: string | null;
  isPlaying: boolean;
};

type UseSpotifySyncOptions = {
  enabled: boolean;
  canControl: boolean;
  beatMultiplier: number;
  onCpsFromBpm: (cps: number) => void;
};

export function useSpotifySync({
  enabled,
  canControl,
  beatMultiplier,
  onCpsFromBpm,
}: UseSpotifySyncOptions) {
  const [connected, setConnected] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [track, setTrack] = useState<TrackPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastTrackId = useRef<string | null>(null);
  const lastBpm = useRef<number | null>(null);

  useEffect(() => {
    setSyncEnabled(isSpotifySyncEnabled());
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch("/strob/api/spotify/status");
      const data = await res.json();
      setConfigured(data.configured !== false);
      setConnected(Boolean(data.connected));
      if (data.track) setTrack(data.track);
    } catch {
      setError("Could not reach Spotify status.");
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refreshStatus();
  }, [enabled, refreshStatus]);

  useEffect(() => {
    if (!enabled || !syncEnabled || !canControl) return;

    const poll = async () => {
      try {
        const res = await fetch("/strob/api/spotify/now-playing");
        if (res.status === 401) {
          setConnected(false);
          setSyncEnabled(false);
          setSpotifySyncEnabled(false);
          return;
        }
        const data = await res.json();
        if (!data.track) {
          setTrack(null);
          return;
        }
        setTrack(data.track);
        setError(null);

        const { trackId, bpm, isPlaying } = data.track as TrackPayload;
        if (!isPlaying || bpm == null) return;

        const trackChanged = trackId !== lastTrackId.current;
        const bpmChanged = bpm !== lastBpm.current;
        if (trackChanged || bpmChanged) {
          lastTrackId.current = trackId;
          lastBpm.current = bpm;
          const cps = bpmToCps(bpm, beatMultiplier);
          onCpsFromBpm(cps);
        }
      } catch {
        setError("Spotify poll failed.");
      }
    };

    poll();
    const id = window.setInterval(poll, 3000);
    return () => window.clearInterval(id);
  }, [enabled, syncEnabled, canControl, beatMultiplier, onCpsFromBpm]);

  const enableSync = useCallback(() => {
    setSpotifySyncEnabled(true);
    setSyncEnabled(true);
    lastTrackId.current = null;
    lastBpm.current = null;
  }, []);

  const disableSync = useCallback(() => {
    setSpotifySyncEnabled(false);
    setSyncEnabled(false);
  }, []);

  const setBeatMultiplier = useCallback((multiplier: number) => {
    setStoredBeatMultiplier(multiplier);
    if (lastBpm.current != null && syncEnabled) {
      onCpsFromBpm(bpmToCps(lastBpm.current, multiplier));
    }
  }, [syncEnabled, onCpsFromBpm]);

  const logout = useCallback(async () => {
    await fetch("/strob/api/spotify/logout", { method: "POST" });
    setConnected(false);
    setTrack(null);
    disableSync();
    lastTrackId.current = null;
    lastBpm.current = null;
  }, [disableSync]);

  return {
    configured,
    connected,
    syncEnabled,
    track,
    error,
    enableSync,
    disableSync,
    setBeatMultiplier,
    logout,
    refreshStatus,
  };
}

export function notifyManualCpsOverride() {
  setSpotifySyncEnabled(false);
}

export { getStoredBeatMultiplier, setStoredBeatMultiplier };
