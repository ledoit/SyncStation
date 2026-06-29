"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import usePartySocket from "partysocket/react";
import { getPartyKitHost } from "@strob/lib/partykit-host";
import {
  applyPatch,
  type ClientMessage,
  type ServerMessage,
  type SessionState,
  createInitialState,
} from "@strob/lib/session-state";

type UseSessionPartyOptions = {
  room: string;
  controllerToken?: string | null;
  onClaimed?: () => void;
  onError?: (message: string) => void;
};

export function useSessionParty({
  room,
  controllerToken,
  onClaimed,
  onError,
}: UseSessionPartyOptions) {
  const [state, setState] = useState<SessionState>(createInitialState);
  const [viewerCount, setViewerCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [canControl, setCanControl] = useState(false);
  const claimedRef = useRef(false);
  const tokenRef = useRef(controllerToken);
  const pendingPatches = useRef<Partial<SessionState>[]>([]);

  useEffect(() => {
    tokenRef.current = controllerToken;
    claimedRef.current = false;
    setCanControl(false);
    pendingPatches.current = [];
  }, [controllerToken, room]);

  const flushPatches = useCallback(
    (socket: { send: (data: string) => void }) => {
      if (!tokenRef.current || !claimedRef.current) return;
      for (const partial of pendingPatches.current) {
        const msg: ClientMessage = {
          type: "patch",
          token: tokenRef.current,
          state: partial,
        };
        socket.send(JSON.stringify(msg));
      }
      pendingPatches.current = [];
    },
    [],
  );

  const socket = usePartySocket({
    host: getPartyKitHost(),
    room: room.toUpperCase(),
    onOpen() {
      setConnected(true);
    },
    onClose() {
      setConnected(false);
      setCanControl(false);
      claimedRef.current = false;
    },
    onMessage(evt) {
      const data = JSON.parse(evt.data) as ServerMessage;
      if (data.type === "sync") {
        setState(data.state);
        setViewerCount(data.viewerCount);
      } else if (data.type === "claimed") {
        claimedRef.current = true;
        setCanControl(true);
        onClaimed?.();
        flushPatches(socket);
      } else if (data.type === "error") {
        onError?.(data.message);
      }
    },
  });

  useEffect(() => {
    if (!connected || !tokenRef.current || claimedRef.current) return;
    const msg: ClientMessage = { type: "claim", token: tokenRef.current };
    socket.send(JSON.stringify(msg));
  }, [connected, socket]);

  const patch = useCallback(
    (partial: Partial<SessionState>) => {
      if (!tokenRef.current) return;
      setState((prev) => applyPatch(prev, partial));
      if (!claimedRef.current) {
        pendingPatches.current.push(partial);
        return;
      }
      const msg: ClientMessage = {
        type: "patch",
        token: tokenRef.current,
        state: partial,
      };
      socket.send(JSON.stringify(msg));
    },
    [socket],
  );

  return { state, viewerCount, connected, canControl, patch, socket };
}
