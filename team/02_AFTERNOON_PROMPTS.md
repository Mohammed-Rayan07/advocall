# 02: AFTERNOON PROMPTS (13:30 → 18:00)

Each person pastes **Part A**, waits for it to finish, reopens Antigravity in `advocall-v2`, then pastes **Part B** (their own).
Part B is a long session: the AI works through every task, **saves + pushes after each task**, and finishes with a status report.
Rayan reviews everything at ~18:00–19:00.

---

## PART A: fresh copy (everyone; change the name on step 5)

```
My team lead updated the project. I need a fresh, clean copy. Do this step by step in the terminal and show me each result:
1. If "npm run dev" is running in any terminal, stop it (Ctrl+C).
2. cd "$HOME\Desktop\hackathon"
3. git clone https://github.com/Mohammed-Rayan07/advocall.git advocall-v2
4. cd advocall-v2
5. git checkout YOURNAME            <- agastya / vaishnavi / yaso
6. git log --oneline -3             (one of the top lines must mention "AGENTS.md: allow per-person team docs")
7. npm install                      (exactly this, never install any other package)
8. npm test                         (must say 52 passed)
If all of that worked, tell me: "Now do File -> Open Folder -> Desktop\hackathon\advocall-v2 and paste Part B."
```

---

## PART B: VAISHNAVI (dashboard)

