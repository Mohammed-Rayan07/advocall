// Owner: AGASTYA. Self-check verification script for rights engine logic.
import assert from "node:assert";
import type { CaseInput, Commitment } from "@/types";
import { matchRule, rightsSummary, rightsTimeline } from "./index";

const BAD_STRINGS = /undefined|null|NaN|TODO|STUB/;

// -------------------------------------------------------------
// Test 1: R1 (Failed UPI: ₹4,500, incident 2026-09-22, today 2026-09-27)
// -------------------------------------------------------------
const r1Input: CaseInput = {
  userName: "Ravi Kumar",
  userPhone: "+919876543210",
  language: "en",
  company: "HDFC Bank",
  category: "upi_failed",
  amountPaise: 450_000,
  incidentDate: "2026-09-22",
  txnRef: "UPI4829301",
  description: "Debited but beneficiary not credited",
};

const r1Today = "2026-09-27";
const r1Match = matchRule(r1Input, r1Today);

assert.strictEqual(r1Match.ruleId, "R1");
assert.strictEqual(r1Match.claimable, true);
assert.strictEqual(r1Match.deadline, "2026-09-23");
assert.strictEqual(r1Match.daysLate, 4);
assert.strictEqual(r1Match.compensationPaise, 40_000); // 4 days * ₹100
assert.strictEqual(r1Match.totalAtStakePaise, 490_000); // ₹4,500 + ₹400

// R1 Timeline without commitment
const timelineWithoutCommitment = rightsTimeline(r1Input, r1Match, null, r1Today);
assert.strictEqual(timelineWithoutCommitment.length, 4);
assert.deepStrictEqual(
  timelineWithoutCommitment.map((m) => m.date),
  ["2026-09-22", "2026-09-23", "2026-09-24", "2026-09-27"],
);
assert.strictEqual(timelineWithoutCommitment[0].kind, "incident");
assert.strictEqual(timelineWithoutCommitment[0].status, "past");
assert.strictEqual(timelineWithoutCommitment[1].kind, "deadline");
assert.strictEqual(timelineWithoutCommitment[1].status, "past");
assert.strictEqual(timelineWithoutCommitment[2].kind, "escalate");
assert.strictEqual(timelineWithoutCommitment[2].status, "past");
assert.strictEqual(timelineWithoutCommitment[3].kind, "today");
assert.strictEqual(timelineWithoutCommitment[3].status, "today");

// R1 Timeline with commitment promisedBy 2026-09-29
const r1Commitment: Commitment = {
  caseId: "A-0142",
  ticketNo: "CMP88213",
  promisedBy: "2026-09-29",
  compensationAck: true,
  confirmed: true,
};
const timelineWithCommitment = rightsTimeline(r1Input, r1Match, r1Commitment, r1Today);
assert.strictEqual(timelineWithCommitment.length, 5);
assert.deepStrictEqual(
  timelineWithCommitment.map((m) => m.date),
  ["2026-09-22", "2026-09-23", "2026-09-27", "2026-09-29", "2026-09-30"],
);
assert.strictEqual(timelineWithCommitment[2].kind, "today");
assert.strictEqual(timelineWithCommitment[2].status, "today");
assert.strictEqual(timelineWithCommitment[3].kind, "promised");
assert.strictEqual(timelineWithCommitment[3].status, "future");
assert.strictEqual(timelineWithCommitment[4].kind, "escalate");
assert.strictEqual(timelineWithCommitment[4].status, "future");

// R1 Multilingual Summary
for (const lang of ["en", "hi", "kn"] as const) {
  const summary = rightsSummary(r1Match, lang);
  assert.ok(summary.length > 20);
  assert.ok(!BAD_STRINGS.test(summary));
  assert.ok(summary.includes("₹4,900"));
}

// -------------------------------------------------------------
// Test 2: R2 (E-commerce Refund)
// -------------------------------------------------------------
const r2Input: CaseInput = {
  userName: "Priya Sharma",
  userPhone: "+919876543211",
  language: "en",
  company: "Flipkart",
  category: "ecom_refund",
  amountPaise: 129_900,
  incidentDate: "2026-08-01",
  txnRef: "OD19283019",
  description: "Returned item, refund not received",
};

const r2Match = matchRule(r2Input, "2026-09-27");
assert.strictEqual(r2Match.ruleId, "R2");
assert.strictEqual(r2Match.claimable, true);
assert.strictEqual(r2Match.deadline, "2026-08-31");
assert.strictEqual(r2Match.daysLate, 27);
assert.strictEqual(r2Match.compensationPaise, 0);
assert.strictEqual(r2Match.totalAtStakePaise, 129_900);

const r2Timeline = rightsTimeline(r2Input, r2Match, null, "2026-09-27");
assert.strictEqual(r2Timeline.length, 4);

for (const lang of ["en", "hi", "kn"] as const) {
  const summary = rightsSummary(r2Match, lang);
  assert.ok(summary.length > 20);
  assert.ok(!BAD_STRINGS.test(summary));
  assert.ok(summary.includes("₹1,299"));
}

// -------------------------------------------------------------
// Test 3: FALLBACK (Other category, no rule matched)
// -------------------------------------------------------------
const fbInput: CaseInput = {
  userName: "Amit Verma",
  userPhone: "+919876543212",
  language: "en",
  company: "Local Electronics",
  category: "other",
  amountPaise: 50_000,
  incidentDate: "2026-09-20",
  txnRef: null,
  description: "Defective item sold, store refuses replacement",
};

const fbMatch = matchRule(fbInput, "2026-09-27");
assert.strictEqual(fbMatch.ruleId, "FALLBACK");
assert.strictEqual(fbMatch.claimable, false);
assert.strictEqual(fbMatch.deadline, null);
assert.strictEqual(fbMatch.compensationPaise, 0);

const fbTimeline = rightsTimeline(fbInput, fbMatch, null, "2026-09-27");
// Only incident and today; no deadline and no promise => no escalate milestone
assert.strictEqual(fbTimeline.length, 2);
assert.deepStrictEqual(
  fbTimeline.map((m) => m.kind),
  ["incident", "today"],
);

for (const lang of ["en", "hi", "kn"] as const) {
  const summary = rightsSummary(fbMatch, lang);
  assert.ok(summary.length > 20);
  assert.ok(!BAD_STRINGS.test(summary));
}

console.log("ALL RULE CHECKS PASSED");
