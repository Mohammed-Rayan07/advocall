// Owner: AGASTYA. Matches a case to a rule and computes deadline + compensation.
// PURE FUNCTION: same input -> same output. The LLM never does this maths.
import type { CaseInput, Category, RuleId, RuleMatch } from "@/types";
import { formatDate, formatINR } from "@/lib/core/format";
import { RULES } from "./data";
import { addDays, daysBetween, isValidYmd } from "./dates";

const RULE_FOR: Record<Category, RuleId> = {
  upi_failed: "R1",
  ecom_refund: "R2",
  telecom_billing: "R3",
  other: "FALLBACK",
};

const R1_COMP_PER_DAY_PAISE = 10_000; // ₹100/day beyond T+1
const R2_REDRESS_DAYS = 30; // "within one month"

const NEUTRAL_ASK =
  "I understand. Could you please register a complaint and share the complaint number and the expected resolution date?";

/**
 * @param input  the case facts from the intake call
 * @param today  today's date "YYYY-MM-DD" (passed in so tests are deterministic)
 * @throws Error if amountPaise is not a positive integer or incidentDate is not a valid date
 */
export function matchRule(input: CaseInput, today: string): RuleMatch {
  if (!Number.isInteger(input.amountPaise) || input.amountPaise <= 0) {
    throw new Error(`matchRule: amountPaise must be a positive integer, got ${input.amountPaise}`);
  }
  if (!isValidYmd(input.incidentDate)) {
    throw new Error(`matchRule: incidentDate must be YYYY-MM-DD, got "${input.incidentDate}"`);
  }
  if (!isValidYmd(today)) {
    throw new Error(`matchRule: today must be YYYY-MM-DD, got "${today}"`);
  }

  const ruleId = RULE_FOR[input.category] ?? "FALLBACK";
  const rule = RULES[ruleId];
  const claimable = ruleId !== "FALLBACK" && rule.verified;
  const amount = formatINR(input.amountPaise);

  let deadline: string | null = null;
  if (ruleId === "R1") deadline = addDays(input.incidentDate, 1);
  if (ruleId === "R2") deadline = addDays(input.incidentDate, R2_REDRESS_DAYS);

  const daysLate = deadline ? Math.max(0, daysBetween(deadline, today)) : 0;
  const compensationPaise = ruleId === "R1" && claimable ? daysLate * R1_COMP_PER_DAY_PAISE : 0;
  const totalAtStakePaise = input.amountPaise + compensationPaise;

  let explanation: string;
  let pushBackLine: string;

  if (ruleId === "R1" && claimable && deadline) {
    const due = formatDate(deadline);
    explanation =
      daysLate > 0
        ? `${input.company} had to reverse ${amount} by ${due} (T+1). It is ${daysLate} day${daysLate === 1 ? "" : "s"} late, so ${formatINR(compensationPaise)} compensation (₹100/day) is owed under RBI rules. Total at stake: ${formatINR(totalAtStakePaise)}.`
        : `${input.company} must reverse ${amount} by ${due} (T+1). After that, RBI rules add ${formatINR(R1_COMP_PER_DAY_PAISE)} compensation per day of delay (${formatINR(compensationPaise)} owed so far).`;
    pushBackLine =
      "As per RBI's turnaround-time rules, a failed UPI debit must be reversed by T+1, with ₹100 per day compensation after that. Could you please register a complaint and give me the complaint number and the reversal date?";
  } else if (ruleId === "R2" && claimable && deadline) {
    const due = formatDate(deadline);
    explanation =
      daysLate > 0
        ? `${input.company} had to resolve the ${amount} refund complaint by ${due} (one month under the E-Commerce Rules, 2020). It is ${daysLate} day${daysLate === 1 ? "" : "s"} overdue.`
        : `${input.company} must acknowledge the ${amount} refund complaint within 48 hours and resolve it by ${due} under the E-Commerce Rules, 2020.`;
    pushBackLine =
      "Under Rule 4(5) of the Consumer Protection E-Commerce Rules 2020, the grievance officer must acknowledge within 48 hours and resolve within one month. Could you please share the ticket number and the date the refund will be processed?";
  } else {
    explanation =
      ruleId === "R3"
        ? `Telecom billing dispute of ${amount} with ${input.company}. The exact TRAI timelines are not verified yet, so Advocall makes no legal claim and asks for a docket number and resolution date.`
        : `No specific regulation matched this ${amount} complaint with ${input.company}, so Advocall makes no legal claim and asks for a complaint number and resolution date.`;
    pushBackLine = NEUTRAL_ASK;
  }

  return { ruleId, rule, claimable, deadline, daysLate, compensationPaise, totalAtStakePaise, explanation, pushBackLine };
}
