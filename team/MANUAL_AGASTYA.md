# MANUAL: AGASTYA · Rights Engine (the "legal brain")

**Your mission:** build the part of Advocall that decides *which law applies* and *exactly how much money is owed*.
This is our biggest difference from Pine AI and Google: **the AI never guesses the law or the money; your code computes it.**
Judges will ask about it, and you'll be the one answering.

| | |
|---|---|
| **Your folders** (edit only these) | `src/lib/rules/**`, `docs/RULEBOOK.md` |
| **Your branch** | `agastya` |
| **Your pass/fail check** | `npm run test:rules` → all tests green, and `npm run typecheck` → no output |
| **Non-code job** | Pitch lead + judge Q&A, plays "the bank rep" in the live demo |

First do **team/00_SETUP_AND_GIT.md** (setup). Then paste the prompts below **one at a time, in order**. Do the check after each one.

---

## What you are building (for you to understand; Antigravity reads this too)

```
CaseInput (from the voice call)  ──►  matchRule(input, today)  ──►  RuleMatch
  company, category, amount,                                         which rule (R1/R2/R3/FALLBACK)
  incident date, txn ref                                             deadline, days late
                                                                     compensation ₹, total at stake
                                                                     the exact line the agent may say
Case + RuleMatch + Commitment  ──►  buildEscalationPacket(...)  ──►  complaint letter for RBI / NCH
```

### Exact rules to implement

**Money is always integer paise** (₹4,500 = `450000`). **Dates are `"YYYY-MM-DD"` strings.** Use `formatINR()` and `formatDate()` from `@/lib/core/format` for any ₹ or date shown in text.

**Validation (in `matchRule`, before anything else):**
- `amountPaise` must be a positive integer, otherwise `throw new Error(...)`
- `incidentDate` must pass `isValidYmd`, otherwise `throw new Error(...)`

**Rule by category:** `upi_failed → R1`, `ecom_refund → R2`, `telecom_billing → R3`, `other → FALLBACK`

| Rule | deadline | daysLate | compensationPaise | claimable |
|---|---|---|---|---|
| R1 UPI | `incidentDate + 1 day` (T+1) | `max(0, daysBetween(deadline, today))` | `daysLate × 10000` (₹100/day) | `RULES.R1.verified` |
| R2 E-com | `incidentDate + 30 days` (redress within one month) | same formula | `0` | `RULES.R2.verified` |
| R3 Telecom | from verified TRAI timeline, or `null` if unverified | same formula (0 if deadline null) | `0` | `RULES.R3.verified` |
| FALLBACK | `null` | `0` | `0` | `false` |

- `totalAtStakePaise = amountPaise + compensationPaise`
- `explanation`: 1–2 plain-English sentences **containing `formatINR(amountPaise)`**, and for R1 also `formatINR(compensationPaise)`. Example (R1): *"HDFC Bank had to reverse ₹4,500 by 21 Sep 2026 (T+1). It is 5 days late, so ₹500 compensation (₹100/day) is owed under RBI rules. Total at stake: ₹5,000."*
- `pushBackLine`: what the agent says politely when the company brushes it off:
  - R1 must contain `"RBI"` and `"T+1"`. Example: *"As per RBI's turnaround-time rules, a failed UPI debit must be reversed by T+1, with ₹100 per day compensation after that. Could you please register a complaint and give me the complaint number?"*
  - R2 cites the E-Commerce Rules 2020 (48-hour acknowledgement, one-month redress).
  - R3 if NOT verified, and FALLBACK: **must not mention RBI, TRAI or any "Rule"**. Must contain `"complaint number"`. Example: *"I understand. Could you please register a complaint and share the complaint number and the expected resolution date?"*
- If a rule has `verified: false`, then `claimable` is `false` and the pushBackLine must NOT cite that law.

**Escalation packet (`buildEscalationPacket(case, match, commitment, today)`):**
- `to` = `match.rule.escalation.name`, `channelUrl` = its `url`, `phone` = its `phone ?? null`
- `subject`: e.g. `"Complaint: failed UPI transaction ₹4,500, HDFC Bank, ref UPI4829301 (Advocall case A-0142)"`
- `facts` is an array of `[label, value]` pairs and **must include exactly these labels**: `"Case ID"`, `"Complainant"`, `"Company"`, `"Amount"` (use `formatINR`), `"Transaction reference"` (or `"Not provided"`), `"Incident date"` (use `formatDate`), `"Rule"` (rule title), `"Deadline"` (formatDate or `"Not applicable"`), `"Compensation owed"` (formatINR), `"Ticket number"` (ticket, or exactly `"Not provided"`), `"Company promised by"` (formatDate or `"Not provided"`)
- `body`: a complete formal complaint letter in plain text: date, To, Subject, the complainant's name, what happened, the rule with its source name and URL, what the company was told on our call (ticket number and promised date if any), what relief is requested (reversal + compensation), and a closing line. **Must contain:** case id, user name, company, amount (formatted), txn ref, ticket number (if there is a commitment). **Must never contain** the words `undefined`, `null`, `NaN`, `TODO`, `STUB`.

