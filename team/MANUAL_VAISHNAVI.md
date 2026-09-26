# MANUAL: VAISHNAVI · Live Dashboard (what the judges look at)

**Your mission:** build the screen that makes judges say "wow". While the AI is on the phone, this dashboard shows, **live**,
the case, the law that applies, the money at stake, every word of the call, and the ticket number the moment the bank gives it.

| | |
|---|---|
| **Your folders** (edit only these) | `src/app/page.tsx`, `src/components/**` |
| **Your branch** | `vaishnavi` |
| **Your pass/fail check** | open http://localhost:3000, run a demo, and it looks like the spec below. Plus `npm run typecheck` and `npm run lint` print no errors |
| **Non-code job** | Pitch deck (10 slides) |

First do **team/00_SETUP_AND_GIT.md**. Then paste the prompts **one at a time**. After each prompt, look at the page yourself; you are the designer, so if it looks bad, say so.

---

## How the data works (Antigravity reads this too)

You never fetch data yourself. One hook gives you everything, live:

```tsx
"use client";
import { useCaseStream } from "@/lib/stream/useCaseStream";
const { cases, byId, events, connected, startDemo, reset } = useCaseStream();
// cases: CaseView[] (newest first). Each CaseView has:
//   case        { id, userName, company, category, amountPaise, incidentDate, txnRef, status, language, ... }
//   match       RuleMatch | null  { ruleId, rule{title, summary, citeText, sourceName, sourceUrl}, claimable, deadline,
//                                   daysLate, compensationPaise, totalAtStakePaise, explanation }
//   calls       [{ id, leg: "intake"|"advocate"|"report", status, advocateState, startedAt, endedAt, outcome }]
//   transcript  [{ callId, speaker: "agent"|"user"|"company", text, language, at }]
//   commitment  { ticketNo, promisedBy, compensationAck, confirmed } | null
//   escalation  { to, channelUrl, phone, subject, body, facts: [label, value][] } | null
//   messages    [{ at, to, language, text }]   (SMS sent to the user)
//   timeline    AdvocallEvent[]  (every event, oldest first: e.type, e.at, e.data)
// startDemo("quick" | "upi" | "ecom" | "refusal", speed)  plays a scripted case
// reset()  clears everything
```
Full types: `src/types/index.ts`. Helpers: `formatINR(paise)`, `formatDate("YYYY-MM-DD")`, `formatTime(iso)` from `@/lib/core/format`.
UI labels in 3 languages: `t("atStake", lang)` from `@/content` (Yaso fills the Hindi/Kannada text; you just call `t`).
If you need a label that has no key in `src/content/strings.ts`, write the English text directly in your component and add the key name + English text to `team/REQUESTS_vaishnavi.md`. Yaso will add the translations and Rayan will switch it to `t()` at merge.
Escalate button: `fetch("/api/cases/" + id + "/escalate", { method: "POST" })`. The result arrives by itself through the hook.

Right now only the **"quick"** demo exists. Yaso is adding `upi` (the full hero demo), `ecom` and `refusal`; they appear after the next merge.

---

## Design spec: "mission control for your complaint"

**Mood:** dark, calm, premium, like a trading terminal crossed with Linear. Lots of breathing room. **Money is gold, the AI is cyan, success is green, danger is red.**
**Tokens** (already defined in `src/app/globals.css`; use ONLY these, no random hex):
`bg-bg` page · `bg-surface` cards · `bg-surface-2` inner panels · `border-line` borders · `text-ink` main text · `text-muted` labels ·
`text-accent`/`bg-accent` cyan (AI, live) · `text-accent-2` indigo (user) · `text-good` · `text-warn` · `text-bad` · `text-money` gold ₹ ·
`font-mono` for ticket numbers, IDs, times · `rounded-card` (1rem) · `animate-pulse-dot` for live dots.
Icons: `lucide-react`. Animation: `import { motion, AnimatePresence } from "motion/react"`.

