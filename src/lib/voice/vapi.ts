// Minimal Vapi REST client (plain fetch, no SDK). SERVER ONLY. Owner: Rayan.
// The ONLY file in the app that talks to the Vapi network API.
import type { VoiceConfig } from "./config";
import type { VapiAssistant } from "./assistants";

const API = "https://api.vapi.ai";

export class VapiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: string,
  ) {
    super(message);
  }
}

async function vapi<T>(cfg: Pick<VoiceConfig, "apiKey">, method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new VapiError(`Vapi ${method} ${path} -> ${res.status}: ${text.slice(0, 500)}`, res.status, text);
  return (text ? JSON.parse(text) : {}) as T;
}

/** Outbound phone call with an inline assistant. Returns Vapi's call id. */
export async function createPhoneCall(
  cfg: VoiceConfig,
  opts: { to: string; customerName?: string; assistant: VapiAssistant },
): Promise<{ id: string }> {
  const customer: { number: string; name?: string } = { number: opts.to };
  if (opts.customerName) customer.name = opts.customerName.slice(0, 40);
  const call = await vapi<{ id: string }>(cfg, "POST", "/call", {
    phoneNumberId: cfg.phoneNumberId,
    customer,
    assistant: opts.assistant,
  });
  return { id: call.id };
}

/** Used by scripts/vapi-check.ts: proves an assistant config is valid, then deletes it. */
export async function validateAssistant(cfg: VoiceConfig, assistant: VapiAssistant): Promise<void> {
  const created = await vapi<{ id: string }>(cfg, "POST", "/assistant", assistant);
  await vapi(cfg, "DELETE", `/assistant/${created.id}`);
}

export async function listPhoneNumbers(cfg: VoiceConfig): Promise<{ id: string; number?: string; provider?: string }[]> {
  return vapi(cfg, "GET", "/phone-number");
}