---

## PROMPTS FOR ANTIGRAVITY (paste one at a time)

### Prompt 1: Orientation (no code yet)
```
You are working on the Advocall hackathon project. First read these files completely:
AGENTS.md, team/MANUAL_AGASTYA.md, docs/RULEBOOK.md, src/types/index.ts, src/lib/core/format.ts,
every file in src/lib/rules/, and tests/rules.test.ts.

I own ONLY src/lib/rules/** and docs/RULEBOOK.md. You must never edit any other file.
Never edit tests. Never run "npm install <package>".

Do not write code yet. Reply with: (1) a short summary of what matchRule and buildEscalationPacket
must return, (2) the list of tests in tests/rules.test.ts, (3) your step-by-step plan.
Then run "npm run test:rules" and tell me how many tests pass and fail right now (most will fail, that is expected).
```
✅ **Check:** it summarizes correctly and shows a test count (e.g. "14 failed").

### Prompt 2: Date maths
```
Implement src/lib/rules/dates.ts: isValidYmd, addDays, daysBetween, exactly as described in
team/MANUAL_AGASTYA.md and tested in tests/rules.test.ts (describe "dates").
Use Date.UTC for all maths so there are no time-zone bugs. isValidYmd must reject impossible dates
like 2026-02-30 and 2026-02-29 (not a leap year), and wrong formats like 20-09-2026.
Pure functions only. No Date.now(). Then run: npx vitest run tests/rules.test.ts -t dates
and show me the result.
```
✅ **Check:** the 3 "dates" tests pass.

### Prompt 3: The rulebook data (you verify the law, AI types it)
Before pasting, **open these sources yourself** and confirm the wording (this is your "verify the rulebook" job):
- R1: RBI circular *"Harmonisation of Turn Around Time (TAT) and customer compensation for failed transactions using authorised Payment Systems"*, 20 Sep 2019 (DPSS.CO.PD No.629/02.01.014/2019-20). Search rbi.org.in for it and copy the real page URL. In the annexure, UPI row: account debited but beneficiary not credited → reversal by **T+1**, **₹100/day** after that.
- R2: Consumer Protection (E-Commerce) Rules, 2020, **Rule 4(5)**: grievance officer acknowledges within **48 hours**, redresses within **one month**. Copy the real PDF URL (consumeraffairs.nic.in).
- R3: TRAI *Telecom Consumers Complaint Redressal Regulations, 2012* (and amendments). **Only if you can confirm the exact timelines in the official text in 20 minutes**, fill them in and set verified: true. Otherwise leave `verified: false`; that's safe, the agent then won't cite it.

```
Fill in src/lib/rules/data.ts for R1, R2, R3 and FALLBACK. Replace every "TODO".
Use these facts that I verified: [PASTE WHAT YOU VERIFIED + THE REAL URLs HERE].
- summary: one plain-English sentence of what the rule says.
- citeText: the exact polite sentence the voice agent may say on the call citing this rule (at least 20 characters).
  FALLBACK citeText must be an empty string "" (FALLBACK makes no legal claim).
- sourceName: official document name + date. sourceUrl: the real https URL I gave you.
- verified: true for R1 and R2. For R3: [true / false — I decide].
- Keep ids, categories, goalOnCall and escalation exactly as they are.
Also update docs/RULEBOOK.md: add the source URLs and a "Verified by Agastya on 26 Sep 2026" line under R1, R2 (and R3 only if verified).
Then run: npx vitest run tests/rules.test.ts -t "rulebook data" and show the result.
```
✅ **Check:** the 2 "rulebook data" tests pass.

### Prompt 4: matchRule
```
Implement matchRule in src/lib/rules/engine.ts EXACTLY following the table and bullet rules in the section
"Exact rules to implement" of team/MANUAL_AGASTYA.md. Use addDays/daysBetween/isValidYmd from ./dates,
RULES from ./data, and formatINR/formatDate from "@/lib/core/format" for every rupee amount and date that appears in text.
Validate inputs first and throw an Error with a clear message on bad amount or date.
Keep the function pure and deterministic: it must only depend on its arguments.
Then run: npm run test:rules and show me the result. Fix engine.ts until every matchRule test passes.
Do not edit the tests.
```
✅ **Check:** all `matchRule` tests pass (escalation tests may still fail).

