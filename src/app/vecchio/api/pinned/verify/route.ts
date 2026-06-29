import { NextResponse } from "next/server";
import { isValidSessionCode, normalizeSessionCode } from "@vecchio/lib/session-code";
import { getPartyKitHostFromEnv } from "@vecchio/lib/partykit-host";
import { isValidPin, normalizePin } from "@vecchio/lib/pin";
import { verifySessionPin } from "@vecchio/lib/partykit-http";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const host = getPartyKitHostFromEnv();
  if (!host) {
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });
  }

  const body = (await req.json()) as { code?: string; pin?: string };
  const code = normalizeSessionCode(body.code ?? "");
  const pin = normalizePin(body.pin ?? "");

  if (!isValidSessionCode(code) || !isValidPin(pin)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ok = await verifySessionPin(host, code, pin);
  return NextResponse.json({ ok });
}
