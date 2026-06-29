"use client";

import { useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "strob-warning-accepted";

export function WarningGate({ children }: { children: ReactNode }) {
  const [accepted, setAccepted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAccepted(sessionStorage.getItem(STORAGE_KEY) === "1");
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="fixed inset-0 bg-black" />;
  }

  if (!accepted) {
    return (
      <MotionlessScreen>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <h2 className="text-3xl font-bold text-zinc-100">Warning</h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-400">
              Before using, make sure you are not sensitive to flashing lights. Do
              not use this application if you, or others around you, have{" "}
              <a
                href="https://en.wikipedia.org/wiki/Photosensitive_epilepsy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-zinc-200"
              >
                photosensitive epilepsy
              </a>
              .
            </p>
            <button
              type="button"
              className="mt-6 float-right rounded-xl bg-zinc-100 px-6 py-2 text-lg font-medium text-zinc-900 hover:bg-white"
              onClick={() => {
                sessionStorage.setItem(STORAGE_KEY, "1");
                setAccepted(true);
              }}
            >
              Ok
            </button>
          </div>
        </div>
      </MotionlessScreen>
    );
  }

  return <>{children}</>;
}

function MotionlessScreen({ children }: { children?: ReactNode }) {
  return <div className="fixed inset-0 bg-black">{children}</div>;
}
