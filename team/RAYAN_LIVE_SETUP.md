# RAYAN: Live calls setup (about 30 min, once)

The code is done and tested. Live calls produce **exactly the same events** as the mock demos, so the dashboard needs nothing extra.
What's left is accounts and keys, which only you can do. **Keys go ONLY into `.env.local`, never into chat, WhatsApp or git.**

You can see the whole live pipeline working right now, with no keys:
`npm run dev` → http://localhost:3000/dev → **▶ simulate live: promise** (or refusal). That runs the real webhook code with a fake Vapi.

---

## 1. Twilio (the phone line), 10 min
1. Sign up at twilio.com (free trial credit). Get a trial phone number (a US number is fine).
2. **Verified Caller IDs**: add **every team phone** (yours + the teammate who plays "the bank"). A trial account can ONLY call verified numbers.
3. **Voice → Settings → Geo permissions**: tick **India**.
4. Copy the **Account SID** and **Auth Token** (Console home). You'll paste them into Vapi, not into our app.

> ⚠️ **Trial behaviour:** every outbound call first plays *"You have a trial account…"* and the person must **press any key** before Advocall speaks. This is normal. Tell the "bank" teammate to press 1 when they hear it.

## 2. Vapi (the voice AI), 10 min
1. Sign up at dashboard.vapi.ai (free credit included).
2. **Phone Numbers → Create/Import → Twilio**: paste the Twilio number, Account SID and Auth Token. Open the imported number and copy its **ID** → `VAPI_PHONE_NUMBER_ID`.
3. **API Keys**: copy the **private** key → `VAPI_API_KEY`, and the **public** key → `VAPI_PUBLIC_KEY`.
4. You do NOT need to create assistants. The app sends its own (prompts are in `src/lib/voice/prompts.ts`).

## 3. Tunnel (so Vapi can reach your laptop), 5 min
```powershell
winget install --id Cloudflare.cloudflared
cloudflared tunnel --url http://localhost:3000
```
Copy the `https://….trycloudflare.com` URL it prints → `PUBLIC_URL`. Keep that window open.
> ⚠️ The URL **changes every time cloudflared restarts**. Update `PUBLIC_URL` and **restart `npm run dev`** each time (Next.js only reads `.env.local` at start).

## 4. `.env.local` (in the repo folder, next to `.env.example`)
```
MODE=live
PUBLIC_URL=https://xxxx.trycloudflare.com
VAPI_API_KEY=...
VAPI_PUBLIC_KEY=...
VAPI_PHONE_NUMBER_ID=...
VAPI_WEBHOOK_SECRET=<any long random text>
DEMO_COMPANY_PHONE=+91XXXXXXXXXX     (the "bank" teammate)
TEAM_PHONES=+91XXXXXXXXXX,+91YYYYYYYYYY   (you + anyone who will play the customer)
```
Then **restart `npm run dev`**.

## 5. Check before anyone's phone rings
```powershell
npm run voice:check
```
It checks the env, the key, the phone number ID, that Vapi accepts every assistant (all voices and languages), and that the tunnel reaches this app.
All ✅ → go on. Any ❌ → paste the output to Claude Code (it contains no secrets).

## 6. First live call
1. The "bank" teammate is ready with the script (IVR: *"press 2 for UPI"*, brush-off first, then give a ticket like **CMP88213** and a date).
2. http://localhost:3000/dev → **Live voice** panel → your phone, your name, Hindi → **☎ call me (real)**.
3. Your phone rings (press a key for the Twilio trial message). Tell Advocall your problem in Hindi, e.g. *"22 तारीख को UPI से ₹4,500 भेजे, HDFC से कट गए, पहुँचे नहीं, रेफ़रेंस UPI4829301"*. Confirm the read-back.
4. Hang up (or it hangs up). Advocall calls **the bank phone** in English, handles the brush-off, gets the ticket.
   ⚠️ Advocall **waits for the bank to speak first** (like a real IVR). After pressing the Twilio trial key, the bank teammate must start: *"Welcome to HDFC Bank. For UPI complaints, press 2."* Otherwise there's silence.
5. Then it calls **you back** in Hindi with the result, and the SMS text appears on the dashboard.
Watch everything live on http://localhost:3000 and /dev.

## What happens under the hood (for judge Q&A)
| Step | Code |
|---|---|
| Intake call in the user's language, `create_case` tool validates amount/date **in code** | `src/lib/voice/orchestrator.ts` |
| Rights + deadline + compensation computed by the **rules engine**, never by the LLM | `src/lib/rules` |
| Advocate call gets a brief: facts, the ONLY legal line it may cite, push-back line, hard limits | `buildCallBrief` + `prompts.ts` |
| Max 2 push-backs; OTP/PIN never asked; we only ever dial `TEAM_PHONES` | orchestrator + prompts |
| Report-back call + SMS text in the user's language | `src/content` |
| No ticket → regulator complaint letter generated | `buildEscalationPacket` |

## Honest limits (say these if asked; never overclaim)
- **The SMS is displayed, not actually sent.** The dashboard shows the exact text. Real SMS needs a DLT-registered sender in India.
- The "bank" is a teammate playing a scripted customer-care agent. We never call real companies.
- The inbound line (the user calls Advocall's number) is optional: set that Vapi phone number's **Server URL** to `PUBLIC_URL/api/vapi/webhook`, and Vapi will ask our server for the assistant.

## If something goes wrong on stage
- Live call fails → **Run demo → UPI Hero dispute** (mock). It's the same dashboard and the same story. **Never debug on stage.**
- Logs: the `npm run dev` terminal prints every `[advocall/live]` step (dial, case created, ended, failures).