```
You are my coding agent for the Advocall hackathon. This is a LONG session: work through ALL tasks below in order without
stopping to ask me, unless you are truly blocked. After EVERY task: run the checks, then save and push (see "SAVE STEP").

=== SETUP (do first) ===
1. Delete my old unused folder:  Remove-Item -Recurse -Force "$HOME\Desktop\hackathon\advocall"
   (If it says "in use", skip it and tell me at the end. NEVER delete advocall-v2.)
2. Make sure we are in Desktop\hackathon\advocall-v2 on branch "vaishnavi" (git branch). Run: git pull origin vaishnavi
3. Start "npm run dev" in a separate terminal and keep it running. The dashboard is http://localhost:3000
4. Read completely: AGENTS.md, team/MANUAL_VAISHNAVI.md, team/01_AFTER_LUNCH.md, src/types/index.ts,
   src/lib/stream/useCaseStream.ts, src/lib/core/format.ts, src/content/strings.ts, src/app/globals.css,
   and every file in src/components/dashboard/.

=== MISTAKES FROM THE 13:00 CHECKPOINT: DO NOT REPEAT ===
- README.md, AGENTS.md and package-lock.json were changed and committed. Only src/app/page.tsx, src/components/** and
  team/VAISHNAVI_*.md may change. Before every commit restore anything else with: git checkout -- <file>
- Placeholder sections were left in Dashboard.tsx ("Rule Applied (Step 3)", "will render here", "Step 5" labels). Finished
  work must contain NO placeholders, NO "Step X" labels, NO TODOs.
- Raw dates like "2026-09-22" were shown. Always use formatDate() / formatTime() / formatINR() from "@/lib/core/format".
- English text was hardcoded where a t() key exists. Use t(key, lang) from "@/content" for every label that has a key.
  For labels with NO key yet: write the English text directly AND list "keyName: English text" in team/VAISHNAVI_REQUESTS.md.
- Never edit tests/, src/types/, src/lib/**, src/app/globals.css. Never "npm install <package>". Never create tailwind.config.js.
  Only use the color tokens from globals.css. Never push to main.

=== TASKS ===
TASK 1 (manual Prompt 3): Move the inline case list and detail sections out of Dashboard.tsx into CaseList.tsx,
  CaseHeader.tsx and RuleCard.tsx exactly as specified in the Components table of team/MANUAL_VAISHNAVI.md.
  RuleCard: rule id chip + title, citeText as a quote, source link, Deadline / Days late (red if > 0) / Compensation (gold),
  total at stake, "Computed by rights engine, not by AI" badge with ShieldCheck; skeleton when match is null;
  grey "No legal claim" badge when claimable is false.
TASK 2 (manual Prompt 4): CallProgress.tsx (9-step stepper from ADVOCATE_STATES, live duration timer, chips for intake and
  report calls) and TranscriptPanel.tsx (ALL lines, grouped by call with dividers "Intake call" / "Call to <company>" /
  "Report-back call", agent left cyan, company right, user right indigo, slide-in animation, auto-scroll, line-height 1.6).
TASK 3 (manual Prompt 5): CommitmentCard.tsx (the demo's big moment: huge mono ticket, green glow when it appears),
  EscalationPanel.tsx (POST /api/cases/{id}/escalate, show packet: to, link, phone, facts table, letter in scrollable
  mono box, Copy letter button with "Copied" feedback), Timeline.tsx (human sentence + icon per event type, newest first),
  SmsPreview.tsx (phone-notification style bubble). Remove every placeholder from Dashboard.tsx.
TASK 4: Language pass. Every visible label uses t() where a key exists; the EN / हि / ಕ toggle must change them.
  List all missing keys in team/VAISHNAVI_REQUESTS.md.
TASK 5 (manual Prompt 6): Premium polish pass exactly as described in the manual (spacing, hover/focus states, tabular-nums,
  no text below 12px, skeletons, glow ONLY on live dot / active step / new commitment).
TASK 6 (manual Prompt 7): Run each demo (quick, upi, ecom, refusal) at normal speed from the Run demo menu and fix every
  visual problem you see (long Hindi/Kannada text overflow, missing event icons, wrong status colors, refusal case with no
  ticket, report-back call grouping). Make sure the demo menu lists all four scripts.
TASK 7: Presentation mode for the projector. A "Present" toggle button in the header (and keyboard key "p") that hides the
  case list and stats, and shows the selected case large: transcript on the left, rule card + call progress + commitment
  on the right, bigger fonts. Toggle back restores the normal layout.
TASK 8: Responsive + accessibility check. At 375px width: no horizontal scroll, everything readable. All buttons reachable
  by keyboard with visible focus rings; icon-only buttons have aria-label.

=== CHECKS after every task ===
npm run typecheck  AND  npm run lint  (both must show no errors). Then open http://localhost:3000, run the "upi" demo and
confirm the change works. Fix before moving on.

=== SAVE STEP after every task ===
git status -> restore every changed file outside src/app/page.tsx, src/components/ and team/VAISHNAVI_* with git checkout -- <file>
git add -A
git commit -m "vaishnavi: task N - <short description>"
git push origin vaishnavi
Then check it arrived: git log origin/vaishnavi --oneline -1  (must show that commit). NEVER push to main.

=== FINISH ===
Write team/VAISHNAVI_STATUS.md: for each task Done / Partly / Not done, what changed, known issues, and anything you need
from Rayan. Save + push it. Then tell me "ALL DONE" with a 5-line summary.

Non-code (tell me to do this myself while you work): the 10-slide pitch deck from team/MANUAL_VAISHNAVI.md, using
screenshots of the finished dashboard.
```

---

## PART B: AGASTYA (rights engine owner + pitch)