**Layout (desktop ≥1280px):**
```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ ● Advocall   Your AI advocate on hold…        [● Live]  [EN|हि|ಕ]  [▶ Run demo ▾]  [Reset] │  Header
├───────────────┬───────────────┬────────────────┬──────────────────────────────────────────┤
│ Active cases 3│ ₹ At stake    │ ₹ Committed    │ Calls made 7                              │  StatsBar (4 tiles)
│               │ ₹14,300 gold  │ ₹4,900 green   │                                           │
├──────────────┬┴───────────────┴───────────────┬┴──────────────────────────────────────────┤
│ CASE LIST    │ CASE DETAIL (selected)          │ LIVE TRANSCRIPT                          │
│ ┌──────────┐ │ A-0142 · HDFC Bank · Ravi Kumar │  🤖 Hello, I'm an AI assistant calling…  │
│ │A-0142 🟢 │ │ ₹4,500   [status: promised]     │                 Please wait 7-10 days 🏦 │
│ │HDFC ₹4.5k│ │ ┌ RULE APPLIED ──────────────┐  │  🤖 As per RBI's T+1 rule…               │
│ └──────────┘ │ │ R1 Failed UPI · RBI 2019 🔗│  │                 Complaint no CMP88213 🏦 │
│ ┌──────────┐ │ │ Deadline 21 Sep · 5 d late  │  │  (auto-scrolls, new bubbles slide in)   │
│ │A-0141 🟡 │ │ │ +₹500 comp · ₹5,000 at stake│  ├──────────────────────────────────────────┤
│ └──────────┘ │ │ "computed by code, not AI"  │  │ TIMELINE                                  │
│              │ └─────────────────────────────┘  │ 14:05:01 Case created                     │
│              │ CALL PROGRESS (advocate call)    │ 14:05:03 Rule R1 matched                  │
│              │ DISCLOSE→NAVIGATE→HOLD→STATE→ASK │ 14:05:04 Calling HDFC Bank…               │
│              │ →PUSH_BACK→VERIFY→CAPTURE→CLOSE  │ 14:05:40 Ticket CMP88213 captured ✅      │
│              │ ┌ COMMITMENT ─────────────────┐  │                                           │
│              │ │ Ticket  CMP88213 (big mono) │  │ SMS SENT TO USER                          │
│              │ │ By 29 Sep · comp. ack ✅     │  │ [phone-bubble with the SMS text]          │
│              │ └─────────────────────────────┘  │                                           │
│              │ [ Deadline missed → Escalate ]  │                                           │
│              │ ESCALATION PACKET (after click)  │                                           │
└──────────────┴─────────────────────────────────┴──────────────────────────────────────────┘
   ~22% width        ~42% width                          ~36% width
```
Below 1024px: stack vertically (stats 2×2, then case list as a horizontal scroll row, then detail, then transcript). No horizontal page scroll ever.

**Components** (each its own file in `src/components/dashboard/`, all `"use client"` where needed):

