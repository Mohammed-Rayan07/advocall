// Owner: YASO. Small typed helpers so demo scripts read like a screenplay.
import type {
  AdvocateState,
  Call,
  CallLeg,
  Case,
  CaseInput,
  CaseStatus,
  CaseView,
  Commitment,
  DemoStep,
  EscalationPacket,
  Lang,
  RuleMatch,
  Speaker,
} from "@/types";

export function makeCase(input: CaseInput, id: string, status: CaseStatus = "intake"): Case {
  const now = new Date().toISOString();
  return { ...input, id, status, createdAt: now, updatedAt: now };
}

/** Full CaseView so scripts can call buildSmsSummary / buildReportScript before the events exist. */
export function viewFor(c: Case, match: RuleMatch | null, commitment: Commitment | null): CaseView {
  return { case: c, match, calls: [], transcript: [], commitment, escalation: null, messages: [], timeline: [] };
}

/** Helpers bound to one case id. */
export function scriptFor(caseId: string) {
  return {
    created: (c: Case, delayMs = 0): DemoStep => ({ delayMs, event: { type: "case.created", caseId, data: { case: c } } }),

    status: (status: CaseStatus, note: string | null = null, delayMs = 600): DemoStep => ({
      delayMs,
      event: { type: "case.status", caseId, data: { status, note } },
    }),

    matched: (match: RuleMatch, delayMs = 1500): DemoStep => ({ delayMs, event: { type: "rule.matched", caseId, data: { match } } }),

    startCall: (callId: string, leg: CallLeg, to: string, delayMs = 1200): DemoStep => {
      const call: Call = {
        id: callId,
        caseId,
        leg,
        status: "ringing",
        to,
        startedAt: new Date().toISOString(),
        endedAt: null,
        outcome: null,
      };
      return { delayMs, event: { type: "call.started", caseId, data: { call } } };
    },

    state: (callId: string, state: AdvocateState, delayMs = 500): DemoStep => ({
      delayMs,
      event: { type: "call.state", caseId, data: { callId, state } },
    }),

    say: (callId: string, speaker: Speaker, language: Lang, text: string, delayMs = 2500): DemoStep => ({
      delayMs,
      event: { type: "transcript", caseId, data: { line: { callId, speaker, text, language } } },
    }),

    endCall: (callId: string, outcome: string | null, delayMs = 1200, status: "ended" | "failed" = "ended"): DemoStep => ({
      delayMs,
      event: { type: "call.ended", caseId, data: { callId, status, outcome } },
    }),

    commitment: (commitment: Commitment, delayMs = 1000): DemoStep => ({
      delayMs,
      event: { type: "commitment.recorded", caseId, data: { commitment } },
    }),

    escalation: (packet: EscalationPacket, delayMs = 1500): DemoStep => ({
      delayMs,
      event: { type: "escalation.created", caseId, data: { packet } },
    }),

    sms: (to: string, language: Lang, text: string, delayMs = 1500): DemoStep => ({
      delayMs,
      event: { type: "message.sent", caseId, data: { channel: "sms", to, language, text } },
    }),
  };
}
