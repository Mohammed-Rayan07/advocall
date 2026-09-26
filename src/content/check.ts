// Owner: YASO. Self-check script for all content & voice lines.
import assert from "node:assert";
import type { CaseInput, Lang } from "@/types";
import { formatINR } from "@/lib/core/format";
import {
  callbackPromise,
  confirmCaseLine,
  disclosureLine,
  intakeGreeting,
} from "./voice";

const LANGS: Lang[] = ["en", "hi", "kn"];
const DEVANAGARI = /[ऀ-ॿ]/;
const KANNADA = /[ಀ-೿]/;
const BAD = /undefined|null|NaN/;

const sampleInput: CaseInput = {
  userName: "Anita Verma",
  userPhone: "+919800000007",
  language: "hi",
  company: "Airtel",
  category: "telecom_billing",
  amountPaise: 79900,
  incidentDate: "2026-09-10",
  txnRef: "BILL-5521907",
  description: "Overcharged ₹799 on postpaid bill.",
};

for (const lang of LANGS) {
  // 1. intakeGreeting
  const greeting = intakeGreeting(lang);
  assert(greeting && greeting.trim().length > 0, `intakeGreeting empty for ${lang}`);
  assert(!BAD.test(greeting), `intakeGreeting has invalid tokens for ${lang}: ${greeting}`);

  // 2. confirmCaseLine
  const confirm = confirmCaseLine(sampleInput, lang);
  assert(confirm && confirm.trim().length > 0, `confirmCaseLine empty for ${lang}`);
  assert(!BAD.test(confirm), `confirmCaseLine has invalid tokens for ${lang}: ${confirm}`);
  assert(confirm.includes(formatINR(sampleInput.amountPaise)), `confirmCaseLine missing formatINR for ${lang}`);
  assert(confirm.includes("B-I-L-L-5-5-2-1-9-0-7"), `confirmCaseLine missing spelled reference for ${lang}`);

  // 3. callbackPromise
  const promise = callbackPromise(lang);
  assert(promise && promise.trim().length > 0, `callbackPromise empty for ${lang}`);
  assert(!BAD.test(promise), `callbackPromise has invalid tokens for ${lang}: ${promise}`);

  // Script checks
  if (lang === "hi") {
    assert(DEVANAGARI.test(greeting), "intakeGreeting hi missing Devanagari");
    assert(DEVANAGARI.test(confirm), "confirmCaseLine hi missing Devanagari");
    assert(DEVANAGARI.test(promise), "callbackPromise hi missing Devanagari");
  }
  if (lang === "kn") {
    assert(KANNADA.test(greeting), "intakeGreeting kn missing Kannada script");
    assert(KANNADA.test(confirm), "confirmCaseLine kn missing Kannada script");
    assert(KANNADA.test(promise), "callbackPromise kn missing Kannada script");
  }
}

// 4. disclosureLine
const disclosure = disclosureLine("Anita Verma");
assert(disclosure && disclosure.trim().length > 0, "disclosureLine is empty");
assert(!BAD.test(disclosure), `disclosureLine contains invalid tokens: ${disclosure}`);
assert(disclosure.includes("Anita Verma"), "disclosureLine missing user name");
assert(disclosure.includes("AI assistant calling on behalf of"), "disclosureLine missing standard phrasing");

console.log("ALL CONTENT CHECKS PASSED");
