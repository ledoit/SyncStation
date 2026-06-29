import { NextResponse } from "next/server";
import { searchGetSongBpm, getsongbpmConfigured } from "@strob/lib/bpm/getsongbpm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ error: "Missing q parameter" }, { status: 400 });
  }

  if (!getsongbpmConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        results: [],
        message:
          "Add GETSONGBPM_API_KEY to enable BPM search (free at getsongbpm.com/api).",
      },
      { status: 503 },
    );
  }

  const { results, error } = await searchGetSongBpm(q);
  return NextResponse.json({
    configured: true,
    results,
    error,
    hint: error
      ? "Check GETSONGBPM_API_KEY on Vercel and redeploy. See /api/bpm/health"
      : undefined,
  });
}