### Prompt 5: Escalation packet
```
Implement buildEscalationPacket in src/lib/rules/escalation.ts EXACTLY following the
"Escalation packet" section of team/MANUAL_AGASTYA.md: the same fact labels in the same order, formal complaint letter body
in plain text with line breaks, "Not provided" for missing ticket / promised date / txn ref, and formatINR/formatDate for all money and dates.
The letter must read like a real complaint an Indian consumer would file with the RBI Ombudsman or the National Consumer Helpline:
formal, factual, polite, and at most about 250 words.
Then run npm run test:rules and npm run typecheck and show both results. Everything must pass.
```
✅ **Check:** `npm run test:rules` all green AND `npm run typecheck` prints nothing.

### Prompt 6: See it in the app
```
Make sure npm run dev is running. Tell me to open http://localhost:3000/dev, click "▶ quick", wait for the case,
then click "escalate" on the case. Explain what I should see in the events list (rule.matched with real numbers,
escalation.created with the real letter). Do not change any files for this step.
```
✅ **Check:** on `/dev` the quick case shows rule **R1** and a real at-stake amount (not "STUB"), and escalating shows a real letter in the events.

**→ Hand in (checkpoint), see team/00_SETUP_AND_GIT.md section C.** Folders for zip: `src/lib/rules`, `docs/RULEBOOK.md`.

### Prompt 7 (stretch): Call brief for the voice agent
Rayan's advocate voice agent needs a short brief per case. Only do this after Prompt 5 passes.
```
Create src/lib/rules/brief.ts exporting:

export interface CallBrief {
  goal: string;            // one sentence: what to obtain on this call, built from rule.goalOnCall
  facts: string;           // 2-3 sentences of case facts to state (company, amount formatted, date formatted, txn ref)
  citeLine: string;        // rule.citeText if claimable, else ""
  pushBackLine: string;    // match.pushBackLine
  mustNot: string[];       // things the agent must never do: share OTP/PIN/passwords, promise anything for the user,
                           // cite any law not in citeLine, argue more than twice, be rude
  stopWhen: string[];      // stop conditions: ticket number + date captured and read back; company refuses twice;
                           // company asks for OTP/KYC -> offer to connect the user
}
export function buildCallBrief(c: import("@/types").CaseInput, match: import("@/types").RuleMatch): CallBrief

Pure function, no new dependencies. Export it from src/lib/rules/index.ts as well (add ONE export line, do not
change the existing exports). Write tests for it in src/lib/rules/brief.test.ts (NOT in the tests/ folder), covering R1, R2 and FALLBACK
(FALLBACK citeLine must be ""). Run npx vitest run src/lib/rules and npm run typecheck and show results.
```

---

## If something goes wrong (recovery prompts)

- **Tests fail and the AI wants to change the test:**
  `No. Tests are locked. Read the failing assertion carefully, explain in one sentence what the code does wrong, then fix only src/lib/rules/.`
- **Time-zone / off-by-one day errors:**
  `Do all date maths with Date.UTC(y, m-1, d) and getUTC* methods only. Never use new Date("YYYY-MM-DD") local parsing or Date.now(). Re-run the tests.`
- **Type errors in files you don't own:** don't fix them. Tell Rayan.
- **The AI edited a file outside your folder:** `Revert every change outside src/lib/rules and docs/RULEBOOK.md using git checkout -- <file>. Show git status.`

---

## Your non-code job (in parallel, or while waiting on the AI)

1. **Q&A cheat sheet** (1 page) with crisp answers to: "Isn't this Pine AI?", "Is it legal for an AI to call on someone's behalf?", "What if it says something wrong about the law?" (answer: *it can't; the law and the money come from verified code, not the AI*), "OTP/privacy?", "Business model?", "How does it scale beyond 3 case types?" (answer: *add a rule entry + tests; the engine is data-driven*).
2. **Bank-rep script** for the demo: you play the HDFC agent. Line 1: brush-off (*"please wait 7–10 working days"*). Line 2: after Advocall cites RBI, give complaint number **CMP88213** and date. Rehearse it with Rayan's live agent after 17:00.
3. The 3-minute **pitch** with Vaishnavi's deck.
