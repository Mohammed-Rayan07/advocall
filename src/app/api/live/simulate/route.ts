// POST /api/live/simulate?scenario=promise|refusal&pace=1: runs the LIVE pipeline with a fake Vapi (no keys, no calls). Owner: Rayan.
import { NextResponse } from "next/server";
import { runSimulation } from "@/lib/voice/server";
import { SIM_SCENARIOS, type SimScenario } from "@/lib/voice/simulate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const scenario = (url.searchParams.get("scenario") ?? "promise") as SimScenario;
  if (!SIM_SCENARIOS.includes(scenario)) {
    return NextResponse.json({ ok: false, error: `unknown scenario "${scenario}"`, available: SIM_SCENARIOS }, { status: 404 });
  }
  const pace = Math.max(0.25, Math.min(20, Number(url.searchParams.get("pace") ?? 1) || 1));
  const { callId } = await runSimulation(scenario, pace);
  return NextResponse.json({ ok: true, scenario, callId });
}
