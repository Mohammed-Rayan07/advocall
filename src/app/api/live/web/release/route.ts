// POST /api/live/web/release?callId=...: the browser failed to start an answered leg; make it ring again. Owner: Rayan.
import { NextResponse } from "next/server";
import { releaseWebLeg } from "@/lib/voice/orchestrator";
import { webGate } from "@/lib/voice/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const blocked = webGate();
  if (blocked) return NextResponse.json({ ok: false, error: blocked }, { status: 400 });
  const callId = new URL(req.url).searchParams.get("callId") ?? "";
  return NextResponse.json({ ok: releaseWebLeg(callId) });
}