```
You are my coding agent for the Advocall hackathon. This is a LONG session: work through ALL tasks below in order without
stopping to ask me, except where a task says "ASK ME". After EVERY task: run the checks, then save and push (see "SAVE STEP").

=== SETUP (do first) ===
1. Delete my old unused folder:  Remove-Item -Recurse -Force "$HOME\Desktop\hackathon\advocall"
   (If it says "in use", skip it and tell me at the end. NEVER delete advocall-v2.)
2. Make sure we are in Desktop\hackathon\advocall-v2 on branch "agastya" (git branch). Run: git pull origin agastya
3. Start "npm run dev" in a separate terminal and keep it running.
4. Read completely: AGENTS.md, team/MANUAL_AGASTYA.md, team/01_AFTER_LUNCH.md, docs/RULEBOOK.md, src/types/index.ts,
   src/lib/core/format.ts, every file in src/lib/rules/, and tests/rules.test.ts.

=== MISTAKES FROM THE 13:00 CHECKPOINT: DO NOT REPEAT ===
- NOTHING from my folder reached GitHub at 13:00: the work was never saved inside the project folder / never committed.
  All work MUST be inside Desktop\hackathon\advocall-v2\src\lib\rules (or docs/RULEBOOK.md, or team/AGASTYA_*.md).
  After every task, "git status" must show my changed files, and you must commit AND push AND verify the push.
- AGENTS.md and package-lock.json were changed and committed. Before every commit restore anything outside my folders
  with: git checkout -- <file>
- Never edit tests/, src/types/, src/lib/core/. Never "npm install <package>". Never push to main.
- NEVER invent legal facts, timelines or URLs. Only use what is already in the code/docs or what I give you.

=== TASKS ===
TASK 1: Understand the engine. Write team/AGASTYA_RIGHTS_ENGINE_EXPLAINER.md: a 1-page judge-friendly explanation of
  matchRule, buildEscalationPacket and buildCallBrief, with the exact numbers for: ₹4,500 failed UPI on 22 Sep 2026,
  today = 27 Sep 2026 (deadline, days late, compensation, total at stake). Explain why the AI never computes money.
TASK 2: Rights timeline. Create src/lib/rules/timeline.ts:
    export interface RightsMilestone { date: string; label: string;
      kind: "incident" | "deadline" | "promised" | "today" | "escalate"; status: "past" | "today" | "future" }
    export function rightsTimeline(input: CaseInput, match: RuleMatch, commitment: Commitment | null, today: string): RightsMilestone[]
  Milestones: incident date; rule deadline (if match.deadline); company's promised date (if commitment?.promisedBy);
  today; "Escalate if unresolved" = the day after the promised date, or the day after the deadline if there is no promise
  (skip if neither exists). Sorted by date; status from comparing with today (use daysBetween). Labels in English, dates
  as "YYYY-MM-DD". Pure function. Add ONE export line to src/lib/rules/index.ts (don't change existing lines).
TASK 3: Multilingual rights summary. Create src/lib/rules/summary.ts:
    export function rightsSummary(match: RuleMatch, lang: "en" | "hi" | "kn"): string
  1–2 short, warm, plain-language sentences telling the user their right and what is owed, in English / Hindi (Devanagari)
  / Kannada script, using formatINR and formatDate. For claimable === false: say no specific rule applies and we will ask
  for a complaint number. Never output "undefined", "null" or "NaN". Add ONE export line to index.ts.
TASK 4: Self-check script. Create src/lib/rules/check.ts that imports from "./index" and uses node:assert to check
  rightsTimeline and rightsSummary for R1 (₹4,500, 2026-09-22, today 2026-09-27, with and without a commitment
  promisedBy 2026-09-29), R2, and FALLBACK, then prints "ALL RULE CHECKS PASSED". Run it with: npx tsx src/lib/rules/check.ts
TASK 5: TRAI (R3). ASK ME: "Do you have the verified TRAI complaint timelines and official URL? Paste them, or say SKIP."
  If I paste facts: update R3 in data.ts (verified: true, summary, citeText, sourceName, sourceUrl), give R3 a deadline in
  engine.ts (incidentDate + the verified number of days) with a TRAI pushBackLine, and update docs/RULEBOOK.md R3 with
  "Verified by Agastya on 26 Sep 2026". If I say SKIP: change nothing (R3 stays unverified, which is safe).
TASK 6: Letter quality. Generate the R1 escalation letter (with and without commitment) by running a tiny tsx snippet,
  read it like an RBI Ombudsman officer, and improve wording/structure in escalation.ts (formal, factual, <= 250 words)
  while keeping every test passing.
TASK 7: Pitch material (docs, no code), written in simple, confident English:
  - team/AGASTYA_QA_CHEATSHEET.md: 12 likely judge questions with 2–3 line answers (Pine AI / Google? legal for an AI to
    call? what if it says wrong law? OTP/privacy? business model? scaling beyond 3 rules? accuracy of Hindi/Kannada?
    cost per call? why India? what if the company hangs up? data storage? what's next?)
  - team/AGASTYA_BANK_REP_SCRIPT.md: my lines as HDFC agent "Priya" for the live demo: brush-off first ("please wait 7–10
    working days"), after Advocall cites RBI give complaint number CMP88213, reversal by 29 September, agree compensation.
  - team/AGASTYA_PITCH_SCRIPT.md: a timed 3-minute pitch (hook, problem, live demo cues, rights engine = trust, safety,
    vs competitors, impact, team with Rayan as Lead Engineer & Architect).

=== CHECKS after every code task ===
npm run test:rules  AND  npm run typecheck  AND  npm run lint  AND  npx tsx src/lib/rules/check.ts (once it exists).
All must pass before saving. Never weaken or edit tests.

=== SAVE STEP after every task ===
git status -> restore every changed file outside src/lib/rules/, docs/RULEBOOK.md and team/AGASTYA_* with git checkout -- <file>
git add -A
git commit -m "agastya: task N - <short description>"
git push origin agastya
Then check it arrived: git log origin/agastya --oneline -1  (must show that commit). NEVER push to main.

=== FINISH ===
Write team/AGASTYA_STATUS.md: each task Done / Partly / Not done, what changed, and open questions for Rayan.
Save + push it. Then tell me "ALL DONE" with a 5-line summary.
```

