# Menhir SyncStation

Unified home for **Strob** (live mood lights) and **Vecchio** (shared text). Each app keeps its original styling and behavior under `/strob` and `/vecchio`.

## URLs

| Environment | URL |
|-------------|-----|
| **Production (canonical)** | https://syncstation.menhir-holdings.com |
| Vercel (current prod alias) | https://syncstation-blond.vercel.app |
| Vercel fallbacks (add in dashboard if available) | `syncstation.vercel.app`, `menhir-syncstation.vercel.app`, `menhirsyncstation.vercel.app` |
| Strob | `/strob` |
| Vecchio | `/vecchio` |

Legacy standalone deploys (`strob.vercel.app`, `vecchi.vercel.app`) redirect here when greenlit — see [Archive policy](../../Monetization/monetization.md).

## Dev

```bash
cd "Menhir Holdings/Website/SyncStation"
pnpm install   # or npm install
cp .env.example .env.local
pnpm dev:next  # Next.js on :3000
```

PartyKit (run in separate terminals when testing realtime):

```bash
pnpm dev:party:strob    # Strob sessions
pnpm dev:party:vecchio  # Vecchio sessions + pinned registry
```

## Deploy

```bash
pnpm vercel:prod
pnpm party:deploy   # both PartyKit workers
```

Set on Vercel:

- `NEXT_PUBLIC_STROB_PARTYKIT_HOST=strob-party.ledoit.partykit.dev`
- `NEXT_PUBLIC_VECCHIO_PARTYKIT_HOST=vecchio-party.ledoit.partykit.dev`
- `NEXT_PUBLIC_APP_URL=https://syncstation.menhir-holdings.com`
- Spotify redirect: `https://syncstation.menhir-holdings.com/strob/api/spotify/callback`

See [docs/DNS.md](docs/DNS.md) for Cloudflare + custom domain setup.
