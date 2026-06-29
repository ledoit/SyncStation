import { NextResponse } from "next/server";
import { getPartyKitHostFromEnv } from "@vecchio/lib/partykit-host";
import { fetchPinnedCodes } from "@vecchio/lib/partykit-http";

export const dynamic = "force-dynamic";

export async function GET() {
  const host = getPartyKitHostFromEnv();
  if (!host) {
    return NextResponse.json({ codes: [] });
  }
  const codes = await fetchPinnedCodes(host);
  return NextResponse.json({ codes });
}
