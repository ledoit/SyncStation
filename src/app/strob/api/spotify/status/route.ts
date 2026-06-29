import { NextResponse } from "next/server";
import { spotifyConfigured } from "@strob/lib/spotify/config";
import {
  fetchNowPlayingTrack,
  getValidAccessToken,
} from "@strob/lib/spotify/server";

export async function GET() {
  if (!spotifyConfigured()) {
    return NextResponse.json({ configured: false, connected: false });
  }

  const access = await getValidAccessToken();
  if (!access) {
    return NextResponse.json({ configured: true, connected: false });
  }

  const track = await fetchNowPlayingTrack();
  return NextResponse.json({
    configured: true,
    connected: true,
    track,
  });
}
