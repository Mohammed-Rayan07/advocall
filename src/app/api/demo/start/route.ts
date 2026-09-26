// POST /api/demo/start?script=upi&speed=1  — plays a mock demo script. Owner: Rayan (LOCKED).
import { NextResponse } from "next/server";
import { playScript } from "@/lib/core/player";
import { DEMO_SCRIPTS } from "@/mock/scripts";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("script") ?? DEMO_SCRIPTS[0]?.id;
  const speed = Math.max(0.25, Math.min(20, Number(url.searchParams.get("speed") ?? 1) || 1));
  const script = DEMO_SCRIPTS.find((s) => s.id === id);
  if (!script) {
    return NextResponse.json({ ok: false, error: `unknown script "${id}"`, available: DEMO_SCRIPTS.map((s) => s.id) }, { status: 404 });
  }
  const durationMs = playScript(script, speed);
  return NextResponse.json({ ok: true, script: script.id, steps: script.steps.length, durationMs });
}

export async function GET() {
  return NextResponse.json(DEMO_SCRIPTS.map((s) => ({ id: s.id, title: s.title, description: s.description, steps: s.steps.length })));
}