| File | Props | Must show |
|---|---|---|
| `Dashboard.tsx` | none | owns `useCaseStream()`, `selectedId` state (auto-select the newest case when a new case appears), `lang` state, lays out everything |
| `Header.tsx` | `connected, lang, onLang, onDemo(id), onReset` | logo mark (cyan dot + "Advocall" wordmark), tagline, Live/Offline pill with pulsing dot, EN/हि/ಕ segmented toggle, demo dropdown (quick, upi, ecom, refusal + a "fast ×5" option), reset |
| `StatsBar.tsx` | `cases` | 4 tiles: active cases (status not resolved/failed) · ₹ at stake (sum of `match.totalAtStakePaise`) · ₹ committed (sum of totalAtStake where commitment exists) · calls made. Numbers **count up** when they change |
| `CaseList.tsx` | `cases, selectedId, onSelect` | cards: id (mono), company, amount (gold), category icon (UPI→`Smartphone`, ecom→`ShoppingBag`, telecom→`Wifi`, other→`FileText`), `StatusBadge`, relative time. Selected card has a cyan left border + glow |
| `StatusBadge.tsx` | `status` | intake=indigo, open=muted, calling=cyan **with pulsing dot**, promised=green, resolved=green solid, escalated=warn, failed=red |
| `CaseHeader.tsx` | `view` | user name, company, big amount in gold, incident date, txn ref (mono), language chip |
| `RuleCard.tsx` | `match` (can be null → skeleton "Matching your rights…") | rule id chip + title, `citeText` as a quote, source link (↗), 3 mini stats: Deadline · Days late (red if >0) · Compensation (gold), total at stake. Small badge **"Computed by rights engine, not by AI"** with a `ShieldCheck` icon. If `claimable` is false: grey badge "No legal claim, standard complaint only" |
| `CallProgress.tsx` | `call` (the advocate-leg call, may be undefined) | 9-step horizontal stepper using `ADVOCATE_STATES` from `@/types`. Done steps = cyan filled, current = glowing pulse, future = muted. Show call status + duration timer while in progress. Also small chips for the intake and report calls (done/active) |
| `CommitmentCard.tsx` | `commitment` | Empty: "Waiting for ticket number…" with shimmer. Filled: ticket in **huge mono**, "promised by" date, compensation acknowledged ✅/❌, confirmed ✅. Animate in with a green glow when it first appears (this is the demo's "moment") |
| `EscalationPanel.tsx` | `view, onEscalate` | Button "Deadline missed → Escalate" (warn color). After click, show the packet: To, channel link, phone, facts table, letter body in a scrollable mono box, and a **Copy letter** button (`navigator.clipboard.writeText`) |
| `TranscriptPanel.tsx` | `lines, calls` | chat bubbles: agent = left, cyan tint, `Bot` icon; company = right, surface-2, `Building2` icon; user = right, indigo tint, `User` icon. Group by call with a small divider "Intake call / Call to HDFC Bank / Report-back call". New bubbles slide/fade in. **Auto-scroll to bottom** on new line. Hindi/Kannada text must render nicely (line-height 1.6) |
| `Timeline.tsx` | `events` | vertical list: time (mono, muted), icon + human sentence per event type (e.g. `rule.matched` → "Rule R1 matched · ₹5,000 at stake", `commitment.recorded` → "Ticket CMP88213 captured", `message.sent` → "SMS sent to +91…"). Newest at top |
| `SmsPreview.tsx` | `messages` | last SMS rendered like a phone notification bubble |
| `EmptyState.tsx` | `onDemo` | when no cases: big friendly illustration-ish block (icon composition), text `t("noCases")`, and a primary "Run demo" button |

**Quality bar:** consistent 8px spacing scale, cards `bg-surface border border-line rounded-card`, section titles small uppercase tracking-wide `text-muted`, generous padding, no text smaller than 12px, everything aligned. Numbers use `tabular-nums`. It must look good on a projector (high contrast, big key numbers).

---

## PROMPTS FOR ANTIGRAVITY (paste one at a time)

### Prompt 1: Orientation (no code yet)
```
You are working on the Advocall hackathon dashboard. Read completely: AGENTS.md, team/MANUAL_VAISHNAVI.md,
src/types/index.ts, src/lib/stream/useCaseStream.ts, src/lib/core/format.ts, src/content/strings.ts,
src/app/globals.css, src/app/page.tsx, src/components/dashboard/Dashboard.tsx and src/app/dev/page.tsx.

I own ONLY src/app/page.tsx and src/components/**. Never edit other files. Never run "npm install <package>".
Tailwind is v4: never create tailwind.config.js; use the color tokens from globals.css (bg-surface, text-accent, text-money, ...).
Next.js 16 + React 19.

Do not write code yet. Reply with: (1) the list of components you will build with their props,
(2) which CaseView fields each component uses, (3) your build order.
```
✅ **Check:** its component list matches the table in this manual.

### Prompt 2: Shell (header, stats, 3-column layout, empty state)
```
Build Dashboard.tsx, Header.tsx, StatsBar.tsx, StatusBadge.tsx and EmptyState.tsx exactly as specified in
team/MANUAL_VAISHNAVI.md (Design spec + Components table). Dashboard uses useCaseStream(), keeps selectedId
(auto-select the newest case when a new case id appears) and lang state ("en" | "hi" | "kn"), and renders the
3-column layout with placeholder boxes for the parts we build later. Use t(key, lang) from "@/content" for labels.
Use lucide-react icons and motion/react for the count-up numbers and fade-ins. Only use the design tokens.
Then run npm run typecheck and npm run lint, fix all errors, and tell me to open http://localhost:3000 and
choose "quick" in the demo menu.
```
✅ **Check:** page loads dark and clean, "Live" pill is green, running "quick" fills the stats tiles.

### Prompt 3: Case list + case header + rule card
```
Build CaseList.tsx, CaseHeader.tsx and RuleCard.tsx exactly as in the Components table of team/MANUAL_VAISHNAVI.md,
and wire them into Dashboard. RuleCard must handle match === null (skeleton) and claimable === false (grey badge).
Show the "Computed by rights engine, not by AI" badge with the ShieldCheck icon. Money in text-money with formatINR,
dates with formatDate. Run npm run typecheck and npm run lint, fix errors, then tell me what to check on screen.
```
✅ **Check:** after running "quick": the case card appears on the left, the rule card shows R1 (numbers may say STUB until Agastya's code is merged; that's fine).

### Prompt 4: Call progress + live transcript
```
Build CallProgress.tsx (9-step stepper from ADVOCATE_STATES in "@/types", with a live duration timer while the
advocate call is in progress, plus small chips for the intake and report calls) and TranscriptPanel.tsx
(chat bubbles grouped by call, agent left/cyan, company right, user right/indigo, slide-in animation with
AnimatePresence, auto-scroll to the newest line, line-height 1.6 for Hindi/Kannada). Wire into Dashboard.
Run typecheck + lint, fix errors. Then tell me to Reset and run "quick" at normal speed to watch it live.
```
✅ **Check:** during the quick demo the stepper moves DISCLOSE → STATE_CASE → PUSH_BACK → CAPTURE → CLOSE, and bubbles appear one by one and auto-scroll.

### Prompt 5: Commitment, escalation, timeline, SMS
```
Build CommitmentCard.tsx (the big "moment": ticket number huge in mono, green glow animation when it first appears),
EscalationPanel.tsx (warn-colored button that POSTs to /api/cases/{id}/escalate, then shows the packet: to, link,
phone, facts table, letter body in a scrollable mono box, Copy letter button with a "Copied" confirmation),
Timeline.tsx (human sentence per event type, icon per type, newest first) and SmsPreview.tsx. Wire them in.
Run typecheck + lint and fix errors.
```
✅ **Check:** after "quick" finishes, the ticket CMP88213 pops in with a glow; clicking Escalate shows a packet.

### Prompt 6: Polish pass (this is where it gets beautiful)
```
Polish the whole dashboard to a premium, projector-ready standard following the Design spec in team/MANUAL_VAISHNAVI.md:
- consistent spacing (8px scale), aligned card headers, section titles small uppercase tracking-wide text-muted
- subtle gradient/glow ONLY on: the Live dot, the active call step, the new commitment
- hover states on cards and buttons, focus-visible rings for keyboard users
- tabular-nums on all numbers; no text below 12px
- responsive: below 1024px stack vertically as the spec says; no horizontal page scroll at 375px width
- loading skeletons where data is not yet there
Do not add new dependencies. Run typecheck + lint and fix everything. Then list what you changed.
```
✅ **Check:** look at it at full screen AND narrow the browser to phone width. Both must look clean.

**→ Hand in (checkpoint), see team/00_SETUP_AND_GIT.md section C.** Folders for zip: `src/app/page.tsx`, `src/components`.

### Prompt 7 (after the 17:00 merge, when upi/ecom/refusal demos exist)
```
I pulled the latest main. Run each demo (upi, ecom, refusal) at normal speed while I watch. List every visual problem
you notice from the event data (long Hindi text overflowing, missing icons for an event type, wrong status colors,
the refusal case with no commitment, the report-back call grouping) and fix them, only in my folders.
Run typecheck + lint.
```

---

## Recovery prompts

- **It created `tailwind.config.js` or used colors like `bg-gray-900`:** `Delete tailwind.config.js. Tailwind v4 is configured in src/app/globals.css. Replace every non-token color class with our tokens (bg-bg, bg-surface, bg-surface-2, border-line, text-ink, text-muted, text-accent, text-good, text-warn, text-bad, text-money).`
- **"Module not found: framer-motion":** `We use the "motion" package: import { motion, AnimatePresence } from "motion/react". Never install packages.`
- **Hydration error in the browser:** `Make every component that uses hooks, motion, or browser APIs a client component with "use client" at the top. Don't render Date.now() or random values during the first render.`
- **Page is blank / red error:** copy the error text from the browser and paste it: `Fix this error, only editing my folders: <error>`
- **It edited a file outside your folders:** `Revert all changes outside src/app/page.tsx and src/components using git checkout -- <file>. Show git status.`

---

## Your non-code job: Pitch deck (10 slides)
Problem (₹ stuck + hours on hold) → Who suffers (non-English speakers, elderly) → Advocall in one line → Live demo slide
(just "DEMO" big) → How it works (voice → rights engine → advocate call → report) → Rights engine = trust (code, cited sources) →
Safety (disclosure, no OTP, warm transfer, max 2 push-backs) → vs Pine AI / Google (India, Hindi/Kannada, legal rights) →
Impact + business model → Team (Rayan as Lead Engineer & Architect). Use screenshots of YOUR dashboard.
