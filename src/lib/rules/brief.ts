// Owner: AGASTYA. The per-case brief handed to the advocate voice agent.
import type { CaseInput, RuleMatch } from "@/types";
import { formatDate, formatINR } from "@/lib/core/format";

export interface CallBrief {
  goal: string; // what to obtain on this call
  facts: string; // case facts to state
  citeLine: string; // rule.citeText if claimable, else ""
  pushBackLine: string; // polite line when brushed off
  mustNot: string[]; // hard safety limits
  stopWhen: string[]; // stop conditions
}

export function buildCallBrief(c: CaseInput, match: RuleMatch): CallBrief {
  const ref = c.txnRef ? `, reference ${c.txnRef}` : "";
  return {
    goal: `Get the ${match.rule.goalOnCall.join(", ")} for ${c.userName}'s complaint.`,
    facts:
      `${c.userName} is a customer of ${c.company}. On ${formatDate(c.incidentDate)}, ${formatINR(c.amountPaise)} was involved${ref}. ` +
      `Problem: ${c.description.trim()}`,
    citeLine: match.claimable ? match.rule.citeText : "",
    pushBackLine: match.pushBackLine,
    mustNot: [
      "Never ask for, accept, or repeat an OTP, PIN, CVV, password or full card number",
      "Never agree to anything or accept a settlement on the customer's behalf",
      "Never cite any law or regulation other than the cite line",
      "Never push back more than twice",
      "Never be rude, threatening or sarcastic",
    ],
    stopWhen: [
      "Complaint/ticket number and resolution date are captured and read back",
      "The company refuses after two push-backs",
      "The company needs OTP or KYC: offer to connect the customer instead",
    ],
  };
}
