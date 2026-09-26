# 03: EVENING (after the checkpoint merge)

## What happened at the merge
Everything from all three branches is in `main`, fixed and tested: **78/78 tests, typecheck, lint, production build, both self-checks green.**
- **Vaishnavi:** the full dashboard is merged. Every label now switches between English, Hindi and Kannada. There's a new "Live call" button and a "Your rights timeline" card, and it fits phones and projectors.
- **Yaso:** telecom demo, voice lines, labels and test matrix merged. The telecom demo is now in the **Run demo** menu, and the live agent uses your disclosure line.
- **Agastya:** timeline and summary merged and shown on the dashboard. Your interrupted final audit was **completed for you** (see the end of `team/AGASTYA_STATUS.md`). The pitch, Q&A and bank-rep script were corrected so they never claim something the prototype doesn't do.

⚠️ **Code in your folders changed, so re-sync before doing anything (Step 1).**
🧊 **Feature freeze at 22:00.** From now on: **no new features**. Only fixes, content, rehearsal.

---

## STEP 1: Re-sync (everyone, 3 min). Paste into Antigravity (replace YOURNAME)
```
In the terminal, inside my advocall-v2 folder, step by step, show me each result:
1. git status
   If ANY files are changed or untracked, run: git stash -u   (the merge already contains a finished version of my work)
2. git fetch origin
3. git checkout YOURNAME
4. git pull origin YOURNAME          (fast-forward: my branch now equals the merged main)
5. git log --oneline -3              (the top lines must mention "Merge fixes" and "Checkpoint merge")
6. npm install
7. npm test                          (must say 78 passed)
Then restart npm run dev and open http://localhost:3000.
```
If step 4 errors, delete the `advocall-v2` folder and clone again exactly like the afternoon Part A.

**Agastya:** your interrupted Opus session may have left changes on your laptop. Step 1 stashes them. Do **not** re-apply them; the audit is done in `main`.

---

## VAISHNAVI: visual QA + deck (no new features)
```
Read AGENTS.md and team/03_EVENING.md. Do NOT add features. Only fix visual bugs inside src/components/**.
1. npm run dev. For EACH language (EN, हि, ಕ) and EACH demo in the Run demo menu (quick, UPI Hero, E-Commerce, Refusal,
   Telecom): check the dashboard at 1280x720 (projector) and in Present mode (press P). List every overlap, cut-off text,
   or wrong-language label in team/VAISHNAVI_EVENING_QA.md.
2. Fix only what is inside src/components/**. Labels come from t("key", lang) in src/content/strings.ts. If a label is wrong,
   DON'T edit strings.ts: write it in team/VAISHNAVI_REQUESTS.md.
3. After every fix: npm run typecheck && npm run lint && npm test, then the SAVE STEP (git status → restore files outside my
   folders → commit "vaishnavi: evening fix N" → git push origin vaishnavi).
```
**Non-code (main job now):** finish the deck, using screenshots of the **merged** dashboard in Present mode (UPI demo: the ticket card + transcript). Put the final PDF link in `team/VAISHNAVI_STATUS.md`.

## YASO: QA the merged app + review the new translations + backup video
```
Read AGENTS.md and team/03_EVENING.md.
1. Open src/content/strings.ts. About 90 new keys were added in hi and kn at the merge (from "demo:" down to "browserCall:").
   Review every Hindi and Kannada value for natural, correct phrasing. Fix only real mistakes (keep {n}, {id}, {s}, {leg},
   {t}, {d}, {to}, {title} placeholders EXACTLY). Run npm test and npx tsx src/content/check.ts.
2. Run every row of team/YASO_TEST_MATRIX.md against the merged app in all 3 languages, plus
   http://localhost:3000/dev → "simulate live: promise" and "simulate live: refusal". Write results in
   team/YASO_EVENING_QA.md (pass/fail + screenshot names).
3. IMPORTANT: in src/mock/scripts/upi.ts and refusal.ts you may change wording, but NOT the order or kind of events
   (a test locks them to the live pipeline).
4. SAVE STEP after each task (commit "yaso: evening N", push origin yaso).
```
**Backup video #1 (~20:30):** `npm run dev` → Reset → press **P** (Present) → Run demo → **UPI Hero dispute** → record with **Win + Alt + R** until the SMS appears. Save as `advocall_backup_upi.mp4` and send it to Rayan.

## AGASTYA: rehearse (you are the voice of the demo)
No code tonight. Read these three again: they were corrected to match the product:
- `team/AGASTYA_PITCH_SCRIPT.md`: time it 3 times, aim for 2:50. **Read numbers off the screen** (they change with the date).
- `team/AGASTYA_QA_CHEATSHEET.md`: learn answers 3, 10, 11, 12, 13 by heart (the honest ones judges probe).
- `team/AGASTYA_BANK_REP_SCRIPT.md`: when Rayan's live call works, you play "Priya". Remember: **press a key for the Twilio trial message, then YOU speak first** as the IVR, and read the ticket letter by letter.
If you spot anything in the rules or docs that's wrong, write it in `team/AGASTYA_REQUESTS.md` and push.

---

## Timeline to the end
| Time | Everyone |
|---|---|
| now → 20:00 | re-sync · Vaishnavi QA + deck · Yaso translations + QA · Agastya pitch · Rayan: live keys + first real call |
| 20:00 | merge #3 (fixes only) · first live rehearsal with Agastya as the bank |
| 20:30 | backup video #1 (Yaso) |
| 21:45 | final merge |
| **22:00** | **FEATURE FREEZE** → 3 timed full rehearsals, backup video #2, submit 1 hour early |
