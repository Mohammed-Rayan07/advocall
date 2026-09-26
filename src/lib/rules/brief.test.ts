// Owner: AGASTYA. Unit tests for buildCallBrief (Prompt 7 of MANUAL_AGASTYA.md).
// Vitest include is set to tests/**. This file runs as a standalone script via: npx tsx src/lib/rules/brief.test.ts
import assert from "node:assert";
import type { CaseInput } from "@/types";
import { matchRule } from "./engine";
import { buildCallBrief } from "./brief";

const baseInput: CaseInput = {
  userName: "Ravi Kumar",
  userPhone: "+919800000001",
  language: "hi",
  company: "HDFC Bank",
  category: "upi_failed",
  amountPaise: 450_000,
  incidentDate: "2026-09-20",
  txnRef: "UPI4829301",
  description: "Paid Rs 4,500 by UPI, debited, merchant not credited.",
};

const TODAY = "2026-09-26";

// R1: citeLine is non-empty and contains RBI
{
  const match = matchRule(baseInput, TODAY);
  const brief = buildCallBrief(baseInput, match);

  assert.ok(brief.goal.length > 10, "R1 goal too short");
  assert.ok(brief.facts.includes("HDFC Bank"), "R1 facts must mention company");
  assert.ok(brief.facts.includes("₹4,500"), "R1 facts must mention formatted amount");
  assert.ok(brief.facts.includes("UPI4829301"), "R1 facts must mention txnRef");
  assert.ok(brief.citeLine.length > 20, "R1 citeLine too short");
  assert.ok(brief.citeLine.includes("RBI"), "R1 citeLine must contain RBI");
  assert.ok(brief.pushBackLine.includes("RBI"), "R1 pushBackLine must contain RBI");
  assert.ok(brief.pushBackLine.includes("T+1"), "R1 pushBackLine must contain T+1");
  assert.ok(brief.mustNot.length >= 5, "mustNot must have at least 5 items");
  assert.ok(brief.stopWhen.length >= 3, "stopWhen must have at least 3 items");
  assert.ok(brief.mustNot.some((s) => /OTP|PIN|password/i.test(s)), "mustNot must ban OTP/PIN/password");
}

// R2: citeLine cites E-Commerce Rules
{
  const input: CaseInput = { ...baseInput, category: "ecom_refund", company: "Flipkart" };
  const match = matchRule(input, TODAY);
  const brief = buildCallBrief(input, match);

  assert.ok(brief.citeLine.length > 20, "R2 citeLine too short");
  assert.ok(brief.citeLine.includes("E-Commerce"), "R2 citeLine must cite E-Commerce");
  assert.ok(brief.facts.includes("Flipkart"), "R2 facts must mention Flipkart");
}

// FALLBACK: citeLine must be empty string
{
  const input: CaseInput = { ...baseInput, category: "other", company: "Some Shop" };
  const match = matchRule(input, TODAY);
  const brief = buildCallBrief(input, match);

  assert.strictEqual(brief.citeLine, "", "FALLBACK citeLine must be empty string");
  assert.ok(brief.pushBackLine.toLowerCase().includes("complaint number"), "FALLBACK pushBackLine must mention complaint number");
  assert.ok(!/RBI|TRAI|Rule/.test(brief.pushBackLine), "FALLBACK pushBackLine must not mention RBI/TRAI/Rule");
  assert.ok(brief.goal.length > 10, "FALLBACK goal too short");
}

// No txnRef: facts omit reference gracefully
{
  const input: CaseInput = { ...baseInput, txnRef: null, category: "other", company: "Local Shop" };
  const match = matchRule(input, TODAY);
  const brief = buildCallBrief(input, match);

  assert.ok(!brief.facts.includes("undefined"), "facts must not contain 'undefined'");
  assert.ok(!brief.facts.includes("null"), "facts must not contain 'null'");
}

console.log("ALL BRIEF TESTS PASSED");
