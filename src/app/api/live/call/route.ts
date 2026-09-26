// POST /api/live/call  { phone, name?, lang? }: Advocall phones the user for the intake call. Owner: Rayan.
import { NextResponse } from "next/server";
import type { Lang } from "@/types";
import { readVoiceConfig } from "@/lib/voice/config";
import { LiveCallError, startIntakeCall } from "@/lib/voice/orchestrator";
import { liveDeps } from "@/lib/voice/server";
import { VapiError } from "@/lib/voice/vapi";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { ready, missing } = readVoiceConfig();
  if (!ready) {
    return NextResponse.json({ ok: false, error: `Live calls need these in .env.local: ${missing.join(", ")}` }, { status: 400 });
  }
  const body = (await req.json().catch(() => ({}))) as { phone?: unknown; name?: unknown; lang?: unknown };
  const lang: Lang | undefined = body.lang === "hi" || body.lang === "en" || body.lang === "kn" ? body.lang : undefined;
  try {
    const r = await startIntakeCall(liveDeps(), {
      phone: typeof body.phone === "string" ? body.phone : "",
      name: typeof body.name === "string" ? body.name : null,
      lang,
    });
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    if (e instanceof LiveCallError) return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    if (e instanceof VapiError) return NextResponse.json({ ok: false, error: e.message }, { status: 502 });
    throw e;
  }
}
