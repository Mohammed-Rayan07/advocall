# MANUAL: YASO · Demo Engine + Multilingual Content (our safety net)

**Your mission:** two things that save the demo.
1. **Mock demos:** scripted, realistic cases that play through the real dashboard exactly like a live call. If the venue Wi-Fi or phone network dies, **your script IS the demo**. It's also what the team uses to test all day without spending credits.
2. **Multilingual content:** the SMS the user receives, what the AI says on the report-back call, and every dashboard label, in **English, Hindi and Kannada**.

| | |
|---|---|
| **Your folders** (edit only these) | `src/mock/**`, `src/content/**` |
| **Your branch** | `yaso` |
| **Your pass/fail check** | `npm run test:mock` and `npm run test:content` all green · `npm run typecheck` prints nothing · the demo plays nicely on http://localhost:3000/dev |
| **Non-code job** | QA lead: test matrix, bug board, backup demo video |

First do **team/00_SETUP_AND_GIT.md**. Then paste the prompts **one at a time**.

---

## How it works (Antigravity reads this too)

A demo script is a list of steps: `{ delayMs, event }`. The server plays them through the **same event bus** that live calls use,
so the dashboard can't tell the difference. The types (`DemoScript`, `DemoStep`, `EventInput`, `Case`, `CaseView`...) are in `src/types/index.ts`.
**Copy the pattern of `src/mock/scripts/quick.ts`**; it's a working example.

Rules for every script:
- first step = `case.created`; every event uses the **same caseId**
- a `call.started` must come before any `transcript` / `call.state` / `call.ended` for that call id
- `call.state` values must only move forward in this order (repeating is ok, PUSH_BACK at most 2×):
  `DISCLOSE → NAVIGATE → HOLD → STATE_CASE → ASK → PUSH_BACK → VERIFY → CAPTURE → CLOSE`
- total of all delayMs between 20 000 and 180 000 ms
- get the rule match from Agastya's engine: `matchRule(input, todayIST())` (import `matchRule` from `@/lib/rules`, `todayIST` from `@/lib/core/format`). **Never hand-write a RuleMatch.** Until Agastya's code is merged it returns a "STUB" result; that's expected.
- the SMS text = `buildSmsSummary(view, lang)` and the report-call words = `buildReportScript(view, lang)`, **your own functions** from `@/content`.

### Script 1: `upi` (THE hero demo, ~100–140 seconds at speed 1)
Case **A-0142** · user **Ravi Kumar** · `+919800000001` · language **hi** · **HDFC Bank** · `upi_failed` · **₹4,500** (`450000`) · incidentDate **2026-09-22** · txnRef **UPI4829301**.
Story:
1. `case.created` (status `"intake"`) → `call.started` leg **intake** (to = user phone) → ~6 transcript lines **in Hindi (Devanagari)**, `language: "hi"`:
   agent greets and discloses it's an AI → Ravi explains (₹4,500 UPI to a shop on 22 Sep, money cut from account, shop didn't get it) →
   agent **repeats back** the amount, date and reference to confirm → Ravi says "हाँ, सही है" → agent says it will call HDFC and call him back → `call.ended`.