---

## PART B: YASO (demos + multilingual content + QA)

```
You are my coding agent for the Advocall hackathon. This is a LONG session: work through ALL tasks below in order without
stopping to ask me, unless you are truly blocked. After EVERY task: run the checks, then save and push (see "SAVE STEP").

=== SETUP (do first) ===
1. Delete my old unused folder:  Remove-Item -Recurse -Force "$HOME\Desktop\hackathon\advocall"
   (If it says "in use", skip it and tell me at the end. NEVER delete advocall-v2.)
2. Make sure we are in Desktop\hackathon\advocall-v2 on branch "yaso" (git branch). Run: git pull origin yaso
3. Start "npm run dev" in a separate terminal and keep it running. Raw event view: http://localhost:3000/dev
4. Read completely: AGENTS.md, team/MANUAL_YASO.md, team/01_AFTER_LUNCH.md, src/types/index.ts, src/lib/core/format.ts,
   src/lib/rules/index.ts, every file in src/mock/ and src/content/, tests/mock.test.ts and tests/content.test.ts.

=== MISTAKES FROM THE 13:00 CHECKPOINT: DO NOT REPEAT ===
- NOTHING from my folders reached GitHub at 13:00: the work was never saved inside the project folder / never committed.
  All work MUST be inside Desktop\hackathon\advocall-v2\src\mock, src\content (or team/YASO_*.md).
  After every task, "git status" must show my changed files, and you must commit AND push AND verify the push.
- AGENTS.md and package-lock.json were changed and committed. Before every commit restore anything outside my folders
  with: git checkout -- <file>
- Never edit tests/, src/types/, src/lib/**. Never "npm install <package>". Never push to main.
- Never hand-write a RuleMatch; always use matchRule(input, todayIST()). Keep call.state order and max 2 PUSH_BACK.

=== TASKS ===
TASK 1: Language review. Put every Hindi and Kannada sentence from src/content/* and src/mock/scripts/* in
  team/YASO_LANGUAGE_REVIEW.md as a table (file, speaker, text, English meaning, "natural? yes/no", improved version).
  Then apply the improvements: everyday, warm, spoken Hindi/Kannada (how a helpful person talks on the phone), not stiff
  textbook language. Keep amounts/dates as digits. npm test must still pass.
TASK 2 (manual Prompt 5): Realism pass on upi, ecom and refusal: polite "sir/ma'am", realistic IVR, hold, slightly
  scripted bank agent, each line < 180 characters. Keep all rules and tests passing. The upi demo must stay 100–150 s.
TASK 3: New demo script "telecom" in src/mock/scripts/telecom.ts: case A-0145, user "Anita Verma", +919800000007, language
  "hi", company "Airtel", category "telecom_billing", ₹799 (79900) overcharged on the postpaid bill, incidentDate 2026-09-10,
  txnRef "BILL-5521907". Hindi intake -> matchRule (R3 is NOT verified, so the agent must make NO legal claim and just asks
  for a docket number, using match.pushBackLine) -> company gives docket "AIR-339812", correction by 2026-10-05 ->
  commitment -> promised -> Hindi report-back (buildReportScript) -> SMS (buildSmsSummary). 45–90 s.
  Register it in index.ts AFTER refusal (order: quick, upi, ecom, refusal, telecom).
TASK 4: Voice lines for the LIVE phone agent (Rayan will use these). Create src/content/voice.ts:
    export function intakeGreeting(lang: Lang): string            // first thing the AI says when the user calls: greet,
                                                                   // say it's Advocall, an AI assistant, ask what happened
    export function confirmCaseLine(input: CaseInput, lang: Lang): string  // reads back company, amount (formatINR),
                                                                   // date (formatDate) and the reference SPELLED with hyphens
                                                                   // (e.g. "U-P-I-4-8-2-9-3-0-1"), then asks "is that correct?"
    export function disclosureLine(userName: string): string      // English: "Hello, I'm an AI assistant calling on behalf
                                                                   // of <name>, who is available to verify if needed."
    export function callbackPromise(lang: Lang): string           // "I'll call the company now and call you back with the result."
  en / hi (Devanagari) / kn (Kannada script). Add ONE export line to src/content/index.ts (don't change existing lines).
TASK 5: Self-check script src/content/check.ts using node:assert: every voice function for all 3 languages returns non-empty
  text with no "undefined"/"null"/"NaN"; hi contains Devanagari; kn contains Kannada script; confirmCaseLine contains the
  spelled reference and formatINR amount. Prints "ALL CONTENT CHECKS PASSED". Run: npx tsx src/content/check.ts
TASK 6: New dashboard labels (Vaishnavi needs them). Add these keys to en, hi AND kn in src/content/strings.ts:
  caseList "Cases", caseDetail "Case detail", liveOps "Live operations", amountDisputed "Amount disputed",
  customer "Customer", reference "Reference", callProgress "Call progress", commitment "Commitment",
  waitingTicket "Waiting for ticket number…", escalationPacket "Escalation packet", copyLetter "Copy letter",
  copied "Copied", smsSent "SMS sent to user", noTranscript "No conversation yet", computedByEngine "Computed by rights
  engine, not by AI", noLegalClaim "No legal claim, standard complaint only", source "Source", intakeCall "Intake call",
  advocateCall "Call to company", reportCall "Report-back call", activeCases "Active cases", committed "Committed",
  callsMade "Calls made", present "Present".
TASK 7: QA. Create team/YASO_TEST_MATRIX.md from the table in team/MANUAL_YASO.md and run rows 1–7 on your local copy
  (write Pass/Fail + notes for each). Also play all 5 demos on http://localhost:3000/dev and note anything odd.

=== CHECKS after every task ===
npm run test:mock  AND  npm run test:content  AND  npm run typecheck  AND  npm run lint  AND
npx tsx src/content/check.ts (once it exists). All must pass before saving. Never weaken or edit tests.

=== SAVE STEP after every task ===
git status -> restore every changed file outside src/mock/, src/content/ and team/YASO_* with git checkout -- <file>
git add -A
git commit -m "yaso: task N - <short description>"
git push origin yaso
Then check it arrived: git log origin/yaso --oneline -1  (must show that commit). NEVER push to main.

=== FINISH ===
Write team/YASO_STATUS.md: each task Done / Partly / Not done, what changed, bugs found for Vaishnavi/Rayan.
Save + push it. Then tell me "ALL DONE" with a 5-line summary.

Later (after Rayan's 18:00 merge): record backup video #1 of the upi demo on the dashboard (Win + Alt + R).
```
