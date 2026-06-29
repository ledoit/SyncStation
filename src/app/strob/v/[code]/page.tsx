"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { StrobeCanvas } from "@strob/components/StrobeCanvas";
import { ViewerChrome } from "@strob/components/ViewerChrome";
import { useSessionParty } from "@strob/hooks/useSessionParty";
import { isValidSessionCode, normalizeSessionCode } from "@strob/lib/session-code";
import { strobPath } from "@strob/lib/paths";

export default function ViewerPage() {
  const params = useParams();
  const code = normalizeSessionCode(String(params.code ?? ""));

  const { state, viewerCount, connected } = useSessionParty({
    room: code,
  });

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
      <ViewerChrome
        sessionCode={code}
        state={state}
        viewerCount={viewerCount}
        connected={connected}
      />
    </>
  );
}
