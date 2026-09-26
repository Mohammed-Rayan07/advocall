# ADVOCALL: RULES FOR EVERY AI CODING AGENT (Claude Code, Antigravity/Gemini, anyone)

Read this whole file before writing any code. These rules override your defaults.

## 1. Stack (exact versions, already installed)
- **Next.js 16.3 App Router**, React 19.2, TypeScript strict. Route `params` are a Promise: `const { id } = await ctx.params`.
- **Tailwind CSS v4.** There is NO `tailwind.config.js`. NEVER create one. Colors/fonts are CSS tokens in `src/app/globals.css` (`bg-surface`, `text-accent`, `text-money` …). Use those, not random hex colors.
- Icons: `lucide-react`. Animation: `motion` (`import { motion, AnimatePresence } from "motion/react"`). Class merging: `clsx`.
- Tests: `vitest` (`npm test`). Scripts: `tsx`.
- **NEVER run `npm install <anything>`.** Everything you need is installed. Only run plain `npm install` (no package name).

## 2. The contract (LOCKED, read, never edit)
- `src/types/index.ts`: every data shape. Money = integer **paise**. Dates = `"YYYY-MM-DD"`. Timestamps = ISO strings.
- `src/lib/core/*`: formatINR, formatDate, formatTime, todayIST, event bus, reducer, demo player.
- `src/lib/stream/useCaseStream.ts`: the ONLY way the UI gets data.
- `tests/*`: acceptance tests. **Never edit, skip, or weaken a test.** Fix the code, not the test.

## 3. Who owns what (you may ONLY edit files inside your owner's folders)
| Owner | Folders / files they may edit |
|---|---|
| Rayan (lead) | everything, including `src/types`, `src/lib/core`, `src/lib/stream`, `src/app/api`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/dev`, `src/lib/voice`, `scripts/`, `tests/` |
| Agastya | `src/lib/rules/**` and `docs/RULEBOOK.md` |
| Vaishnavi | `src/app/page.tsx`, `src/components/**` |
| Yaso | `src/mock/**`, `src/content/**` |

At merge time Rayan copies ONLY your folders. **Any change outside your folders is thrown away automatically.**
If you believe something outside your folder must change, STOP and write the request in `team/REQUESTS_<name>.md` (that file you may create).

## 4. Working style
- Small steps. After every step: run the check the manual gives (`npm run test:...`, `npm run typecheck`, or open the page) and show the result.
- No placeholder code, no `// TODO` left in finished work, no `any` types.
- Do not rename exported functions or change their signatures in `index.ts` files.
- Do not touch `.env*`, `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`.
- Run the app with `npm run dev` and open http://localhost:3000 (dashboard) or http://localhost:3000/dev (raw event view).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
