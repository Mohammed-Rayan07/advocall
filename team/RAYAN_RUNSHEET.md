# RAYAN: Lead run-sheet (you + Claude Code)

## Who owns what
| Person | Module | Folders | Proof it works |
|---|---|---|---|
| **Rayan + Claude Code** | Contract, event bus/SSE, demo player, **voice (Vapi) live path**, webhooks, assistants, outbound calls, integration, final audit | everything else | live call → dashboard |
| Agastya | Rights engine + escalation letter + call brief | `src/lib/rules/**`, `docs/RULEBOOK.md` | `npm run test:rules` |
| Vaishnavi | Dashboard UI | `src/app/page.tsx`, `src/components/**` | the page itself |
| Yaso | Mock demos + SMS/report text + UI translations + QA | `src/mock/**`, `src/content/**` | `npm run test:mock`, `npm run test:content` |

**Already done (commit `fc4a277`):** Next.js 16 scaffold, locked types, event bus, SSE `/api/stream`, demo player `/api/demo/start`,
escalate endpoint, `/dev` pipeline page, stubs + **acceptance tests** for all three modules, `AGENTS.md`/`GEMINI.md` guardrails, manuals.
The mock pipeline has been tested end to end: quick demo → SSE → reducer → escalate.

## Do right now (5 min)
1. GitHub → repo **Settings → Collaborators → Add people**: add all three GitHub usernames (they must accept the email invite).
2. Send the team the WhatsApp message at the bottom of this file.

## Timeline (revised: we're starting at ~11:45, not 8:30)
| Time | You + Claude Code | Team |
|---|---|---|
| 11:45–13:00 | **V1** Vapi client + assistants script + webhook (tool calls → events) | setup + prompts 1–4 |
| 13:00 | **Merge #1** (take whatever passes) → tag `golden-v1` (mock golden path on dashboard) | hand in checkpoint |
| 13:30–16:30 | *you're away* | keep going: prompts 5–7, deck, Q&A, test matrix on `golden-v1`. **Nobody touches main / .env** |
| 16:30–17:00 | **Merge #2** | hand in checkpoint |
| 17:00–20:00 | **V2** live intake → advocate → report path with real phones; Agastya plays the bank | pull main, fix visuals on real data, rehearse |
| 20:00 | **Merge #3** + first backup video | |
| 20:00–21:45 | **V3** voice polish, web-call fallback button, latency | polish |
| 21:45 | **Merge #4 (final)** → **22:00 FEATURE FREEZE**, tag `demo-v1` | |
| 22:00→ | bug fixes only · 3 timed rehearsals · backup video #2 · submit 1h early | |

Cut order if behind: warm transfer → IVR/hold realism → R3 → web-call fallback. **Never cut:** mock `upi` demo, dashboard, rules engine, backup video.

## Merge procedure (folder-only, so conflicts are impossible)
Ask Claude Code: **"merge <name>"**. What it does:
```bash
git fetch origin
git checkout main
git checkout origin/agastya -- src/lib/rules docs/RULEBOOK.md
git checkout origin/vaishnavi -- src/app/page.tsx src/components
git checkout origin/yaso -- src/mock src/content
npm test && npm run typecheck && npm run lint
```
For a zip: unzip into a scratch folder, copy only their folders over, then run the same checks.
Then Claude Code audits the diff (correctness, no forbidden edits, no `any`, no hacks) → fix → commit → push → tell the team "main updated".
Teammates then pull main (setup guide §D).

## Your voice units (prompts for Claude Code)
- **V1:** `src/lib/voice/vapi.ts` (REST: create outbound call with assistantOverrides.variableValues) · `scripts/vapi-setup.ts`
  (creates/updates `advocall-user` + `advocall-advocate` assistants, Hindi/English, tools: `create_case`, `record_commitment`,
  `set_call_state`, `end_call`) · `POST /api/vapi/webhook` → tool-calls, status-update, transcript, end-of-call-report → `emit()` the SAME events as the mock scripts.
- **V2:** chain it: `create_case` → `matchRule` → emit → start advocate call with `buildCallBrief` → `record_commitment` →
  on advocate end-of-call → start report call with `buildReportScript` → `message.sent` with `buildSmsSummary`.
- **V3:** Vapi Web SDK "talk in browser" fallback, prompt tone, latency, `MODE=live|mock` switch.

---

## WhatsApp message to send the team

> **Advocall build is live 🚀** Repo: https://github.com/Mohammed-Rayan07/advocall
> Each of you owns ONE module, with your own manual and ready-made Antigravity prompts:
> • **Agastya** → `team/MANUAL_AGASTYA.md` (Rights engine, the legal brain + pitch/Q&A)
> • **Vaishnavi** → `team/MANUAL_VAISHNAVI.md` (Live dashboard + deck)
> • **Yaso** → `team/MANUAL_YASO.md` (Demo engine + Hindi/Kannada content + QA lead)
> **Step 1 for everyone:** `team/00_SETUP_AND_GIT.md` (install Node 22 + Git, clone, `npm install`, `npm run dev`, open localhost:3000/dev, click ▶ quick).
> **Rules:** edit ONLY your folders (anything else gets auto-discarded at merge) · never edit tests · never `npm install <pkg>` · stuck for 15 min → screenshot to me.
> **Hand-in checkpoints:** 13:00 · 17:00 · 20:00 · 21:45. GitHub push to your branch (accept my collaborator invite), or zip your folders.
> I'm away 13:30–16:30, so keep going on your prompts. Nobody touches main.
