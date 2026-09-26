# 00: Setup + how to hand in your work (everyone reads this first)

You do NOT need to know coding. Antigravity writes the code. Your job is to:
1. paste the prompts from your manual **in order**,
2. run the **check** after each prompt and make sure it passes,
3. hand in your work at every **checkpoint**.

---

## A. One-time setup (15 min)

1. Install **Node.js 22 LTS** from https://nodejs.org (click the LTS button, then Next, Next, Finish).
2. Install **Git for Windows** from https://git-scm.com/download/win (all defaults).
3. Open **Antigravity**, open a terminal inside it, and run these one by one:

```bash
node -v
```
It must print `v20.9` or higher (v22 is ideal).

```bash
git clone https://github.com/Mohammed-Rayan07/advocall.git
```

```bash
cd advocall
```

Now create YOUR branch. Use your own name, lowercase: `agastya`, `vaishnavi` or `yaso`.
```bash
git checkout -b yourname
```

```bash
npm install
```
(Takes 1–3 minutes. Warnings are fine. A red `ERR!` is not: send a screenshot to Rayan.)

4. In Antigravity: **File → Open Folder → the `advocall` folder**.
5. Start the app:
```bash
npm run dev
```
Open http://localhost:3000/dev in Chrome and click **▶ quick**. Events should appear on the page within a few seconds.
**If you see them, your setup works.** Leave `npm run dev` running in its own terminal tab.

---

## B. Golden rules

- Only edit files in **your folders** (see your manual). At merge time Rayan copies only your folders; **everything else you change is deleted automatically.**
- **Never** edit `src/types/`, `tests/`, `src/lib/core/`, `package.json`, `.env*`.
- **Never** run `npm install something`. Everything is already installed.
- **Never** weaken or delete a test to make it pass. Fix the code.
- If Antigravity says it "needs" to change a locked file, answer: *"No. Write the request in team/REQUESTS_<myname>.md instead and continue within my folders."*
- Stuck for more than 15 minutes? Message Rayan with a screenshot. Don't lose an hour.

---

## C. Handing in your work at each checkpoint

**Checkpoints: 13:00 · 17:00 · 20:00 · 21:45 (final, before the 22:00 feature freeze).**

### Option 1: GitHub (preferred)
Rayan must first add you as a collaborator (accept the email invite from GitHub). Then paste this into Antigravity:

> Run these git commands for me in the terminal and show me the output: `git add -A`, then `git commit -m "<myname>: checkpoint"`, then `git push -u origin <mybranch>`. If push fails with a permission error, stop and tell me.

Then send Rayan "pushed ✅" on WhatsApp.

### Option 2: Zip (if GitHub push fails)
Zip **only your folders** (listed in your manual) and send the zip to Rayan on WhatsApp/Drive, with the message "zip checkpoint <time>".
Do NOT zip `node_modules` (it's huge).

---

## D. Getting Rayan's latest version (after each checkpoint)
After Rayan says "main updated", paste into Antigravity:

> Run in the terminal: `git add -A`, `git commit -m "wip"` (fine if nothing to commit), then `git pull origin main --no-edit`. If there is a merge conflict in a file that is NOT in my folders, keep the version from main (`git checkout --theirs <file>`). If the conflict is in my folders, show it to me. Then run `npm install` and `npm test` and show the summary.
