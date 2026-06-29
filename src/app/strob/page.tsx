"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  controllerStorageKey,
  generateControllerToken,
  generateSessionCode,
  isValidSessionCode,
  normalizeSessionCode,
} from "@strob/lib/session-code";
import { strobPath } from "@strob/lib/paths";

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createSession = () => {
    const code = generateSessionCode();
    const token = generateControllerToken();
    sessionStorage.setItem(controllerStorageKey(code), token);
    router.push(strobPath(`/c/${code}`));
  };

  const joinViewer = () => {
    const code = normalizeSessionCode(joinCode);
    if (!isValidSessionCode(code)) {
      setError("Enter a 4-character session code (A–Z, 2–9).");
      return;
    }
    setError(null);
    router.push(strobPath(`/v/${code}`));
  };

  const joinController = () => {
    const code = normalizeSessionCode(joinCode);
    if (!isValidSessionCode(code)) {
      setError("Enter a 4-character session code (A–Z, 2–9).");
      return;
    }
    setError(null);
    router.push(strobPath(`/c/${code}`));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-50">
            Strob
          </h1>
          <p className="mt-2 text-zinc-400">
            Live-synced mood lights for parties. One controller, many viewers.
          </p>
        </div>

        <button
          type="button"
          onClick={createSession}
          className="w-full rounded-xl bg-violet-600 py-3 text-lg font-semibold text-white hover:bg-violet-500"
        >
          Create session (controller)
        </button>

        <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <label htmlFor="code" className="block text-left text-sm text-zinc-400">
            Session code
          </label>
          <input
            id="code"
            value={joinCode}
            onChange={(e) =>
              setJoinCode(normalizeSessionCode(e.target.value))
            }
            maxLength={4}
            placeholder="ABCD"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] text-zinc-100 uppercase outline-none focus:border-violet-500"
          />
          {error && <p className="text-left text-sm text-red-400">{error}</p>}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={joinViewer}
              className="rounded-lg border border-zinc-600 py-2.5 text-sm font-medium text-zinc-100 hover:bg-zinc-800"
            >
              Join as viewer
            </button>
            <button
              type="button"
              onClick={joinController}
              className="rounded-lg border border-zinc-600 py-2.5 text-sm font-medium text-zinc-100 hover:bg-zinc-800"
            >
              Open controller
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
