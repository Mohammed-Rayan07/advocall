# Advocall: Judge Q&A Cheat Sheet
**Author:** Agastya (Rights Engine Lead & Demo Rep) · audited at the checkpoint merge so every answer matches what we actually built
**Rule for answering:** never claim something the prototype doesn't do. If a judge asks about something we haven't built, say "that's next" plainly.

---

### 1. "Isn't this just Pine AI or Google Duplex?"
**Answer:** Duplex books tables; there are no legal stakes. Advocall is built around a **rights engine**: the deadline, days late and compensation are computed in code from two verified official sources (the RBI circular of 20 Sep 2019 and the E-Commerce Rules 2020, Rule 4(5)). The voice AI only receives the result and one approved legal sentence. It doesn't do the maths or pick the law.

### 2. "Is it okay for an AI to call customer care for someone?"
**Answer:** The customer asks Advocall to call for them, and Advocall **says it is an AI in its first sentence** and names the customer it's calling for. It never pretends to be the customer. If the company needs identity checks, the customer does those themselves. We're not giving legal advice. We help people ask for what the published rules already say.

### 3. "What if the AI cites the wrong law or a wrong amount?"
**Answer:** The numbers never come from the AI: they come from the rights engine and are shown on the dashboard, marked "computed by rights engine". The AI is given exactly one approved legal line and told to use only that. If a rule isn't verified (like telecom/TRAI), the engine gives it **no** legal line, and the agent just asks for a complaint number and a date. An LLM can still misspeak, which is why the dashboard, SMS and complaint letter always use the engine's numbers, not the AI's words.

### 4. "How do you handle OTPs, passwords and KYC?"
**Answer:** The agent's hard rules say never ask for, accept or repeat an OTP, PIN, CVV, password or card/account number. If the company insists on verification, Advocall says the customer can verify themselves and asks them to register the complaint anyway. We also only ever dial phone numbers on our team's allowlist in this prototype.

### 5. "What is the business model?"
**Answer:** Free for the first case. Later: a small success fee on compensation recovered that the user would otherwise never have claimed, plus a white-label version for fintech apps and banks that want to resolve complaints faster.

### 6. "How does it scale beyond 3 categories?"
**Answer:** The rights engine is data-driven: a new area (for example airline refunds or insurance claim delays) is a new rule entry with its official source, deadline logic and tests. The call pipeline and dashboard don't change. We only add a rule after verifying it against the primary source.

### 7. "How good is the Hindi and Kannada?"
**Answer:** The texts the user hears and reads (report-back call, SMS, UI labels) were written and reviewed by our team (Yaso), not machine-translated word for word. Amounts use Indian formatting (₹4,500) and dates are spoken as dates.

### 8. "What does a call cost?"
**Answer:** Roughly **₹15–40 for a 3-minute call** at today's voice-AI rates (speech-to-text + LLM + text-to-speech + telephony). That's an estimate (not yet measured): **replace it with the real per-call cost the Vapi dashboard shows after our first live call.** A single case usually involves ₹1,000–₹10,000, plus ₹100/day compensation for late UPI reversals.

### 9. "Why India?"
**Answer:** UPI handles billions of transactions every month (check NPCI's latest monthly figure before the pitch), failed debits are common, and India has **clear, written turnaround rules with a daily compensation amount**. That makes the rights computable, which is exactly what our engine does.

### 10. "What if the company refuses or hangs up?"
**Answer:** Advocall pushes back politely **at most twice**: the prompt says so, and the server also refuses a third push-back step and tells the agent to close politely. If they still refuse, it ends the call, calls the customer back, and generates a **complaint letter for the regulator** (RBI Ombudsman via cms.rbi.org.in, or the National Consumer Helpline), with a key-facts table. The customer files it: we don't file on their behalf yet.

### 11. "Where is the data stored? Privacy?"
**Answer (honest for the prototype):** In this prototype, case data lives only in the server's memory and disappears on reset: there's no database. We never collect OTPs, passwords or card numbers. For production: encrypted storage, short retention, explicit consent, and compliance with the DPDP Act 2023.

### 12. "Does it really send the SMS?"
**Answer:** Not yet. The dashboard shows the exact SMS text. Sending real SMS in India needs a DLT-registered sender, which is a production step.

### 13. "Is the call on screen real?"
**Answer:** If we run it live, yes: a real phone call through Vapi, and one of us plays the bank. The scripted demos use the **same pipeline and same events**, just with pre-recorded dialogue, as our backup for stage Wi-Fi. We say which one we're showing.

### 14. "What's next?"
**Answer:** Real SMS/WhatsApp updates, automatic follow-up when the promised date passes, filing directly on the regulator's portal, more verified rules (telecom/TRAI, airlines, insurance), and warm transfer to the customer when a company insists on speaking to them.
