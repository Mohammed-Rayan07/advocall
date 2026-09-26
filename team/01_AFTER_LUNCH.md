# 01: AFTER LUNCH (everyone reads this before continuing)

## What happened at the 13:00 checkpoint
Rayan + Claude Code merged everything into `main` and tagged it **`golden-v1`**. The full demo now works on the dashboard:
- ✅ **Rights engine** (R1 UPI + R2 e-commerce, verified against the RBI circular and the E-Commerce Rules 2020; escalation letter; call brief): all tests green
- ✅ **Demo scripts** `quick`, `upi` (hero, Hindi → English → Hindi), `ecom`, `refusal` (Kannada, 2 push-backs → escalation)
- ✅ **SMS + report-back texts** in English / Hindi / Kannada, and all UI labels translated
- ✅ **Dashboard shell** (Vaishnavi's header, stats, status badges, empty state): merged as is. Good work.

Your old local folder is **out of date**. Follow Step 1 exactly, then do only YOUR section below.

---

## STEP 1: Fresh start (everyone, 5 min)

1. In Antigravity: **stop `npm run dev`** (click in that terminal, press `Ctrl + C`), then **close Antigravity completely**.
2. In File Explorer, **delete** the folder `Desktop\hackathon\advocall`. (Everything you did is already safely in `main`.)
3. Open Antigravity on the `Desktop\hackathon` folder again, open the Agent chat, and paste (replace YOURNAME):
```
Do this in the terminal, step by step, inside my current folder, and show me each result:
1. git clone https://github.com/Mohammed-Rayan07/advocall.git
2. cd advocall
3. git checkout YOURNAME        (my branch already exists on GitHub and now contains the latest team version)
4. git log --oneline -3          (the top lines should mention "golden-v1" / "Checkpoint 13:00")
5. npm install                   (only exactly this; never install other packages)
6. npm test                      (tell me the summary: everything should PASS now)
7. Start in a separate terminal that keeps running: npm run dev
```
4. **File → Open Folder → `Desktop\hackathon\advocall`** (so the AI sees the project and AGENTS.md). Start `npm run dev` again in a terminal if it's not running.
5. Open http://localhost:3000, click **Run demo → UPI Hero dispute**, and watch the whole story play. ✅ If you see it, you're synced.

---

## AGASTYA: you now own and defend the rights engine
Your module was built at the checkpoint to your manual's spec. Your job now: **own it, harden it, and be able to defend every line to the judges.**

**Prompt A1: Understand it (no code changes)**
```
Read AGENTS.md, team/MANUAL_AGASTYA.md and everything in src/lib/rules/. Explain to me, in simple words, how matchRule,
buildEscalationPacket and buildCallBrief work, with the exact numbers for this example: ₹4,500 failed UPI on 22 Sep,
today 27 Sep. Then write that explanation as a 1-page judge-friendly doc in team/RIGHTS_ENGINE_EXPLAINER.md
(you may create that file). Do not change any code.
```
**A2: Verify R3 (TRAI), 20 minutes max.** Open the official *Telecom Consumers Complaint Redressal Regulations, 2012* (trai.gov.in) and find the complaint-centre and appellate-authority timelines. If you can confirm them, paste:
```
In src/lib/rules/data.ts update R3 with these verified facts: [PASTE TIMELINES + OFFICIAL URL]. Set verified: true,
write summary and citeText from them, and in engine.ts give R3 a deadline = incidentDate + [N] days and a claimable
pushBackLine that mentions TRAI. Update docs/RULEBOOK.md R3 with the source and "Verified by Agastya on 26 Sep 2026".
Run npm run test:rules and npm run typecheck and show results. All must pass.
```
If you can't confirm them, **leave R3 unverified.** That's the safe, honest choice, and the agent simply won't cite it.

**A3: Read the escalation letter** on the dashboard (run the upi demo, then Escalate) and on `/dev`. If any wording is wrong or weak, tell the AI exactly what to change in `src/lib/rules/escalation.ts`, then run `npm run test:rules`.

**Non-code (most important for you now):** the Q&A cheat sheet, the bank-rep script (you play HDFC's "Priya": brush-off first, then give **CMP88213**, reversal by **29 Sep**), and the pitch with Vaishnavi.

---

## VAISHNAVI: continue the dashboard
Your shell is merged. **Continue your manual from Prompt 3** (`team/MANUAL_VAISHNAVI.md`). All four demos now exist, so use **UPI Hero dispute** for testing.
Before Prompt 3, paste this:
```
Read AGENTS.md and team/MANUAL_VAISHNAVI.md again. The dashboard shell (Header, StatsBar, StatusBadge, EmptyState, Dashboard)
is done and merged. Now continue with Prompt 3 of my manual. Note: Dashboard.tsx currently has the case list and the
detail/transcript sections inline as placeholders; move them into the proper component files from the Components table
(CaseList, CaseHeader, RuleCard, ...), replacing each placeholder as we go. Show incident dates with formatDate, not raw
"2026-09-22". Also add the "ecom" and "refusal" entries to the EmptyState buttons if useful.
```
Then Prompts 3 → 4 → 5 → 6 → 7 in order. The **upi** demo is the one judges will see, so make the ticket "moment" (CommitmentCard) and the live transcript beautiful.

---

## YASO: QA lead + make the demos feel real
Your scripts and texts were built at the checkpoint to your manual's spec. Now **polish and test.**

**Prompt Y1: Language review**
```
Read AGENTS.md, team/MANUAL_YASO.md, src/content/* and src/mock/scripts/*. List every Hindi and Kannada sentence in
these files in a table (file, speaker, text, English meaning). Do not change anything yet.
```
Read the table yourself. Anything that sounds unnatural? Tell the AI: *"Change line X to: …"* then run `npm test`.

**Prompt Y2: Realism pass**: paste **Prompt 5** from your manual (it keeps all tests passing).

**Y3: QA (your main job this afternoon).** Create `team/TEST_MATRIX.md` from your manual's table and run rows 1–7 against the dashboard **every time Vaishnavi pushes** (pull main after each merge). Log bugs on the bug board with screenshots.

**Y4:** ~20:30, record **backup video #1** of the UPI demo on the dashboard (Win + Alt + R).

---

## Next checkpoints (same hand-in steps as before, see 00_SETUP_AND_GIT.md)
**17:00 · 20:00 · 21:45 (final)** → push to YOUR branch, WhatsApp "pushed ✅".