2. `rule.matched` (from `matchRule`) → `case.status` `"open"`, then `"calling"`.
3. `call.started` leg **advocate** (to `+919800000002`) → `call.state` DISCLOSE → transcript in **English**, `language: "en"`:
   agent: *"Hello, I'm an AI assistant calling on behalf of Ravi Kumar, who is available to verify."* →
   NAVIGATE (IVR: "Press 2 for UPI complaints", agent notes pressing 2) → HOLD (a short line like "[on hold: music]" as a `company` line, then 5–8 s of delay) →
   STATE_CASE (facts only) → ASK (complaint number + reversal date) → company brush-off *"Sir, please wait 7 to 10 working days"* →
   PUSH_BACK (agent says the rule's pushBackLine: use `match.pushBackLine`) → company gives **complaint number CMP88213**, reversal by **2026-09-29**, and agrees compensation will be credited →
   CAPTURE (agent reads it back letter by letter: "C-M-P-8-8-2-1-3, by 29 September, correct?" → company "Yes") →
   `commitment.recorded` { ticketNo "CMP88213", promisedBy "2026-09-29", compensationAck true, confirmed true } → CLOSE (polite thanks) → `call.ended` outcome "Ticket CMP88213, reversal by 29 Sep".
4. `case.status` `"promised"`.
5. `call.started` leg **report** (to user) → 2–3 transcript lines in Hindi: the agent line = `buildReportScript(view, "hi")`, then Ravi: "बहुत बढ़िया, धन्यवाद!" → `call.ended`.
6. `message.sent` { channel "sms", to user phone, language "hi", text = `buildSmsSummary(view, "hi")` }.
At least **12 transcript lines** in total. Pace like a real call: 1.5–4 s between lines.

### Script 2: `ecom` (~45–70 s)
Case **A-0143** · **Priya Sharma** · `+919800000003` · language **en** · **Flipkart** · `ecom_refund` · **₹1,299** (`129900`) · incidentDate **2026-08-20** · txnRef **OD4312987765** (order id).
Intake in English (short) → rule.matched (R2) → advocate call: agent cites the E-Commerce Rules via `match.pushBackLine` → company gives ticket **FK-77120394**, refund by **2026-09-30** → commitment → promised → SMS in English.

### Script 3: `refusal` (~40–60 s)
Case **A-0144** · **Suresh Gowda** · `+919800000004` · language **kn** · **Axis Bank** · `upi_failed` · **₹2,000** (`200000`) · incidentDate **2026-09-18** · txnRef **UPI7719203**.
Short intake (Kannada lines, `language: "kn"`) → rule.matched → advocate call: DISCLOSE → STATE_CASE → ASK → company refuses → PUSH_BACK #1 →
refuses again → PUSH_BACK #2 → refuses a third time → agent **stops pushing** politely (max 2 push-backs is a safety rule), CLOSE →
`call.ended` status "ended", outcome "Company refused to register complaint" → `case.status` `"failed"` → `escalation.created` with
`buildEscalationPacket(caseObj, match, null, todayIST())` from `@/lib/rules` → `case.status` `"escalated"`. **No commitment.**

### Content spec (`src/content/messages.ts`)
- `buildSmsSummary(view, lang)`: ≤ 320 characters, in `lang` (hi = Devanagari, kn = Kannada script, en = English).
  Always contains: case id, company, `formatINR(view.case.amountPaise)`. If `view.commitment`: ticket number + `formatDate(promisedBy)`.
  If no commitment: say the company didn't give a ticket and we'll follow up / escalate. Start with "Advocall:".
  Example en: `Advocall: Case A-0142. HDFC Bank registered complaint CMP88213 for your ₹4,500 UPI payment. Reversal promised by 29 Sep 2026. We'll follow up if it's late.`
- `buildReportScript(view, lang)`: 2–4 **short spoken** sentences, warm and simple, addressing the user by first name.
  With commitment: says the ticket (as written, e.g. "CMP88213"), the promised date, and that we'll remind/escalate if it's missed.
  Without: says the company didn't commit, and asks if they want us to escalate to the regulator.
- Never output `undefined`, `null`, `NaN`. Use `formatINR`, `formatDate` from `@/lib/core/format`.
- Write natural, everyday Hindi/Kannada (how a helpful person talks), not stiff textbook translation. Numbers and ₹ amounts stay as digits.

### Strings (`src/content/strings.ts`)
Translate every value of `en` into Hindi (`hi`) and Kannada (`kn`). Keep the keys identical. "Advocall" stays "Advocall".
Add any keys that Vaishnavi requests (look in `team/REQUESTS_vaishnavi.md` after merges) to **all three** languages.

---

## PROMPTS FOR ANTIGRAVITY (paste one at a time)

### Prompt 1: Orientation (no code yet)
```
You are working on the Advocall hackathon project. Read completely: AGENTS.md, team/MANUAL_YASO.md,
src/types/index.ts, src/lib/core/format.ts, src/lib/core/reduce.ts, src/lib/rules/index.ts,
src/mock/scripts/quick.ts, src/mock/scripts/index.ts, every file in src/content/, tests/mock.test.ts and tests/content.test.ts.

I own ONLY src/mock/** and src/content/**. Never edit other files. Never edit tests. Never run "npm install <package>".

Do not write code yet. Reply with: (1) the rules every demo script must follow, (2) the list of tests in both test files,
(3) your plan. Then run "npm run test:mock" and "npm run test:content" and tell me the pass/fail counts (failures are expected now).
```
✅ **Check:** it lists the script rules correctly.

### Prompt 2: Messages + strings (content first, because the scripts use it)
```
Implement src/content/messages.ts (buildSmsSummary, buildReportScript) and translate src/content/strings.ts exactly
as specified in the "Content spec" and "Strings" sections of team/MANUAL_YASO.md, for en, hi (Devanagari) and kn (Kannada script).
Natural, warm, everyday language. Keep the exported names and signatures unchanged.
Run npm run test:content and npm run typecheck and show the results. Fix until everything passes (never edit tests).
```
✅ **Check:** `npm run test:content` all green. Also **read the Hindi texts yourself**: do they sound natural?

### Prompt 3: Helper + hero script "upi"
```
Create src/mock/helpers.ts with small helpers for writing scripts (for example: makeCase(input, id, status),
say(callId, speaker, text, language, delayMs) returning a transcript DemoStep, state(callId, state, delayMs),
startCall(...), endCall(...), and viewFor(case, match, commitment) returning a full CaseView object so the
script can call buildSmsSummary / buildReportScript). All typed with the types from "@/types"; no "any".

Then create src/mock/scripts/upi.ts exporting upiScript: the hero demo, exactly following "Script 1: upi" in
team/MANUAL_YASO.md (Hindi intake in Devanagari, English advocate call with IVR + hold + brush-off + push-back
using match.pushBackLine + ticket CMP88213 read back + commitment, Hindi report-back call using buildReportScript,
SMS using buildSmsSummary). Use matchRule(input, todayIST()) for the rule. Register it in src/mock/scripts/index.ts.
Run npm run test:mock and npm run typecheck and fix until the "upi" tests pass (other scripts come next).
```
✅ **Check:** open http://localhost:3000/dev → click **▶ upi** → watch the whole story play in the events list (~2 minutes). Read it: does it sound like a real call?

### Prompt 4: Scripts "ecom" and "refusal"
```
Create src/mock/scripts/ecom.ts (ecomScript) and src/mock/scripts/refusal.ts (refusalScript) exactly as described in
"Script 2: ecom" and "Script 3: refusal" in team/MANUAL_YASO.md, using the helpers. The refusal script must have exactly
2 PUSH_BACK states, no commitment, end with case.status "failed" then escalation.created (buildEscalationPacket from "@/lib/rules")
and case.status "escalated". Register both in index.ts (order: quick, upi, ecom, refusal).
Run npm test and npm run typecheck and show results. All mock + content tests must pass.
```
✅ **Check:** `npm run test:mock` and `npm run test:content` all green. Play each on `/dev`.

**→ Hand in (checkpoint), see team/00_SETUP_AND_GIT.md section C.** Folders for zip: `src/mock`, `src/content`.

### Prompt 5: Realism pass
```
Re-read upi.ts, ecom.ts and refusal.ts as if you were a hackathon judge watching the transcript scroll by.
Make the dialogue more natural and realistic for Indian customer care (polite "sir/ma'am", the IVR menu, hold,
a slightly scripted-sounding bank agent) while keeping every rule and test passing. Keep each line short (< 180 chars)
so it fits nicely in the chat bubbles. Run npm test and npm run typecheck.
```

---

## Recovery prompts
- **Test says a call id wasn't started:** `Every transcript/call.state/call.ended must use a callId that was started earlier with call.started in the same script. Fix the order.`
- **Test says states go backwards:** `call.state must follow DISCLOSE→NAVIGATE→HOLD→STATE_CASE→ASK→PUSH_BACK→VERIFY→CAPTURE→CLOSE and never go back. Remove or reorder the offending state change.`
- **Hindi/Kannada shows as boxes or "???":** `Save the file as UTF-8 and write the text directly in Devanagari/Kannada script, not escaped codes.`
- **It wants to edit tests or types:** `No. Those are locked. Fix only src/mock and src/content.`
- **It edited a file outside your folders:** `Revert all changes outside src/mock and src/content using git checkout -- <file>. Show git status.`

---

## Your non-code job: QA lead (very important)

1. Create `team/TEST_MATRIX.md` (you may create this file) with these rows, and fill in pass/fail at every checkpoint:
   | # | Scenario | Pass if |
   |---|---|---|
   | 1 | `npm test` | everything green |
   | 2 | Dashboard: run upi demo at speed 1 | whole story visible, auto-scroll works, ticket pops in |
   | 3 | Run ecom and refusal demos | refusal shows red/escalated, no ticket |
   | 4 | Escalate button on upi case | packet appears, Copy works |
   | 5 | Language toggle EN/हि/ಕ | all labels switch, nothing broken |
   | 6 | Phone-width browser (375px) | no sideways scroll, readable |
   | 7 | Reset, then run 2 demos at once | both cases listed, switching works |
   | 8 | Live call (after Rayan's voice part is merged): Hindi intake | case appears with correct amount/date/ref |
   | 9 | Live: bank rep brushes off | agent cites RBI T+1 once or twice, then gets/asks ticket |
   | 10 | Live: bank rep asks for OTP | agent NEVER asks the user for OTP |
   | 11 | Full demo timed | under 3:00 |
2. **Bug board:** a shared Google Sheet: *what I did · what happened · expected · severity (P0/P1/P2) · screenshot*.
3. **Backup video:** at ~20:30 and ~01:00, screen-record (Win+Alt+R on Windows via Xbox Game Bar, or OBS) the full upi demo on the dashboard, with the phone call audio if live works. This is our last-resort demo.
