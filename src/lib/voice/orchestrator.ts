// The live call pipeline: Vapi webhooks in -> the SAME AdvocallEvents the mock scripts emit. SERVER ONLY. Owner: Rayan.
//
//   intake call (user's language) --create_case--> case.created + call.started + buffered transcript
//   intake ends  -> call.ended -> rule.matched -> open -> calling -> dial advocate
//   advocate call (English) --set_call_state / record_commitment--> call.state / commitment.recorded
//   advocate ends -> CLOSE -> call.ended -> promised | failed -> dial report-back
//   report ends  -> call.ended -> message.sent (SMS text) [-> escalation.created -> escalated if no ticket]
//
// Pure logic: network (dial), clock and emit are injected, so tests/voice.test.ts drives it with fake webhooks.
import type {
  AdvocateState,
  Call,
  CallLeg,
  Case,
  CaseInput,
  CaseView,
  Category,
  Commitment,
  EventInput,
  Lang,
  RuleMatch,
  Speaker,
} from "@/types";
import { ADVOCATE_STATES } from "@/types";
import { formatDate, formatINR } from "@/lib/core/format";
import { buildCallBrief, buildEscalationPacket, daysBetween, isValidYmd, matchRule } from "@/lib/rules";
import { buildReportScript, buildSmsSummary } from "@/content";
import type { VoiceConfig } from "./config";
import { normalizePhone } from "./config";
import {
  advocateAssistant,
  intakeAssistant,
  reportAssistant,
  type AdvocallCallMeta,
  type VapiAssistant,
} from "./assistants";
import { intakeToolResult } from "./prompts";
import { parseVapiMessage, type NormalizedToolCall, type VapiCallInfo } from "./messages";

// ------------------------------------------------------------------ deps + state

export type Dialer = (req: { to: string; customerName?: string; assistant: VapiAssistant }) => Promise<{ id: string }>;

export interface OrchestratorDeps {
  emit: (e: EventInput) => void;
  dial: Dialer;
  config: VoiceConfig;
  today: () => string; // "YYYY-MM-DD" IST
  now: () => string; // ISO timestamp
  defer: (task: () => Promise<void>) => void; // run after the webhook response is sent
  log?: (msg: string) => void;
}

interface LiveCall {
  meta: AdvocallCallMeta;
  vapiCallId: string | null;
  to: string;
  startedAt: string;
  knownName: string | null;
  announced: boolean; // call.started emitted (needs a case)
  inProgress: boolean;
  ended: boolean;
  states: AdvocateState[];
  buffer: { speaker: Speaker; text: string; language: Lang }[]; // intake lines before the case exists
}

interface LiveCase {
  case: Case;
  match: RuleMatch;
  commitment: Commitment | null;
  finished: boolean;
}

interface LiveState {
  calls: Map<string, LiveCall>;
  byVapi: Map<string, string>;
  cases: Map<string, LiveCase>;
  callSeq: number;
  caseSeq: number;
}

const FIRST_LIVE_CASE = 200; // live cases are A-0201+, never colliding with the mock A-01xx ids
const g = globalThis as unknown as { __advocallLive?: LiveState };

function state(): LiveState {
  return (g.__advocallLive ??= {
    calls: new Map(),
    byVapi: new Map(),
    cases: new Map(),
    callSeq: 0,
    caseSeq: FIRST_LIVE_CASE,
  });
}

/** Forget all live calls (called by /api/demo/reset). */
export function resetLive() {
  const s = state();
  s.calls.clear();
  s.byVapi.clear();
  s.cases.clear();
  s.caseSeq = FIRST_LIVE_CASE;
}

export interface LiveCallSummary {
  callId: string;
  vapiCallId: string | null;
  leg: CallLeg;
  caseId: string | null;
  to: string;
  inProgress: boolean;
  ended: boolean;
  lastState: AdvocateState | null;
}

export function liveCalls(): LiveCallSummary[] {
  return [...state().calls.values()].map((c) => ({
    callId: c.meta.callId,
    vapiCallId: c.vapiCallId,
    leg: c.meta.leg,
    caseId: c.meta.caseId,
    to: c.to,
    inProgress: c.inProgress,
    ended: c.ended,
    lastState: c.states.at(-1) ?? null,
  }));
}

function newCall(deps: OrchestratorDeps, leg: CallLeg, caseId: string | null, lang: Lang, to: string, knownName: string | null): LiveCall {
  const s = state();
  s.callSeq += 1;
  const call: LiveCall = {
    meta: { callId: `call_live_${s.callSeq}_${Date.now().toString(36)}`, leg, caseId, lang },
    vapiCallId: null,
    to,
    startedAt: deps.now(),
    knownName,
    announced: false,
    inProgress: false,
    ended: false,
    states: [],
    buffer: [],
  };
  s.calls.set(call.meta.callId, call);
  return call;
}

