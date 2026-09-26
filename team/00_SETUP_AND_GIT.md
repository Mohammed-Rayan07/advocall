# 00: START HERE (Agastya, Vaishnavi, Yaso)

You don't need to know coding or GitHub. **Antigravity does the work; you copy-paste the prompts below, in order.**
After each prompt, wait until Antigravity finishes, then check the ✅ line. If it's not ✅, paste the "If it fails" prompt.
Stuck for more than 15 minutes? Screenshot → WhatsApp Rayan.

**Your name in this guide:** wherever you see `YOURNAME`, type your own name in lowercase: `agastya`, `vaishnavi` or `yaso`.

---

## STEP 1: GitHub account + invite (5 min, in Chrome)

1. Go to https://github.com/signup and create a free account (skip this if you already have one).
2. **WhatsApp your GitHub username to Rayan.** He'll add you to the project.
3. Check your email for **"invited you to collaborate on Mohammed-Rayan07/advocall"** → click **Accept invitation**.
   (Didn't get it yet? Continue with the steps anyway and accept it when it comes. You only need it at the first checkpoint.)

---

## STEP 2: Open Antigravity in a fresh folder

1. On your Desktop, create a new empty folder called **`hackathon`**.
2. Open **Antigravity** → **File → Open Folder** → pick the `hackathon` folder.
3. Open the **Agent chat panel** (where you talk to the AI). If it asks for a mode, pick the one that lets it **run terminal commands** (Agent mode). When it asks permission to run a command, click **Accept / Run**.

---

## STEP 3: Install the tools (copy-paste this whole prompt)

```
I am on Windows and I am not a programmer. Please set up my computer for a Next.js project. Do everything yourself in the terminal, one step at a time, and tell me what happened in simple words:

1. Check if Git is installed by running: git --version
   If it is NOT installed, install it with: winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
2. Check if Node.js is installed by running: node -v
   It must be version 20.9 or higher (v22 is best). If it is missing or older, install it with:
   winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements
3. If you installed anything, tell me to CLOSE Antigravity completely and open it again (so the new tools are found), then stop.
4. If both were already installed, print both versions and say "READY".
```
✅ **Check:** it says **READY** and shows versions like `git version 2.x` and `v22.x`.
If it told you to restart: close Antigravity fully, reopen it on the `hackathon` folder, and **paste the same prompt again** until it says READY.

**If `winget` doesn't work:** install manually. Node: https://nodejs.org (click the big **LTS** button → Next → Next → Finish). Git: https://git-scm.com/download/win (all defaults). Then restart Antigravity and paste Step 3 again.

---

## STEP 4: Download the project and run it (copy-paste, replace YOURNAME first!)

```
Please do all of this yourself in the terminal, inside my current folder, step by step, and show me the result of each step:

1. Set my git identity (needed to save work):
   git config --global user.name "YOURNAME"
   git config --global user.email "YOURNAME@advocall.dev"
2. Download the project:
   git clone https://github.com/Mohammed-Rayan07/advocall.git
3. Go into it:  cd advocall
4. Create my personal branch:  git checkout -b YOURNAME
5. Install the project's packages (takes 1-3 minutes, warnings are fine):  npm install
   IMPORTANT: only run exactly "npm install" with nothing after it. Never install any other package.
6. Run the tests just to see they run:  npm test
   (Many tests will FAIL. That is expected, because the code isn't written yet. Only tell me if the command itself crashed.)
7. Start the app in a SEPARATE terminal that keeps running:  npm run dev
8. When it says "Ready", tell me to open http://localhost:3000/dev in Chrome.
```
✅ **Check:** in Chrome, http://localhost:3000/dev opens. Click **▶ quick**. Within a few seconds a case "A-0100" and a list of events appear. **Your setup works.**

**If it fails:**
```
The last step failed. Read the error message, explain it to me in one simple sentence, and fix it. Do not install any extra npm packages and do not change any project files to fix setup problems.
```
Common: *"port 3000 in use"* → the app is already running, just open the link. *"npm is not recognized"* → restart Antigravity (Step 3).

---

## STEP 5: Re-open Antigravity INSIDE the project folder (important!)

1. **File → Open Folder** → go into `Desktop\hackathon\advocall` → **Select Folder**.
   (Now the AI can see the project files and the rules file `AGENTS.md`.)
2. Open a terminal in Antigravity and start the app again (keep this terminal running all day):
```
npm run dev
```
3. Check you're on your own branch. Paste into the Agent chat:
```
Run "git branch" in the terminal and tell me which branch I'm on. If I am on "main", run "git checkout YOURNAME" (create it with "git checkout -b YOURNAME" if it doesn't exist).
```
✅ **Check:** it says you're on branch **YOURNAME** (not main).

---

## STEP 6: Start your real work

Open your manual (it's inside the project, in the `team` folder) and start pasting its prompts from **Prompt 1**:
- Agastya → `team/MANUAL_AGASTYA.md`
- Vaishnavi → `team/MANUAL_VAISHNAVI.md`
- Yaso → `team/MANUAL_YASO.md`

Tip: you can also just tell Antigravity: *"Open team/MANUAL_YASO.md and show me Prompt 1."*

---

## GOLDEN RULES (the AI already knows these from AGENTS.md, but YOU should know them too)

- Only your folders get used. Anything the AI changes outside them is **thrown away** at merge.
- Never let it edit `tests/`, `src/types/`, `src/lib/core/`, `package.json`, `.env`.
- Never `npm install <something>`.
- If the AI says a test is wrong and wants to change it → answer: **"No. Tests are locked. Fix the code."**
- Save your work often (next section).

---

## SAVE + HAND IN YOUR WORK (every checkpoint: 13:00 · 17:00 · 20:00 · 21:45)

### Save and send to GitHub (copy-paste)
```
Save my work to GitHub. Run in the terminal, one by one, and show the output:
git add -A
git commit -m "YOURNAME: checkpoint"
git push -u origin YOURNAME
If the push asks me to sign in, tell me to click "Sign in with your browser" and log in to GitHub, then try the push again.
If it says "permission denied" or "403", tell me: "Rayan hasn't added you yet or you haven't accepted the invite", and then do the ZIP option instead.
```
✅ **Check:** the output ends with something like `YOURNAME -> YOURNAME`. WhatsApp Rayan: **"pushed ✅"**.

### ZIP option (if GitHub push doesn't work)
Replace the folders with YOUR folders: Agastya `src/lib/rules docs/RULEBOOK.md` · Vaishnavi `src/app/page.tsx src/components` · Yaso `src/mock src/content`
```
Create a zip of ONLY these paths from the project: <MY FOLDERS>. Use PowerShell:
Compress-Archive -Path <MY FOLDERS separated by commas> -DestinationPath "$HOME\Desktop\YOURNAME-checkpoint.zip" -Force
Do not include node_modules. Tell me where the zip file is.
```
Then send `YOURNAME-checkpoint.zip` from your Desktop to Rayan on WhatsApp.

---

## GET RAYAN'S LATEST VERSION (when he says "main updated")
```
Get the latest team version into my branch. Run one by one:
git add -A
git commit -m "wip"          (it's fine if it says nothing to commit)
git pull origin main --no-edit
If there is a merge conflict in a file that is NOT in my folders, keep main's version with: git checkout --theirs <file>, then git add <file>.
If the conflict is in MY folders, show it to me and ask which version to keep.
Then run: git commit --no-edit (if needed), npm install, npm test. Show me the test summary.
Finally tell me to restart "npm run dev" (Ctrl+C in that terminal, then npm run dev again).
```
