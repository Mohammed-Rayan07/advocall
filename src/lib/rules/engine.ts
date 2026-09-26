// Owner: AGASTYA. Matches a case to a rule and computes deadline + compensation.
// PURE FUNCTION: same input -> same output. The LLM never does this maths.
import type { CaseInput, RuleMatch } from "@/types";
import { RULES } from "./data";

/**
 * @param input  the case facts from the intake call
 * @param today  today's date "YYYY-MM-DD" (passed in so tests are deterministic)
 * @throws Error if amountPaise is not a positive integer or incidentDate is not a valid date
 */
export function matchRule(input: CaseInput, today: string): RuleMatch {
  // TODO(Agastya): replace this placeholder. Spec: team/MANUAL_AGASTYA.md, tests: tests/rules.test.ts
  void today;
  const rule = RULES.R1;
  return {
    ruleId: rule.id,
    rule,
    claimable: false,
    deadline: null,
    daysLate: 0,
    compensationPaise: 0,
    totalAtStakePaise: input.amountPaise,
    explanation: "STUB: rights engine not implemented yet",
    pushBackLine: "STUB",
  };
}
