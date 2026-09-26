# Checkpoint pre-audit (Claude Code, 26 Sep, read-only, last refresh ~15:35)

Nothing is merged yet. The teammate branches are untouched; Rayan says "review" to merge.

## Status per person
| Person | Pushed | Files outside their folders? |
|---|---|---|
| **Agastya** | tasks 1–4 (explainer, `timeline.ts`, `summary.ts`, `check.ts`). Was at 0 pushes at 15:15, fixed by 15:35 | none ✅ |
| **Vaishnavi** | tasks 1–8 + `VAISHNAVI_STATUS.md` (finished) | none ✅ |
| **Yaso** | tasks 1–7 (language review, realism, telecom demo, `voice.ts`, `content/check.ts`, strings, test matrix) | none ✅ |

**Trial merge of all three (scratch, then restored):** `npm test` **77/77**, typecheck clean, lint clean.

## Must fix at merge (Claude Code does it)
1. **Vaishnavi `SmsPreview`: "Delivered to handset" is not true.** We only display the SMS text. Change it to "SMS text (preview)". **Honesty, must fix.**
2. Hard-coded English literals ("Newest first", "Not agreed", "Copy letter", …): wire them to Yaso's new `t()` keys.
3. Two hard-coded `#22d3ee` glow shadows: use the accent token (minor).
4. Browser (Plan B) cases store `userPhone: "web"`, so the escalation letter would read "Contact: web.". Handle it in the letter or the orchestrator.

## Contract lock to tell Yaso (next prompt)
`tests/voice.test.ts` checks that live calls emit the **same event order** as `upi.ts` and `refusal.ts` (ignoring transcript lines and call states).
**Yaso may change any wording in those two scripts, but not the order or kind of events** (created → calls → matched → statuses → commitment → sms → escalation). Adding or removing `say`/`state` lines is fine.

## Rayan's part (voice): DONE and pushed to main
- `src/lib/voice/*`: live pipeline (intake → rights engine → advocate call → report-back → SMS/escalation), same events as the mock demos.
- `/dev` → **Live voice** panel: "simulate live" works now with no keys; "call me" works once `.env.local` is filled.
- `/talk`: Plan B browser calls (no Twilio needed).
- `npm run voice:check` + `team/RAYAN_LIVE_SETUP.md`.
- ⚠️ Everything has been proven against a **fake Vapi** only. The first real step is `npm run voice:check`.
