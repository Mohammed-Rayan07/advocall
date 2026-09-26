// GET /api/live/status: is live calling configured? Never returns secret values. Owner: Rayan.
import { NextResponse } from "next/server";
import { readVoiceConfig, webhookUrl } from "@/lib/voice/config";
import { liveCalls } from "@/lib/voice/orchestrator";

export const dynamic = "force-dynamic";

const mask = (p: string) => (p.length > 6 ? `${p.slice(0, 3)}******${p.slice(-4)}` : p);

export async function GET() {
  const { config, missing, ready, mode } = readVoiceConfig();
  return NextResponse.json({
    mode,
    ready,
    missing,
    webhookUrl: config.publicUrl ? webhookUrl(config) : null,
    model: `${config.modelProvider}/${config.model}`,
    defaultLang: config.defaultLang,
    companyPhone: config.companyPhone ? mask(config.companyPhone) : null,
    teamPhones: config.teamPhones.map(mask),
    webhookSecret: config.webhookSecret ? "set" : "not set",
    calls: liveCalls(),
  });
}
