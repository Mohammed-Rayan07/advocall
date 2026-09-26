// Owner: AGASTYA. Computes a chronological timeline of rights milestones for a case.
import type { CaseInput, Commitment, RuleMatch } from "@/types";
import { addDays, daysBetween } from "./dates";

export interface RightsMilestone {
  date: string;
  label: string;
  kind: "incident" | "deadline" | "promised" | "today" | "escalate";
  status: "past" | "today" | "future";
}

const KIND_ORDER: Record<RightsMilestone["kind"], number> = {
  incident: 1,
  deadline: 2,
  promised: 3,
  today: 4,
  escalate: 5,
};

function getStatus(date: string, today: string): "past" | "today" | "future" {
  const diff = daysBetween(date, today);
  if (diff > 0) return "past";
  if (diff < 0) return "future";
  return "today";
}

export function rightsTimeline(
  input: CaseInput,
  match: RuleMatch,
  commitment: Commitment | null,
  today: string,
): RightsMilestone[] {
  const milestones: RightsMilestone[] = [
    {
      date: input.incidentDate,
      label: "Incident date",
      kind: "incident",
      status: getStatus(input.incidentDate, today),
    },
  ];

  if (match.deadline) {
    milestones.push({
      date: match.deadline,
      label: "Statutory deadline",
      kind: "deadline",
      status: getStatus(match.deadline, today),
    });
  }

  if (commitment?.promisedBy) {
    milestones.push({
      date: commitment.promisedBy,
      label: "Company promised date",
      kind: "promised",
      status: getStatus(commitment.promisedBy, today),
    });
  }

  milestones.push({
    date: today,
    label: "Today",
    kind: "today",
    status: "today",
  });

  // Escalate if unresolved: day after promised date, or day after deadline if no promise
  const escalateBase = commitment?.promisedBy ?? match.deadline;
  if (escalateBase) {
    const escalateDate = addDays(escalateBase, 1);
    milestones.push({
      date: escalateDate,
      label: "Escalate if unresolved",
      kind: "escalate",
      status: getStatus(escalateDate, today),
    });
  }

  return milestones.sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    if (cmp !== 0) return cmp;
    return (KIND_ORDER[a.kind] ?? 0) - (KIND_ORDER[b.kind] ?? 0);
  });
}
