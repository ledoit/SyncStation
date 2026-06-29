import { NextResponse } from "next/server";
import { getsongbpmConfigured, probeGetSongBpm } from "@strob/lib/bpm/getsongbpm";

export async function GET() {
  const configured = getsongbpmConfigured();
  if (!configured) {
    return NextResponse.json({
      configured: false,
      ok: false,
      message: "GETSONGBPM_API_KEY is not set on this deployment.",
    });
  }

  const probe = await probeGetSongBpm();
  return NextResponse.json({
    configured: true,
    ok: probe.ok,
    httpStatus: probe.status,
    error: probe.error,
    lookupFormat: "song:Title+artist:Name (GetSongBPM both-search)",
  });
}
