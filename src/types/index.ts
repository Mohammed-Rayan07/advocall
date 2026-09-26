/**
 * ADVOCALL SHARED CONTRACT — LOCKED.
 * Owner: Rayan. Nobody else edits this file. If you think a type is wrong,
 * tell Rayan; do not change it (your change will be discarded at merge).
 *
 * Conventions (never break these):
 *  - Money is ALWAYS an integer number of paise. ₹4,500 = 450000.
 *  - Calendar dates are "YYYY-MM-DD" strings (IST calendar day).
 *  - Timestamps are full ISO strings: new Date().toISOString().
 *  - IDs are strings.
 */

export type Lang = "hi" | "en" | "kn";

export type Category = "upi_failed" | "ecom_refund" | "telecom_billing" | "other";

export type RuleId = "R1" | "R2" | "R3" | "FALLBACK";

export type CaseStatus =
  | "intake" // user is still on the intake call
  | "open" // case saved + rule matched, advocate call not started
  | "calling" // advocate call to company in progress
  | "promised" // company gave ticket + date
  | "resolved" // money received / issue fixed
  | "escalated" // escalation packet generated
  | "failed"; // company refused / call failed

export type CallLeg = "intake" | "advocate" | "report" | "followup";

export type CallStatus = "queued" | "ringing" | "in_progress" | "ended" | "failed";

/** Fixed state machine of the advocate call (see docs/ARCHITECTURE.md). */
export type AdvocateState =
  | "DISCLOSE"
  | "NAVIGATE"
  | "HOLD"
  | "STATE_CASE"
  | "ASK"
  | "PUSH_BACK"
  | "VERIFY"
  | "CAPTURE"
  | "CLOSE";

export const ADVOCATE_STATES: AdvocateState[] = [
  "DISCLOSE",
  "NAVIGATE",
  "HOLD",
  "STATE_CASE",
  "ASK",
  "PUSH_BACK",
  "VERIFY",
  "CAPTURE",
  "CLOSE",
];

export type Speaker = "agent" | "user" | "company";

// ---------------------------------------------------------------- rules

export interface Rule {
  id: RuleId;
  category: Category;
  title: string; // "Failed UPI transfer"
  summary: string; // one plain-English line: what the law says
  citeText: string; // exact sentence the agent may say on the call
  sourceName: string; // "RBI circular, Sep 2019 (TAT harmonisation)"
  sourceUrl: string;
  verified: boolean; // false => agent must NOT cite it (claimable=false)
  goalOnCall: string[]; // what the agent must obtain on the call
  escalation: { name: string; url: string; phone?: string };
}

/** Output of the rights engine (src/lib/rules). Pure data, computed in code, never by the LLM. */
export interface RuleMatch {
  ruleId: RuleId;
  rule: Rule;
  claimable: boolean; // may the agent cite a legal right?
  deadline: string | null; // "YYYY-MM-DD" by which company must fix it
  daysLate: number; // whole days past deadline as of `today` (0 if not late)
  compensationPaise: number; // statutory compensation owed so far
  totalAtStakePaise: number; // amount + compensation
  explanation: string; // 1–2 sentence plain-English explanation for the dashboard
  pushBackLine: string; // polite line the agent says when brushed off
}

// ---------------------------------------------------------------- case

/** What the intake call extracts from the user. */
export interface CaseInput {
  userName: string;
  userPhone: string;
  language: Lang;
  company: string; // "HDFC Bank", "Flipkart"
  category: Category;
  amountPaise: number;
  incidentDate: string; // "YYYY-MM-DD"
  txnRef: string | null; // UPI ref / order id / account no
  description: string; // user's problem in one or two sentences (English)
}

export interface Case extends CaseInput {
  id: string; // "A-0142"
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Call {
  id: string;
  caseId: string;
  leg: CallLeg;
  status: CallStatus;
  to: string; // phone number or "web"
  startedAt: string;
  endedAt: string | null;
  outcome: string | null; // short summary once ended
}

export interface TranscriptLine {
  callId: string;
  speaker: Speaker;
  text: string;
  language: Lang;
}

export interface Commitment {
  caseId: string;
  ticketNo: string; // "CMP88213"
  promisedBy: string | null; // "YYYY-MM-DD"
  compensationAck: boolean; // company acknowledged compensation
  confirmed: boolean; // agent read it back and company confirmed
}

export interface EscalationPacket {
  caseId: string;
  to: string; // "RBI Integrated Ombudsman (CMS)"
  channelUrl: string; // "https://cms.rbi.org.in"
  phone: string | null;
  subject: string;
  body: string; // full complaint letter, plain text, ready to paste
  facts: [label: string, value: string][]; // key facts table
}

// ---------------------------------------------------------------- events
// EVERYTHING that happens is an event. Dashboard only renders events.
// Mock mode and live mode emit EXACTLY the same events.

interface EventBase {
  id: string;
  at: string; // ISO timestamp
  caseId: string;
}

export type AdvocallEvent = EventBase &
  (
    | { type: "case.created"; data: { case: Case } }
    | { type: "case.status"; data: { status: CaseStatus; note: string | null } }
    | { type: "rule.matched"; data: { match: RuleMatch } }
    | { type: "call.started"; data: { call: Call } }
    | { type: "call.state"; data: { callId: string; state: AdvocateState } }
    | { type: "call.ended"; data: { callId: string; status: "ended" | "failed"; outcome: string | null } }
    | { type: "transcript"; data: { line: TranscriptLine } }
    | { type: "commitment.recorded"; data: { commitment: Commitment } }
    | { type: "escalation.created"; data: { packet: EscalationPacket } }
    | { type: "message.sent"; data: { channel: "sms"; to: string; language: Lang; text: string } }
  );

export type AdvocallEventType = AdvocallEvent["type"];

/** An event before the bus stamps id + at. */
export type EventInput = AdvocallEvent extends infer E
  ? E extends AdvocallEvent
    ? Omit<E, "id" | "at">
    : never
  : never;

// ---------------------------------------------------------------- mock mode

/** One step of a scripted demo. delayMs = wait BEFORE emitting this event. */
export interface DemoStep {
  delayMs: number;
  event: EventInput;
}

export interface DemoScript {
  id: string; // "upi" — used in /api/demo/start?script=upi
  title: string;
  description: string;
  steps: DemoStep[];
}

// ---------------------------------------------------------------- dashboard view

/** Everything the dashboard needs about one case. Built by reduceEvents(). */
export interface CaseView {
  case: Case;
  match: RuleMatch | null;
  calls: (Call & { advocateState: AdvocateState | null })[];
  transcript: (TranscriptLine & { at: string })[];
  commitment: Commitment | null;
  escalation: EscalationPacket | null;
  messages: { at: string; to: string; language: Lang; text: string }[];
  timeline: AdvocallEvent[]; // all events of this case, oldest first
}
