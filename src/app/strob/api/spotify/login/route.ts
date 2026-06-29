import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SPOTIFY_COOKIE,
  SPOTIFY_SCOPES,
  getSpotifyRedirectUri,
  spotifyConfigured,
} from "@strob/lib/spotify/config";

export async function GET(request: Request) {
  if (!spotifyConfigured()) {
    return NextResponse.json(
      { error: "Spotify is not configured on this server." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get("returnTo") ?? "/";

  const state = randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set(SPOTIFY_COOKIE.state, `${state}|${encodeURIComponent(returnTo)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: "code",
    redirect_uri: getSpotifyRedirectUri(),
    scope: SPOTIFY_SCOPES,
    state,
  });

  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`,
  );
}
