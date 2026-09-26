// Turns any Vapi webhook body into one small normalized shape. Owner: Rayan.
// Vapi payloads vary (toolCallList vs toolWithToolCallList, parameters vs function.arguments as a JSON string),
// so ALL the defensive parsing lives here and the orchestrator only sees clean data.
import type { CallLeg, Lang } from "@/types";
import type { AdvocallCallMeta } from "./assistants";

export interface VapiCallInfo {
  vapiCallId: string | null;
  meta: AdvocallCallMeta | null;
  customerNumber: string | null;
  endedReason: string | null;
}

export interface NormalizedToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export type VapiInbound =
  | { kind: "status"; call: VapiCallInfo; status: string }
  | { kind: "transcript"; call: VapiCallInfo; role: "assistant" | "user"; final: boolean; text: string }
  | { kind: "tool-calls"; call: VapiCallInfo; toolCalls: NormalizedToolCall[] }
  | { kind: "end"; call: VapiCallInfo; endedReason: string | null }
  | { kind: "assistant-request"; call: VapiCallInfo }
  | { kind: "other"; call: VapiCallInfo; type: string };

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string | null => (typeof v === "string" && v.length > 0 ? v : null);

const LEGS: CallLeg[] = ["intake", "advocate", "report", "followup"];
const LANGS: Lang[] = ["hi", "en", "kn"];

function readMeta(v: unknown): AdvocallCallMeta | null {
  if (!isObj(v)) return null;
  const callId = str(v.callId);
  const leg = str(v.leg) as CallLeg | null;
  const lang = str(v.lang) as Lang | null;
  if (!callId || !leg || !LEGS.includes(leg) || !lang || !LANGS.includes(lang)) return null;
  return { callId, leg, lang, caseId: str(v.caseId) };
}

function callInfo(message: Obj): VapiCallInfo {
  const call = isObj(message.call) ? message.call : {};
  const candidates = [
    isObj(call.assistant) ? call.assistant.metadata : undefined,
    isObj(call.assistantOverrides) ? call.assistantOverrides.metadata : undefined,
    call.metadata,
    isObj(message.assistant) ? message.assistant.metadata : undefined,
  ];
  let meta: AdvocallCallMeta | null = null;
  for (const c of candidates) {
    meta = isObj(c) ? readMeta(c.advocall) : null;
    if (meta) break;
  }
  const customer = isObj(message.customer) ? message.customer : isObj(call.customer) ? call.customer : {};
  return {
    vapiCallId: str(call.id),
    meta,
    customerNumber: str(customer.number),
    endedReason: str(message.endedReason) ?? str(call.endedReason),
  };
}

function parseArgs(v: unknown): Record<string, unknown> {
  if (isObj(v)) return v;
  if (typeof v === "string") {
    try {
      const parsed: unknown = JSON.parse(v);
      return isObj(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function normalizeToolCall(raw: unknown, fallbackName: string | null = null): NormalizedToolCall | null {
  if (!isObj(raw)) return null;
  const fn = isObj(raw.function) ? raw.function : {};
  const id = str(raw.id);
  const name = str(fn.name) ?? str(raw.name) ?? fallbackName;
  if (!id || !name) return null;
  const args = raw.parameters !== undefined ? parseArgs(raw.parameters) : parseArgs(fn.arguments ?? fn.parameters);
  return { id, name, args };
}

export function parseVapiMessage(body: unknown): VapiInbound | null {
  if (!isObj(body) || !isObj(body.message)) return null;
  const m = body.message;
  const type = str(m.type) ?? "";
  const call = callInfo(m);

  switch (type) {
    case "status-update":
      return { kind: "status", call, status: str(m.status) ?? "" };
    case "transcript":
    case 'transcript[transcriptType="final"]':
      return {
        kind: "transcript",
        call,
        role: m.role === "user" ? "user" : "assistant",
        final: m.transcriptType === "final" || type !== "transcript",
        text: (str(m.transcript) ?? "").trim(),
      };
    case "tool-calls": {
      const list = Array.isArray(m.toolCallList) ? m.toolCallList : [];
      let toolCalls = list.map((t) => normalizeToolCall(t)).filter((t): t is NormalizedToolCall => t !== null);
      if (toolCalls.length === 0 && Array.isArray(m.toolWithToolCallList)) {
        toolCalls = m.toolWithToolCallList
          .map((t) => (isObj(t) ? normalizeToolCall(t.toolCall, str(t.name)) : null))
          .filter((t): t is NormalizedToolCall => t !== null);
      }
      return { kind: "tool-calls", call, toolCalls };
    }
    case "end-of-call-report":
      return { kind: "end", call, endedReason: call.endedReason };
    case "assistant-request":
      return { kind: "assistant-request", call };
    default:
      return { kind: "other", call, type };
  }
}
