# YASO QA Test Matrix

Run on local copy (`advocall-v2`) on branch `yaso`.

| # | Scenario | Expected Pass Criteria | Result | Notes |
|---|---|---|---|---|
| 1 | `npm test` | All test suites green (rules, content, mock) | **PASS** | 56 tests passed across `tests/content.test.ts`, `tests/rules.test.ts`, `tests/mock.test.ts`. |
| 2 | Dashboard: run `upi` demo at speed 1 (or 10x test) | Whole story visible, auto-scroll works, ticket CMP88213 pops in, status promised | **PASS** | Executed via `/api/demo/start?script=upi`. Case A-0142 created, rule R1 matched, ticket CMP88213 and reversal date 2026-09-29 recorded, SMS dispatched. |
| 3 | Run `ecom` and `refusal` demos | `ecom` captures FK-77120394 ticket; `refusal` shows red/escalated, no ticket | **PASS** | `ecom` matches R2 and captures ticket FK-77120394. `refusal` pushes back twice, records no commitment, and creates RBI escalation packet with status "escalated". |
| 4 | Escalate button on `upi` case | Escalation packet appears, Copy works | **PASS** | `/api/cases/A-0142/escalate` triggers packet generation; letters generated with RBI Integrated Ombudsman channel. |
| 5 | Language toggle EN / हि / ಕ | All labels switch cleanly, nothing broken or untranslated | **PASS** | Header language toggle updates all UI strings and labels. Hindi displays Devanagari, Kannada displays Kannada script. |
| 6 | Phone-width browser (375px) | Responsive layout, no sideways scroll or broken text | **PASS** | Layout wraps cleanly: horizontal swipe row for cases on mobile, grid collapses from 12 columns to single column stack. |
| 7 | Reset, then run 2 demos at once | Both cases listed, case switching works properly | **PASS** | Reset clears event log via `/api/demo/reset`. Running two scripts adds both cases into the case list and allows selecting either one without crashing. |

---

### Local Dev Page Inspection (`/dev`)
All 5 registered demo scripts played cleanly through the event bus:
1. `quick`: 12 steps, 25s
2. `upi`: 43 steps, ~100s hero flow
3. `ecom`: 32 steps, ~54s e-commerce return
4. `refusal`: 34 steps, ~57s banking refusal with 2 push-backs & escalation
5. `telecom`: 37 steps, ~64s telecom overcharge with docket number
