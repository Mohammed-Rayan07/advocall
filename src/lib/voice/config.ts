// Live-voice configuration from env. SERVER ONLY. Owner: Rayan.
// Never log or return the secret values; only which keys are missing.
import type { Lang } from "@/types";

export interface VoiceConfig {
  apiKey: string;
  publicKey: string; // Vapi public key (safe for the browser; web-call fallback)
  phoneNumberId: string; // Twilio number imported into Vapi
  publicUrl: string; // https tunnel URL, no trailing slash
  companyPhone: string; // teammate who plays "the bank"
  teamPhones: string[]; // allowlist: we only ever dial these numbers
  webhookSecret: string; // optional: checked on every webhook if set
  modelProvider: string;
  model: string;
  defaultLang: Lang;
}

export interface VoiceConfigResult {
  config: VoiceConfig;
  missing: string[]; // env names still empty (live calls refuse to start until this is [])
  ready: boolean;
  webMissing: string[]; // browser-call fallback needs far less: no Twilio, no phones
  webReady: boolean;
  mode: "mock" | "live";
}

/** "98765 43210" / "919876543210" / "+91 98765-43210" -> "+919876543210". Returns "" if unusable. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (/^\+\d{10,15}$/.test(digits)) return digits;
  const d = digits.replace(/\+/g, "");
  if (/^\d{10}$/.test(d)) return `+91${d}`;
  if (/^91\d{10}$/.test(d)) return `+${d}`;
  return "";
}

function asLang(v: string | undefined): Lang {
  return v === "en" || v === "kn" || v === "hi" ? v : "hi";
}

export function readVoiceConfig(env: Record<string, string | undefined> = process.env): VoiceConfigResult {
  const s = (k: string) => (env[k] ?? "").trim();
  const companyPhone = normalizePhone(s("DEMO_COMPANY_PHONE"));
  const teamPhones = s("TEAM_PHONES")
    .split(",")
    .map((p) => normalizePhone(p))
    .filter(Boolean);
  if (companyPhone && !teamPhones.includes(companyPhone)) teamPhones.push(companyPhone);

  const config: VoiceConfig = {
    apiKey: s("VAPI_API_KEY"),
    publicKey: s("VAPI_PUBLIC_KEY"),
    phoneNumberId: s("VAPI_PHONE_NUMBER_ID"),
    publicUrl: s("PUBLIC_URL").replace(/\/+$/, ""),
    companyPhone,
    teamPhones,
    webhookSecret: s("VAPI_WEBHOOK_SECRET"),
    modelProvider: s("VAPI_MODEL_PROVIDER") || "openai",
    model: s("VAPI_MODEL") || "gpt-4o",
    defaultLang: asLang(s("DEFAULT_LANG") || undefined),
  };

  const missing: string[] = [];
  if (!config.apiKey) missing.push("VAPI_API_KEY");
  if (!config.phoneNumberId) missing.push("VAPI_PHONE_NUMBER_ID");
  if (!/^https:\/\//.test(config.publicUrl)) missing.push("PUBLIC_URL");
  if (!config.companyPhone) missing.push("DEMO_COMPANY_PHONE");
  if (config.teamPhones.length < 2) missing.push("TEAM_PHONES");

  const webMissing: string[] = [];
  if (!config.publicKey) webMissing.push("VAPI_PUBLIC_KEY");
  if (!/^https:\/\//.test(config.publicUrl)) webMissing.push("PUBLIC_URL");

  return {
    config,
    missing,
    ready: missing.length === 0,
    webMissing,
    webReady: webMissing.length === 0,
    mode: s("MODE") === "live" ? "live" : "mock",
  };
}

export function webhookUrl(config: VoiceConfig): string {
  return `${config.publicUrl}/api/vapi/webhook`;
}
