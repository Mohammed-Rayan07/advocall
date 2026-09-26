// POST /api/vapi/webhook: every Vapi server message (status, transcript, tool calls, end-of-call). Owner: Rayan.
import { after, NextResponse } from "next/server";
import { WEBHOOK_SECRET_HEADER } from "@/lib/voice/assistants";
import { readVoiceConfig } from "@/lib/voice/config";
import { handleVapiWebhook } from "@/lib/voice/orchestrator";
import { liveDeps } from "@/lib/voice/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { config, mode } = readVoiceConfig();
  // In mock mode (the stage demo) nobody outside can inject events through the public tunnel.
  if (mode !== "live") return NextResponse.json({ error: "live mode is off (MODE=mock)" }, { status: 403 });
  if (config.webhookSecret && req.headers.get(WEBHOOK_SECRET_HEADER) !== config.webhookSecret) {
    return NextResponse.json({ error: "bad secret" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  // Next leg dials run after the response, so Vapi never waits on another Vapi call.
  const result = await handleVapiWebhook(liveDeps((task) => after(task)), body);
  return NextResponse.json(result.body, { status: result.status });
}
