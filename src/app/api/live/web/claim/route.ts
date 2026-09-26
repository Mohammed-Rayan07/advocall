// POST /api/live/web/claim?role=customer|company&callId=...: "answer" a ringing browser leg (claim-once). Owner: Rayan.
import { NextResponse } from "next/server";
import { claimWebLeg } from "@/lib/voice/orchestrator";
import { publicKey, webGate } from "@/lib/voice/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const blocked = webGate();
  if (blocked) return NextResponse.json({ ok: false, error: blocked }, { status: 400 });
  const url = new URL(req.url);
  const role = url.searchParams.get("role");
  if (role !== "customer" && role !== "company") return NextResponse.json({ ok: false, error: "role must be customer or company" }, { status: 400 });
  const leg = claimWebLeg(role, url.searchParams.get("callId") ?? undefined);
  if (!leg) return NextResponse.json({ ok: false, error: "no ringing call (someone else answered it?)" }, { status: 404 });
  return NextResponse.json({ ok: true, publicKey: publicKey(), callId: leg.callId, leg: leg.leg, caseId: leg.caseId, assistant: leg.assistant });
}
