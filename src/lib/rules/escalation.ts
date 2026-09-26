// Owner: AGASTYA. Builds the complaint packet the user can file with the regulator.
import type { Case, Category, Commitment, EscalationPacket, RuleMatch } from "@/types";
import { formatDate, formatINR } from "@/lib/core/format";
import { daysBetween } from "./dates";

const ISSUE: Record<Category, string> = {
  upi_failed: "failed UPI transaction",
  ecom_refund: "e-commerce refund not processed",
  telecom_billing: "telecom billing dispute",
  other: "unresolved consumer complaint",
};

const RELIEF: Record<Category, string> = {
  upi_failed: "immediate reversal of the debited amount along with the compensation due under the RBI circular",
  ecom_refund: "immediate processing of the refund and a written response from the grievance officer",
  telecom_billing: "correction of the bill and credit of the disputed amount",
  other: "resolution of the complaint and a written response",
};

export function buildEscalationPacket(
  c: Case,
  match: RuleMatch,
  commitment: Commitment | null,
  today: string,
): EscalationPacket {
  const amount = formatINR(c.amountPaise);
  const ref = c.txnRef ?? "Not provided";
  const ticket = commitment?.ticketNo ?? "Not provided";
  const promisedBy = commitment?.promisedBy ? formatDate(commitment.promisedBy) : "Not provided";
  const deadline = match.deadline ? formatDate(match.deadline) : "Not applicable";
  const issue = ISSUE[c.category];

  const facts: [string, string][] = [
    ["Case ID", c.id],
    ["Complainant", c.userName],
    ["Company", c.company],
    ["Amount", amount],
    ["Transaction reference", ref],
    ["Incident date", formatDate(c.incidentDate)],
    ["Rule", match.rule.title],
    ["Deadline", deadline],
    ["Compensation owed", formatINR(match.compensationPaise)],
    ["Ticket number", ticket],
    ["Company promised by", promisedBy],
  ];

  const ruleParagraph = match.claimable
    ? `As per ${match.rule.sourceName} (${match.rule.sourceUrl}): ${match.rule.summary} The deadline in my case was ${deadline}` +
      (match.daysLate > 0
        ? `, and it has been exceeded by ${match.daysLate} day${match.daysLate === 1 ? "" : "s"}. Compensation owed so far: ${formatINR(match.compensationPaise)}.`
        : ".")
    : `I have raised this complaint with ${c.company} but it remains unresolved.`;

  const promiseBroken = !!commitment?.promisedBy && daysBetween(commitment.promisedBy, today) > 0;
  const callParagraph = commitment
    ? `On my behalf, my assistant Advocall contacted ${c.company} customer care. They registered complaint number ${ticket} and promised resolution by ${promisedBy}.` +
      (promiseBroken ? " This commitment has not been honoured." : " I am escalating because the issue is still unresolved.")
    : `On my behalf, my assistant Advocall contacted ${c.company} customer care, but they did not register a complaint or give any resolution date.`;

  const body = [
    `Date: ${formatDate(today)}`,
    `To: ${match.rule.escalation.name}`,
    `Subject: Complaint regarding ${issue} of ${amount} with ${c.company}`,
    "",
    "Respected Sir/Madam,",
    "",
    `I, ${c.userName}, wish to file a complaint against ${c.company} regarding a transaction of ${amount} on ${formatDate(c.incidentDate)} (reference: ${ref}). ${c.description.trim()}`,
    "",
    ruleParagraph,
    "",
    callParagraph,
    "",
    `I request ${RELIEF[c.category]}.`,
    "",
    `Advocall case reference: ${c.id}. Contact: ${c.userPhone}.`,
    "",
    "Yours faithfully,",
    c.userName,
  ].join("\n");

  return {
    caseId: c.id,
    to: match.rule.escalation.name,
    channelUrl: match.rule.escalation.url,
    phone: match.rule.escalation.phone ?? null,
    subject: `Complaint: ${issue} ${amount}, ${c.company}, ref ${ref} (Advocall case ${c.id})`,
    body,
    facts,
  };
}
