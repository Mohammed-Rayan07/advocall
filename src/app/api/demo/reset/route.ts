// POST /api/demo/reset — clears all events (and forgets live calls). Owner: Rayan (LOCKED).
import { NextResponse } from "next/server";
import { resetBus } from "@/lib/core/bus";
import { resetLive } from "@/lib/voice/orchestrator";

export const dynamic = "force-dynamic";

export async function POST() {
  resetBus();
  resetLive();
  return NextResponse.json({ ok: true });
}
