// Builds the transient (inline) Vapi assistants for each call leg. Owner: Rayan.
// Inline assistants = prompts live in git, no dashboard setup, and every call carries
// its own metadata (callId/leg/caseId) so webhooks can be routed even before POST /call returns.
import type { AdvocateState, CallLeg, CaseInput, Commitment, Lang, RuleMatch } from "@/types";
import { ADVOCATE_STATES } from "@/types";
import type { CallBrief } from "@/lib/rules";
import type { VoiceConfig } from "./config";
import { webhookUrl } from "./config";
import { VOICES, type VapiTranscriber, type VapiVoice } from "./voices";
import { advocateSystemPrompt, intakeGreeting, intakeSystemPrompt, reportSystemPrompt } from "./prompts";

export interface AdvocallCallMeta {
  callId: string; // our id, e.g. "call_live_3"
  leg: CallLeg;
  caseId: string | null; // null during intake until create_case succeeds
  lang: Lang;
}

export interface VapiFunctionTool {
  type: "function";
  async?: boolean;
  function: {
    name: string;
    description: string;
    parameters: { type: "object"; properties: Record<string, unknown>; required: string[] };
  };
}

export type VapiTool = VapiFunctionTool | { type: "endCall" } | { type: "dtmf" };

export interface VapiAssistant {
  name: string;
  firstMessage?: string;
  firstMessageMode: "assistant-speaks-first" | "assistant-waits-for-user";
  model: {
    provider: string;
    model: string;
    temperature: number;
    messages: { role: "system"; content: string }[];
    tools: VapiTool[];
  };
  voice: VapiVoice;
  transcriber: VapiTranscriber;
  server: { url: string; headers?: Record<string, string> };
  serverMessages: string[];
  maxDurationSeconds: number;
  metadata: { advocall: AdvocallCallMeta };
}

export const WEBHOOK_SECRET_HEADER = "x-advocall-secret";
const SERVER_MESSAGES = ["status-update", "transcript", "tool-calls", "end-of-call-report"];

// ------------------------------------------------------------------ tools

export const CREATE_CASE_TOOL: VapiFunctionTool = {
  type: "function",
  function: {
    name: "create_case",
    description: "Save the customer's complaint after they confirmed the read-back. Returns the case id and what to tell the customer.",
    parameters: {
      type: "object",
      properties: {
        user_name: { type: "string", description: "Customer's full name" },
        company: { type: "string", description: "Company name, e.g. HDFC Bank, Flipkart, Airtel" },
        category: { type: "string", enum: ["upi_failed", "ecom_refund", "telecom_billing", "other"] },
        amount_rupees: { type: "number", description: "Amount in rupees, e.g. 4500" },
        incident_date: { type: "string", description: "Date it happened, YYYY-MM-DD, not in the future" },
        txn_ref: { type: "string", description: "UPI reference / order ID / bill number. Empty string if none." },
        description: { type: "string", description: "The problem in one or two simple English sentences" },
      },
      required: ["user_name", "company", "category", "amount_rupees", "incident_date", "description"],
    },
  },
};

export const SET_CALL_STATE_TOOL: VapiFunctionTool = {
  type: "function",
  async: true, // fire-and-forget: never makes the agent pause
  function: {
    name: "set_call_state",
    description: "Report which step of the call you are in now. Call it every time the step changes.",
    parameters: {
      type: "object",
      properties: { state: { type: "string", enum: [...ADVOCATE_STATES] satisfies AdvocateState[] } },
      required: ["state"],
    },
  },
};

export const RECORD_COMMITMENT_TOOL: VapiFunctionTool = {
  type: "function",
  function: {
    name: "record_commitment",
    description: "Save the complaint/ticket number and resolution date AFTER the company confirmed your read-back.",
    parameters: {
      type: "object",
      properties: {
        ticket_no: { type: "string", description: "Complaint / ticket / docket number exactly as confirmed" },
        promised_by: { type: "string", description: "Resolution date YYYY-MM-DD, or empty string if they gave none" },
        compensation_ack: { type: "boolean", description: "Did they acknowledge the compensation / delay charge?" },
        confirmed: { type: "boolean", description: "Did they confirm your read-back?" },
      },
      required: ["ticket_no", "promised_by", "compensation_ack", "confirmed"],
    },
  },
};

// ------------------------------------------------------------------ assistants

function base(
  cfg: VoiceConfig,
  meta: AdvocallCallMeta,
  voiceLang: Lang,
  systemPrompt: string,
  tools: VapiTool[],
): Omit<VapiAssistant, "name" | "firstMessage" | "firstMessageMode" | "maxDurationSeconds"> {
  const server: VapiAssistant["server"] = { url: webhookUrl(cfg) };
  if (cfg.webhookSecret) server.headers = { [WEBHOOK_SECRET_HEADER]: cfg.webhookSecret };
  return {
    model: {
      provider: cfg.modelProvider,
      model: cfg.model,
      temperature: 0.3,
      messages: [{ role: "system", content: systemPrompt }],
      tools,
    },
    voice: VOICES[voiceLang].voice,
    transcriber: VOICES[voiceLang].transcriber,
    server,
    serverMessages: SERVER_MESSAGES,
    metadata: { advocall: meta },
  };
}

export function intakeAssistant(cfg: VoiceConfig, meta: AdvocallCallMeta, today: string, knownName: string | null): VapiAssistant {
  return {
    name: "advocall-intake",
    firstMessage: intakeGreeting(meta.lang, knownName),
    firstMessageMode: "assistant-speaks-first",
    maxDurationSeconds: 420,
    ...base(cfg, meta, meta.lang, intakeSystemPrompt(meta.lang, today, knownName), [CREATE_CASE_TOOL, { type: "endCall" }]),
  };
}

export function advocateAssistant(cfg: VoiceConfig, meta: AdvocallCallMeta, input: CaseInput, brief: CallBrief, today: string): VapiAssistant {
  return {
    name: "advocall-advocate",
    firstMessageMode: "assistant-waits-for-user", // IVR / a human speaks first
    maxDurationSeconds: 600,
    ...base(cfg, meta, "en", advocateSystemPrompt(input, brief, today), [
      SET_CALL_STATE_TOOL,
      RECORD_COMMITMENT_TOOL,
      { type: "dtmf" },
      { type: "endCall" },
    ]),
  };
}

export function reportAssistant(
  cfg: VoiceConfig,
  meta: AdvocallCallMeta,
  input: CaseInput & { id: string },
  match: RuleMatch,
  commitment: Commitment | null,
  spokenUpdate: string,
): VapiAssistant {
  return {
    name: "advocall-report",
    firstMessage: spokenUpdate,
    firstMessageMode: "assistant-speaks-first",
    maxDurationSeconds: 180,
    ...base(cfg, meta, meta.lang, reportSystemPrompt(meta.lang, input, match, commitment, spokenUpdate), [{ type: "endCall" }]),
  };
}
