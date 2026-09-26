// POST /api/live/web/intake { name?, lang? }: start an intake talked in the browser (/talk). Owner: Rayan.
import { NextResponse } from "next/server";
import type { Lang } from "@/types";
import { startWebIntake } from "@/lib/voice/orchestrator";
import { liveDeps, publicKey, webGate } from "@/lib/voice/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const blocked = webGate();
  if (blocked) return NextResponse.json({ ok: false, error: blocked }, { status: 400 });
  const body = (await req.json().catch(() => ({}))) as { name?: unknown; lang?: unknown };
  const lang: Lang | undefined = body.lang === "hi" || body.lang === "en" || body.lang === "kn" ? body.lang : undefined;
  const { callId, assistant } = startWebIntake(liveDeps(), { name: typeof body.name === "string" ? body.name : null, lang });
  return NextResponse.json({ ok: true, publicKey: publicKey(), callId, assistant });
}