export class LiveCallError extends Error {}

export function isAllowedPhone(cfg: VoiceConfig, phone: string): boolean {
  return cfg.teamPhones.includes(phone);
}

// ------------------------------------------------------------------ helpers

const log = (deps: OrchestratorDeps, msg: string) => (deps.log ?? console.log)(`[advocall/live] ${msg}`);

function callObj(call: LiveCall, status: Call["status"]): Call {
  return {
    id: call.meta.callId,
    caseId: call.meta.caseId ?? "",
    leg: call.meta.leg,
    status,
    to: call.to,
    startedAt: call.startedAt,
    endedAt: null,
    outcome: null,
  };
}

function announce(deps: OrchestratorDeps, call: LiveCall, status: Call["status"]) {
  if (call.announced || !call.meta.caseId) return;
  call.announced = true;
  deps.emit({ type: "call.started", caseId: call.meta.caseId, data: { call: callObj(call, status) } });
}

function setState(deps: OrchestratorDeps, call: LiveCall, next: AdvocateState) {
  if (!call.meta.caseId || !call.announced) return;
  if (call.states.at(-1) === next && next !== "PUSH_BACK") return; // each push-back is its own step
  call.states.push(next);
  deps.emit({ type: "call.state", caseId: call.meta.caseId, data: { callId: call.meta.callId, state: next } });
}

function status(deps: OrchestratorDeps, lc: LiveCase, next: Case["status"], note: string | null) {
  lc.case.status = next;
  deps.emit({ type: "case.status", caseId: lc.case.id, data: { status: next, note } });
}

function viewOf(lc: LiveCase): CaseView {
  return {
    case: { ...lc.case },
    match: lc.match,
    calls: [],
    transcript: [],
    commitment: lc.commitment,
    escalation: null,
    messages: [],
    timeline: [],
  };
}

const FAILED_REASON = /did-not-answer|busy|voicemail|fail|error|rejected|not-found|invalid|dial/i;

function speakerFor(leg: CallLeg, role: "assistant" | "user"): Speaker {
  if (role === "assistant") return "agent";
  return leg === "advocate" ? "company" : "user";
}

function asBool(v: unknown): boolean {
  return v === true || v === "true" || v === "yes";
}

function asText(v: unknown): string {
  return typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "";
}

// ------------------------------------------------------------------ call starts

/** Dashboard/`/dev` "Call me" button: Advocall phones the user for intake. */
export async function startIntakeCall(
  deps: OrchestratorDeps,
  opts: { phone: string; name?: string | null; lang?: Lang },
): Promise<{ callId: string; vapiCallId: string }> {
  const phone = normalizePhone(opts.phone);
  if (!phone) throw new LiveCallError(`"${opts.phone}" is not a valid phone number`);
  if (!isAllowedPhone(deps.config, phone)) throw new LiveCallError(`${phone} is not in TEAM_PHONES; we only call team phones`);
  const lang = opts.lang ?? deps.config.defaultLang;
  const name = opts.name?.trim() || null;
  const call = newCall(deps, "intake", null, lang, phone, name);
  const assistant = intakeAssistant(deps.config, call.meta, deps.today(), name);
  try {
    const { id } = await deps.dial({ to: phone, customerName: name ?? undefined, assistant });
    link(call, id);
    log(deps, `intake ${call.meta.callId} -> ${phone} (vapi ${id})`);
    return { callId: call.meta.callId, vapiCallId: id };
  } catch (e) {
    state().calls.delete(call.meta.callId);
    throw e;
  }
}

function link(call: LiveCall, vapiCallId: string | null) {
  if (!vapiCallId || call.vapiCallId === vapiCallId) return;
  call.vapiCallId = vapiCallId;
  state().byVapi.set(vapiCallId, call.meta.callId);
}

async function dialLeg(deps: OrchestratorDeps, call: LiveCall, assistant: VapiAssistant, customerName?: string) {
  announce(deps, call, "ringing");
  try {
    const { id } = await deps.dial({ to: call.to, customerName, assistant });
    link(call, id);
    log(deps, `${call.meta.leg} ${call.meta.callId} -> ${call.to} (vapi ${id})`);
  } catch (e) {
    log(deps, `${call.meta.leg} dial failed: ${(e as Error).message}`);
    await finalize(deps, call, `dial-failed: ${(e as Error).message}`.slice(0, 120));
  }
}

