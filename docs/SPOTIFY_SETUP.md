# Spotify setup (Strob v2)

## Your steps

1. Open [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) → **Create app**.
2. **App name:** Strob (or any name).
3. **Redirect URIs** — add **both** (must match **exactly**, including `https`):
   - `http://localhost:3000/api/spotify/callback`
   - `https://strob.vercel.app/api/spotify/callback`
4. Copy **Client ID** and **Client secret**.
5. Add to `.env.local` (local) and Vercel project env (production):

```env
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

On Vercel, set `NEXT_PUBLIC_APP_URL` to `https://strob.vercel.app` (must use **https**, no trailing slash).

**Verify after deploy:**

- Spotify redirect: `https://strob.vercel.app/api/spotify/config-check`
- BPM API: `https://strob.vercel.app/api/bpm/health` — should show `"ok": true`

Search uses GetSongBPM format `song:Title+artist:Artist` (not plain text). Example query: `Closer Chainsmokers`.

6. Restart `pnpm dev` or redeploy Vercel.
7. On the **controller** page → **Connect Spotify** → approve scopes.
8. Play a track in Spotify (desktop or phone with Spotify Connect).
9. Choose beat multiplier → **Sync CPS to beat**.

## Usage

- **Sync CPS to beat** — polls now-playing every 3s; updates session CPS from BPM × multiplier.
- **Manual slider** — disables sync until you press **Sync CPS to beat** again.
- **Manual CPS (stop sync)** — same as slider override.

## Requirements

- Spotify account (free tier is fine for Web API metadata).
- Something must be **actively playing** on your account (app open, device selected).
- **GETSONGBPM_API_KEY** — Spotify [removed audio-features for new apps](https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api) (403). Strob auto-looks up BPM via [GetSongBPM](https://getsongbpm.com/api) using the song title + artist from now playing.

### GetSongBPM (required for BPM)

1. Register at [getsongbpm.com/api](https://getsongbpm.com/api) (free).
2. Add to `.env.local` and Vercel:

```env
GETSONGBPM_API_KEY=your_key
```

3. Redeploy. Controller shows BPM source as **GetSongBPM** when matched.

**v3 search bar** on the controller uses the same API — search any track and tap a result to apply CPS.

## Redirect URI mismatch?

The callback URL must match **exactly** what is in the Spotify app settings.

Common mistake: app sends `http://strob.vercel.app/...` but Dashboard has `https://...`. Fix Vercel env:

`NEXT_PUBLIC_APP_URL=https://strob.vercel.app`

Then redeploy. Strob now forces `https` on non-localhost hosts even if env uses `http`.

**Logs:** Vercel → Project → Logs (filter `/api/spotify`). Spotify itself does not give detailed errors beyond "Not matching configuration".
