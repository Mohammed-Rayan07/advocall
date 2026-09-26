// Owner: Rayan (sample). A 25-second smoke-test script. Yaso: copy this pattern for your scripts.
import type { Case, CaseInput, DemoScript, DemoStep } from "@/types";
import { matchRule } from "@/lib/rules";

const input: CaseInput = {
  userName: "Ravi Kumar",
  userPhone: "+919800000001",
  language: "hi",
  company: "HDFC Bank",
  category: "upi_failed",
  amountPaise: 450000,
  incidentDate: "2026-09-22",
  txnRef: "UPI4829301",
  description: "Paid ₹4,500 by UPI to a shop, money debited, shop never received it.",
};
const CASE_ID = "A-0100";
const now = new Date().toISOString();
const c: Case = { ...input, id: CASE_ID, status: "open", createdAt: now, updatedAt: now };

const CALL = "call_quick_adv";
const line = (speaker: "agent" | "company", text: string, delayMs = 1500): DemoStep => ({
  delayMs,
  event: { type: "transcript", caseId: CASE_ID, data: { line: { callId: CALL, speaker, text, language: "en" } } },
});

export const quickScript: DemoScript = {
  id: "quick",
  title: "Quick smoke test",
  description: "25-second UPI case to check the dashboard pipeline.",
  steps: [
    { delayMs: 0, event: { type: "case.created", caseId: CASE_ID, data: { case: c } } },
    { delayMs: 1000, event: { type: "rule.matched", caseId: CASE_ID, data: { match: matchRule(input, "2026-09-26") } } },
    { delayMs: 1000, event: { type: "case.status", caseId: CASE_ID, data: { status: "calling", note: null } } },
    {
      delayMs: 500,
      event: {
        type: "call.started",
        caseId: CASE_ID,
        data: { call: { id: CALL, caseId: CASE_ID, leg: "advocate", status: "ringing", to: "+919800000002", startedAt: now, endedAt: null, outcome: null } },
      },
    },
    { delayMs: 1500, event: { type: "call.state", caseId: CASE_ID, data: { callId: CALL, state: "DISCLOSE" } } },
    line("agent", "Hello, I'm an AI assistant calling on behalf of Ravi Kumar, who is available to verify."),
    { delayMs: 1000, event: { type: "call.state", caseId: CASE_ID, data: { callId: CALL, state: "STATE_CASE" } } },
    line("agent", "On 22 September, ₹4,500 was debited by UPI, reference UPI4829301, but the merchant was not credited.", 2500),
    line("company", "Sir, please wait 7 to 10 working days.", 3000),
    { delayMs: 500, event: { type: "call.state", caseId: CASE_ID, data: { callId: CALL, state: "PUSH_BACK" } } },
    line("agent", "Under RBI's rules the reversal was due by T+1, and ₹100 per day is payable after that. Could you give me a complaint number?", 2500),
    line("company", "Okay, complaint number is CMP88213, reversal by 29 September.", 3000),
    { delayMs: 500, event: { type: "call.state", caseId: CASE_ID, data: { callId: CALL, state: "CAPTURE" } } },
    {
      delayMs: 1000,
      event: {
        type: "commitment.recorded",
        caseId: CASE_ID,
        data: { commitment: { caseId: CASE_ID, ticketNo: "CMP88213", promisedBy: "2026-09-29", compensationAck: true, confirmed: true } },
      },
    },
    { delayMs: 1000, event: { type: "call.state", caseId: CASE_ID, data: { callId: CALL, state: "CLOSE" } } },
    { delayMs: 1000, event: { type: "call.ended", caseId: CASE_ID, data: { callId: CALL, status: "ended", outcome: "Ticket CMP88213, reversal by 29 Sep" } } },
    { delayMs: 500, event: { type: "case.status", caseId: CASE_ID, data: { status: "promised", note: "Ticket CMP88213" } } },
  ],
};
