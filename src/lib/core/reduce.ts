// Turns the event log into per-case views. Owner: Rayan (LOCKED).
// Pure function: used by the dashboard (client) and by the server.
import type { AdvocallEvent, CaseView } from "@/types";

export function reduceEvents(events: AdvocallEvent[]): Record<string, CaseView> {
  const views: Record<string, CaseView> = {};

  for (const ev of events) {
    if (ev.type === "case.created") {
      views[ev.caseId] = {
        case: { ...ev.data.case },
        match: null,
        calls: [],
        transcript: [],
        commitment: null,
        escalation: null,
        messages: [],
        timeline: [],
      };
    }
    const v = views[ev.caseId];
    if (!v) continue; // event for unknown case: ignore
    v.timeline.push(ev);
    v.case.updatedAt = ev.at;

    switch (ev.type) {
      case "case.status":
        v.case.status = ev.data.status;
        break;
      case "rule.matched":
        v.match = ev.data.match;
        break;
      case "call.started":
        v.calls.push({ ...ev.data.call, advocateState: null });
        break;
      case "call.state": {
        const c = v.calls.find((x) => x.id === ev.data.callId);
        if (c) {
          c.advocateState = ev.data.state;
          c.status = "in_progress";
        }
        break;
      }
      case "call.ended": {
        const c = v.calls.find((x) => x.id === ev.data.callId);
        if (c) {
          c.status = ev.data.status;
          c.endedAt = ev.at;
          c.outcome = ev.data.outcome;
        }
        break;
      }
      case "transcript":
        v.transcript.push({ ...ev.data.line, at: ev.at });
        break;
      case "commitment.recorded":
        v.commitment = ev.data.commitment;
        break;
      case "escalation.created":
        v.escalation = ev.data.packet;
        break;
      case "message.sent":
        v.messages.push({ at: ev.at, to: ev.data.to, language: ev.data.language, text: ev.data.text });
        break;
    }
  }
  return views;
}

/** Newest-updated first. */
export function sortedCases(views: Record<string, CaseView>): CaseView[] {
  return Object.values(views).sort((a, b) => b.case.updatedAt.localeCompare(a.case.updatedAt));
}
