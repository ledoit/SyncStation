import { NextResponse } from "next/server";
import {
  getAppOrigin,
  getSpotifyRedirectUri,
  spotifyConfigured,
} from "@strob/lib/spotify/config";

/** Public sanity check — no secrets. Use to verify redirect URI before Spotify OAuth. */
export async function GET() {
  return NextResponse.json({
    configured: spotifyConfigured(),
    appOrigin: getAppOrigin(),
    redirectUri: getSpotifyRedirectUri(),
    hint: "Add redirectUri exactly (including https) to Spotify Dashboard → your app → Settings → Redirect URIs",
  });
}