async function dialAdvocate(deps: OrchestratorDeps, lc: LiveCase) {
  const call = newCall(deps, "advocate", lc.case.id, "en", deps.config.companyPhone, null);
  const brief = buildCallBrief(lc.case, lc.match);
  await dialLeg(deps, call, advocateAssistant(deps.config, call.meta, lc.case, brief, deps.today()), lc.case.company);
}

async function dialReport(deps: OrchestratorDeps, lc: LiveCase) {
  const lang = lc.case.language;
  if (!normalizePhone(lc.case.userPhone)) {
    finishCase(deps, lc); // web intake: nobody to phone back, the dashboard + SMS text carry the update
    return;
  }
  const call = newCall(deps, "report", lc.case.id, lang, lc.case.userPhone, lc.case.userName);
  const spoken = buildReportScript(viewOf(lc), lang);
  await dialLeg(deps, call, reportAssistant(deps.config, call.meta, lc.case, lc.match, lc.commitment, spoken), lc.case.userName);
}

/** After the report-back call: SMS text, and the regulator packet if the company gave nothing. */
function finishCase(deps: OrchestratorDeps, lc: LiveCase) {
  if (lc.finished) return;
  lc.finished = true;
  const view = viewOf(lc);
  deps.emit({
    type: "message.sent",
    caseId: lc.case.id,
    data: { channel: "sms", to: lc.case.userPhone, language: lc.case.language, text: buildSmsSummary(view, lc.case.language) },
  });
  if (!lc.commitment) {
    const packet = buildEscalationPacket(lc.case, lc.match, null, deps.today());
    deps.emit({ type: "escalation.created", caseId: lc.case.id, data: { packet } });
    status(deps, lc, "escalated", `Escalation packet for ${packet.to}`);
  }
}

// ------------------------------------------------------------------ call ends

async function finalize(deps: OrchestratorDeps, call: LiveCall, endedReason: string | null) {
  if (call.ended) return; // Vapi can send both status-update(ended) and end-of-call-report, and may retry
  call.ended = true;
  const failed = !call.inProgress || (endedReason !== null && FAILED_REASON.test(endedReason));
  const lc = call.meta.caseId ? state().cases.get(call.meta.caseId) : undefined;
  log(deps, `${call.meta.leg} ${call.meta.callId} ended (${endedReason ?? "no reason"})${failed ? " FAILED" : ""}`);

  if (!lc) {
    log(deps, `${call.meta.leg} call ended before a case was created; nothing to show`);
    return;
  }
  const endCall = (outcome: string, st: "ended" | "failed") =>
    deps.emit({ type: "call.ended", caseId: lc.case.id, data: { callId: call.meta.callId, status: st, outcome } });

  if (call.meta.leg === "intake") {
    const ref = lc.case.txnRef ? `, ${lc.case.txnRef}` : "";
    endCall(`Case captured: ${lc.case.company}, ${formatINR(lc.case.amountPaise)}${ref}`, "ended");
    deps.emit({ type: "rule.matched", caseId: lc.case.id, data: { match: lc.match } });
    status(deps, lc, "open", "Rule matched");
    status(deps, lc, "calling", `Calling ${lc.case.company}`);
    deps.defer(() => dialAdvocate(deps, lc));
    return;
  }

  if (call.meta.leg === "advocate") {
    if (call.inProgress) setState(deps, call, "CLOSE");
    const k = lc.commitment;
    if (k) {
      const by = k.promisedBy ? `, resolution by ${formatDate(k.promisedBy)}` : "";
      endCall(`Ticket ${k.ticketNo}${by}${k.compensationAck ? ", compensation acknowledged" : ""}`, "ended");
      status(deps, lc, "promised", `Ticket ${k.ticketNo}`);
    } else if (failed) {
      endCall(`Call not completed (${endedReason ?? "no answer"})`, "failed");
      status(deps, lc, "failed", `Could not reach ${lc.case.company}`);
    } else {
      const pushBacks = call.states.filter((x) => x === "PUSH_BACK").length;
      endCall("Company refused to register complaint", "ended");
      status(deps, lc, "failed", pushBacks > 0 ? `Refused after ${pushBacks} push-back${pushBacks === 1 ? "" : "s"}` : "No complaint registered");
    }
    deps.defer(() => dialReport(deps, lc));
    return;
  }

  // report / followup
  endCall(failed ? `User not reached (${endedReason ?? "no answer"}); SMS sent` : lc.commitment ? "User informed" : "User informed; escalation prepared", failed ? "failed" : "ended");
  finishCase(deps, lc);
}

// ------------------------------------------------------------------ tools

