// Owner: AGASTYA. Builds the complaint packet the user can file with the regulator.
import type { Case, Commitment, EscalationPacket, RuleMatch } from "@/types";

export function buildEscalationPacket(
  c: Case,
  match: RuleMatch,
  commitment: Commitment | null,
  today: string,
): EscalationPacket {
  // TODO(Agastya): replace this placeholder. Spec: team/MANUAL_AGASTYA.md
  void commitment;
  void today;
  return {
    caseId: c.id,
    to: match.rule.escalation.name,
    channelUrl: match.rule.escalation.url,
    phone: match.rule.escalation.phone ?? null,
    subject: "STUB",
    body: "STUB",
    facts: [],
  };
}
