// GET /api/live/web/pending?role=customer|company: browser legs that are "ringing" (not claimed). Owner: Rayan.
import { NextResponse } from "next/server";
import { peekWebLegs, type WebRole } from "@/lib/voice/orchestrator";
import { webGate } from "@/lib/voice/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const blocked = webGate();
  if (blocked) return NextResponse.json({ ok: false, error: blocked, legs: [] }); // 200: the /talk page polls this
  const role = new URL(req.url).searchParams.get("role");
  if (role !== "customer" && role !== "company") return NextResponse.json({ ok: false, error: "role must be customer or company", legs: [] }, { status: 400 });
  return NextResponse.json({ ok: true, legs: peekWebLegs(role satisfies WebRole) });
}