const CATEGORIES: Category[] = ["upi_failed", "ecom_refund", "telecom_billing", "other"];
const MAX_PAISE = 1_000_000_00; // ₹10 lakh: anything bigger is a mis-hearing

function createCase(deps: OrchestratorDeps, call: LiveCall, args: Record<string, unknown>): string {
  if (call.meta.leg !== "intake") return "ERROR: create_case is only for the intake call.";
  if (call.meta.caseId) return `Case ${call.meta.caseId} is already saved. Continue with the next step.`;

  const today = deps.today();
  const problems: string[] = [];
  const userName = asText(args.user_name) || call.knownName || "";
  const company = asText(args.company);
  const category = CATEGORIES.includes(args.category as Category) ? (args.category as Category) : "other";
  const rupees = typeof args.amount_rupees === "number" ? args.amount_rupees : Number(asText(args.amount_rupees).replace(/[₹,\s]|rs\.?/gi, ""));
  const amountPaise = Math.round(rupees * 100);
  const incidentDate = asText(args.incident_date);
  const txnRef = asText(args.txn_ref).replace(/\s+/g, "") || null;
  const description = asText(args.description) || `${category.replace("_", " ")} complaint with ${company}`;

  if (!userName) problems.push("the customer's name is missing");
  if (!company) problems.push("the company name is missing");
  if (!Number.isFinite(rupees) || amountPaise <= 0 || amountPaise > MAX_PAISE) problems.push("the amount must be a rupee amount like 4500");
  if (!isValidYmd(incidentDate)) problems.push("incident_date must be a real date as YYYY-MM-DD");
  else if (daysBetween(incidentDate, today) < 0) problems.push(`the date ${incidentDate} is in the future (today is ${today})`);
  if (problems.length) return `ERROR: ${problems.join("; ")}. Ask the customer again for just that.`;

  const input: CaseInput = {
    userName,
    userPhone: call.to,
    language: call.meta.lang,
    company,
    category,
    amountPaise,
    incidentDate,
    txnRef,
    description,
  };
  let match: RuleMatch;
  try {
    match = matchRule(input, today);
  } catch (e) {
    return `ERROR: ${(e as Error).message}. Ask the customer again.`;
  }

  const s = state();
  s.caseSeq += 1;
  const id = `A-${String(s.caseSeq).padStart(4, "0")}`;
  const c: Case = { ...input, id, status: "intake", createdAt: call.startedAt, updatedAt: deps.now() };
  s.cases.set(id, { case: c, match, commitment: null, finished: false });
  call.meta.caseId = id;

  deps.emit({ type: "case.created", caseId: id, data: { case: { ...c } } });
  announce(deps, call, "in_progress");
  for (const line of call.buffer) {
    deps.emit({ type: "transcript", caseId: id, data: { line: { callId: call.meta.callId, ...line } } });
  }
  call.buffer = [];
  log(deps, `case ${id} created from ${call.meta.callId}: ${company} ${formatINR(amountPaise)} ${category}`);
  return intakeToolResult(id, input, match);
}

function recordCommitment(deps: OrchestratorDeps, call: LiveCall, args: Record<string, unknown>): string {
  const lc = call.meta.caseId ? state().cases.get(call.meta.caseId) : undefined;
  if (call.meta.leg !== "advocate" || !lc) return "ERROR: record_commitment is only for the call with the company.";
  const ticketNo = asText(args.ticket_no).toUpperCase().replace(/\s+/g, "");
  const rawDate = asText(args.promised_by);
  if (!ticketNo) return "ERROR: ticket_no is empty. Ask them for the complaint number.";
  let promisedBy: string | null = null;
  if (rawDate) {
    if (!isValidYmd(rawDate)) return "ERROR: promised_by must be YYYY-MM-DD. Ask them to confirm the exact date.";
    if (daysBetween(deps.today(), rawDate) < 0) return `ERROR: ${rawDate} is in the past. Ask them to confirm the date.`;
    promisedBy = rawDate;
  }
  setState(deps, call, "CAPTURE");
  lc.commitment = {
    caseId: lc.case.id,
    ticketNo,
    promisedBy,
    compensationAck: asBool(args.compensation_ack),
    confirmed: asBool(args.confirmed),
  };
  deps.emit({ type: "commitment.recorded", caseId: lc.case.id, data: { commitment: { ...lc.commitment } } });
  return "Saved. Now thank them, say goodbye and end the call.";
}

