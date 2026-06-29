import { NextResponse } from "next/server";
import { spotifyConfigured } from "@strob/lib/spotify/config";
import {
  fetchNowPlayingTrack,
  getValidAccessToken,
} from "@strob/lib/spotify/server";

export async function GET() {
  if (!spotifyConfigured()) {
    return NextResponse.json(
      { error: "Spotify not configured" },
      { status: 503 },
    );
  }

  const access = await getValidAccessToken();
  if (!access) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  const track = await fetchNowPlayingTrack();
  return NextResponse.json({ connected: true, track });
}
