// npm run voice:check : proves the live setup works BEFORE anyone's phone rings. Owner: Rayan.
// 1. .env.local complete   2. Vapi key + phone number valid   3. every assistant config accepted by Vapi
// 4. PUBLIC_URL tunnel reaches THIS app. Prints no secrets.
import type { CaseInput, Lang } from "@/types";
import { buildCallBrief, matchRule } from "@/lib/rules";
import { buildReportScript } from "@/content";
import { todayIST } from "@/lib/core/format";
import { readVoiceConfig, webhookUrl } from "@/lib/voice/config";
import { advocateAssistant, intakeAssistant, reportAssistant, type AdvocallCallMeta } from "@/lib/voice/assistants";
import { listPhoneNumbers, validateAssistant } from "@/lib/voice/vapi";

try {
  process.loadEnvFile(".env.local");
} catch {
  console.log("(no .env.local found; using the current environment)");
}

let failures = 0;
const ok = (m: string) => console.log(`  ✅ ${m}`);
const bad = (m: string) => {
  failures += 1;
  console.log(`  ❌ ${m}`);
};

async function main() {
  const { config, missing, mode } = readVoiceConfig();
  console.log("\n1. Environment");
  if (mode === "live") ok("MODE=live");
  else bad("MODE is not live (set MODE=live in .env.local, then restart npm run dev)");
  if (missing.length === 0) ok("all required keys present");
  else bad(`missing: ${missing.join(", ")}`);
  const { webMissing } = readVoiceConfig();
  if (webMissing.length === 0) ok("browser fallback (/talk) has what it needs (PUBLIC_URL + VAPI_PUBLIC_KEY)");
  else console.log(`  ⚠️  browser fallback (/talk) also needs: ${webMissing.join(", ")}`);
  if (config.webhookSecret) ok("VAPI_WEBHOOK_SECRET set (webhook rejects strangers)");
  else console.log("  ⚠️  VAPI_WEBHOOK_SECRET not set: anyone who finds the tunnel URL can post fake events");
  if (!config.apiKey) return;

  console.log("\n2. Vapi account");
  try {
    const numbers = await listPhoneNumbers(config);
    ok(`API key works (${numbers.length} phone number${numbers.length === 1 ? "" : "s"} in account)`);
    const mine = numbers.find((n) => n.id === config.phoneNumberId);
    if (mine) ok(`VAPI_PHONE_NUMBER_ID found: ${mine.number ?? "?"} (${mine.provider ?? "?"})`);
    else bad(`VAPI_PHONE_NUMBER_ID not in account. Available ids: ${numbers.map((n) => `${n.id} ${n.number ?? ""}`).join(" | ") || "none"}`);
  } catch (e) {
    bad(`Vapi API: ${(e as Error).message}`);
    return;
  }

  console.log("\n3. Assistant configs (created on Vapi, then deleted)");
  const today = todayIST();
  const cfg = { ...config, publicUrl: config.publicUrl || "https://example.com" };
  const input: CaseInput = {
    userName: "Check User",
    userPhone: config.teamPhones[0] ?? "+919800000001",
    language: "hi",
    company: "HDFC Bank",
    category: "upi_failed",
    amountPaise: 450000,
    incidentDate: today,
    txnRef: "UPI4829301",
    description: "UPI debit not credited.",
  };
  const match = matchRule(input, today);
  const meta = (leg: AdvocallCallMeta["leg"], lang: Lang): AdvocallCallMeta => ({ callId: `check_${leg}_${lang}`, leg, caseId: null, lang });
  const c = { ...input, id: "A-CHECK", status: "promised" as const, createdAt: "", updatedAt: "" };
  const k = { caseId: c.id, ticketNo: "CMP88213", promisedBy: today, compensationAck: true, confirmed: true };
  const view = { case: c, match, calls: [], transcript: [], commitment: k, escalation: null, messages: [], timeline: [] };
  const assistants = [
    ...(["hi", "en", "kn"] as Lang[]).map((l) => [`intake (${l})`, intakeAssistant(cfg, meta("intake", l), today, null)] as const),
    ["advocate (en)", advocateAssistant(cfg, meta("advocate", "en"), input, buildCallBrief(input, match), today)] as const,
    ...(["hi", "kn"] as Lang[]).map(
      (l) => [`report (${l})`, reportAssistant(cfg, meta("report", l), c, match, k, buildReportScript(view, l))] as const,
    ),
  ];
  for (const [label, a] of assistants) {
    try {
      await validateAssistant(config, a);
      ok(`${label}: accepted (voice ${a.voice.provider}/${a.voice.voiceId}, stt ${a.transcriber.provider}/${a.transcriber.language})`);
    } catch (e) {
      bad(`${label}: ${(e as Error).message}`);
    }
  }

  console.log("\n4. Tunnel");
  if (!config.publicUrl) {
    bad("PUBLIC_URL empty: run  cloudflared tunnel --url http://localhost:3000  and paste the https URL");
  } else {
    try {
      const r = await fetch(`${config.publicUrl}/api/live/status`, { cache: "no-store" });
      const j = (await r.json()) as { mode?: string };
      if (r.ok && j.mode) ok(`${config.publicUrl} reaches this app (server MODE=${j.mode}); webhook = ${webhookUrl(config)}`);
      else bad(`${config.publicUrl}/api/live/status answered ${r.status}`);
      if (j.mode && j.mode !== "live") bad("the running server is still in mock mode: restart npm run dev after editing .env.local");
    } catch (e) {
      bad(`cannot reach ${config.publicUrl} (${(e as Error).message}). Is npm run dev running and the tunnel up?`);
    }
  }
}

main().then(() => {
  console.log(failures ? `\n${failures} problem(s). Fix them, then run npm run voice:check again.\n` : "\nAll good. Open /dev and press 'call me'.\n");
  process.exit(failures ? 1 : 0);
});