function setCallState(deps: OrchestratorDeps, call: LiveCall, args: Record<string, unknown>): string {
  const next = asText(args.state).toUpperCase() as AdvocateState;
  if (call.meta.leg !== "advocate" || !ADVOCATE_STATES.includes(next)) return "ignored";
  const pushBacks = call.states.filter((x) => x === "PUSH_BACK").length;
  if (next === "PUSH_BACK" && pushBacks >= 2) {
    log(deps, `WARNING ${call.meta.callId}: third push-back attempted`);
    return "You already pushed back twice. Do not push back again; close the call politely.";
  }
  setState(deps, call, next);
  return "ok";
}

function runTool(deps: OrchestratorDeps, call: LiveCall, tc: NormalizedToolCall): string {
  switch (tc.name) {
    case "create_case":
      return createCase(deps, call, tc.args);
    case "record_commitment":
      return recordCommitment(deps, call, tc.args);
    case "set_call_state":
      return setCallState(deps, call, tc.args);
    default:
      return `ERROR: unknown tool ${tc.name}`;
  }
}

// ------------------------------------------------------------------ webhook entry

function findCall(deps: OrchestratorDeps, info: VapiCallInfo): LiveCall | null {
  const s = state();
  let call = (info.meta && s.calls.get(info.meta.callId)) || (info.vapiCallId && s.calls.get(s.byVapi.get(info.vapiCallId) ?? "")) || null;
  if (!call && info.meta) {
    // Server restarted mid-call, or a browser web call: adopt it from the metadata we put on the assistant.
    call = newCall(deps, info.meta.leg, info.meta.caseId, info.meta.lang, normalizePhone(info.customerNumber ?? "") || "web", null);
    s.calls.delete(call.meta.callId);
    call.meta = { ...info.meta };
    s.calls.set(call.meta.callId, call);
    if (call.meta.caseId && s.cases.has(call.meta.caseId)) call.announced = true;
  }
  if (call) link(call, info.vapiCallId);
  return call;
}

export interface WebhookResult {
  status: number;
  body: unknown;
}

export async function handleVapiWebhook(deps: OrchestratorDeps, body: unknown): Promise<WebhookResult> {
  const msg = parseVapiMessage(body);
  if (!msg) return { status: 400, body: { error: "not a Vapi server message" } };

  if (msg.kind === "assistant-request") {
    // Someone phoned our Vapi number: answer with the intake assistant (team phones only).
    const phone = normalizePhone(msg.call.customerNumber ?? "");
    if (!phone || !isAllowedPhone(deps.config, phone)) {
      log(deps, `inbound call from ${phone || "unknown"} rejected (not in TEAM_PHONES)`);
      return { status: 200, body: { error: "Sorry, this demo line only accepts calls from the Advocall team." } };
    }
    const call = newCall(deps, "intake", null, deps.config.defaultLang, phone, null);
    link(call, msg.call.vapiCallId);
    return { status: 200, body: { assistant: intakeAssistant(deps.config, call.meta, deps.today(), null) } };
  }

  const call = findCall(deps, msg.call);
  if (!call) {
    if (msg.kind === "tool-calls") {
      return { status: 200, body: { results: msg.toolCalls.map((t) => ({ name: t.name, toolCallId: t.id, result: "ERROR: unknown call" })) } };
    }
    return { status: 200, body: { ok: true, ignored: "unknown call" } };
  }

  switch (msg.kind) {
    case "status":
      if (msg.status === "in-progress" && !call.inProgress) {
        call.inProgress = true;
        if (call.meta.leg === "advocate") setState(deps, call, "DISCLOSE");
      } else if (msg.status === "ended") {
        await finalize(deps, call, msg.call.endedReason);
      }
      break;

    case "transcript": {
      if (!msg.final || !msg.text) break;
      call.inProgress = true;
      const line = {
        speaker: speakerFor(call.meta.leg, msg.role),
        text: msg.text,
        language: call.meta.leg === "advocate" ? ("en" as Lang) : call.meta.lang,
      };
      if (call.meta.caseId && call.announced && !call.ended) {
        deps.emit({ type: "transcript", caseId: call.meta.caseId, data: { line: { callId: call.meta.callId, ...line } } });
      } else if (!call.meta.caseId) {
        call.buffer.push(line);
      }
      break;
    }

    case "tool-calls": {
      call.inProgress = true;
      const results = msg.toolCalls.map((tc) => {
        let result: string;
        try {
          result = runTool(deps, call, tc);
        } catch (e) {
          log(deps, `tool ${tc.name} crashed: ${(e as Error).message}`);
          result = "ERROR: something went wrong. Apologise and try once more.";
        }
        return { name: tc.name, toolCallId: tc.id, result };
      });
      return { status: 200, body: { results } };
    }

    case "end":
      await finalize(deps, call, msg.endedReason);
      break;

    case "other":
      break;
  }
  return { status: 200, body: { ok: true } };
}
