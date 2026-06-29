import Link from "next/link";

const apps = [
  {
    slug: "strob",
    name: "Strob",
    tagline: "Live-synced mood lights for parties",
    description:
      "One controller, many viewers. Color strobe sessions with optional Spotify BPM sync.",
    href: "/strob",
    accent: "border-violet-500/40 bg-violet-950/30 hover:border-violet-400/60",
    titleClass: "text-violet-100",
  },
  {
    slug: "vecchio",
    name: "Vecchio",
    tagline: "Shared text across devices",
    description:
      "Live-synced notes and prompts with a short session code. Pin rooms to keep them on the home page.",
    href: "/vecchio",
    accent: "border-stone-500/40 bg-stone-950/50 hover:border-stone-400/60",
    titleClass: "text-stone-100",
  },
] as const;

export default function SyncStationHome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl space-y-10 text-center">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Menhir Holdings
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
            SyncStation
          </h1>
          <p className="mx-auto max-w-lg text-slate-400">
            Real-time session tools — same apps, one home. Pick Strob or Vecchio
            to start a live session across your devices.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {apps.map((app) => (
            <Link
              key={app.slug}
              href={app.href}
              className={`group rounded-2xl border p-6 text-left transition ${app.accent}`}
            >
              <h2 className={`text-2xl font-bold ${app.titleClass}`}>
                {app.name}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-300">
                {app.tagline}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                {app.description}
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-slate-300 group-hover:text-white">
                Open {app.name} →
              </span>
            </Link>
          ))}
        </div>

        <p className="text-xs text-slate-600">
          syncstation.menhir-holdings.com
        </p>
      </div>
    </main>
  );
}
