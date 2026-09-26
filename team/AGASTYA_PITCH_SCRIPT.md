# Advocall: 3-Minute Pitch Script
**Speaker:** Agastya  
**Total Target Time:** 3 Minutes (~420 spoken words)

---

### [0:00 – 0:35] 1. The Hook & The Consumer Problem
> "Good afternoon judges.
> 
> Last month, over **14 billion UPI transactions** happened in India. And like millions of you in this room, I've had that dreadful notification: your bank account is debited ₹4,500, but the shopkeeper never received it.
> 
> What happens next? You call customer care. You suffer through 25 minutes of IVR elevator music, only for an agent to say: *'Sir, please wait 7 to 10 working days.'*
> 
> What almost nobody knows is that **under RBI circular law, that debit must be reversed by T+1 day**. Every single day of delay beyond that, the bank owes you **₹100 in statutory compensation**. But consumers never get it, because companies bank on your exhaustion."

---

### [0:35 – 1:20] 2. The Solution & Live Demo
> "Meet **Advocall**: the autonomous AI advocate that fights for your consumer rights. 
> 
> You speak to Advocall in your native language—Hindi, Kannada, or English. Advocall calls customer support on your behalf, negotiates with authority, cites the exact statutory framework, extracts a registered complaint docket, and tracks the resolution.
> 
> Let's see it live right now.
> 
> *(Cue live demo: Screen displays the dashboard at http://localhost:3000)*
> 
> Here is a real failed UPI case for ₹4,500 with HDFC Bank. Advocall initiates the outbound advocate call. I will roleplay the bank support agent, Priya.
> 
> *(Live demo exchange occurs)*
> 
> When I attempt the classic brush-off—*'Please wait 7 to 10 days'*—Advocall immediately pushes back with RBI's Turn Around Time circular. Notice what happens: I am forced to register docket **CMP88213** with a committed reversal by **29 September** and acknowledge compensation. In real time, the dashboard event stream locks in the commitment!"

---

### [1:20 – 2:05] 3. The Rights Engine: Trust vs. Hallucination
> "Now, why does this work when other AI voice agents fail?
> 
> Startups like Pine AI try to make an LLM 'negotiate' like a lawyer. That is dangerous. LLMs hallucinate laws, make false promises, and botch financial math.
> 
> At Advocall, **the AI never computes money or invents law.**
> 
> We built a deterministic **Rights Engine** in pure TypeScript, grounded directly in official Gazette notifications and RBI master directions. If you have a ₹4,500 dispute that is 4 days late, our engine computes the ₹400 penalty with zero floating-point error. It feeds the exact legal sentence into the voice agent. The AI cannot lie, because it is not allowed to guess."

---

### [2:05 – 2:35] 4. Safety Invariants & Competitive Moat
> "We also designed zero-trust safety:
> - Advocall has strict **mustNot invariants**: it is architecturally incapable of asking for, repeating, or accepting OTPs, PINs, or passwords.
> - If the company requires KYC authentication, Advocall gracefully patches in the human user.
> - And if a company refuses twice or hangs up? Advocall automatically generates a formal, evidence-backed legal petition ready for one-click submission to the **RBI Integrated Ombudsman** or the **National Consumer Helpline**."

---

### [2:35 – 3:00] 5. Market Impact & Team
> "With a freemium model and a contingency fee on recovered statutory penalties, Advocall turns everyday consumer disputes into an automated, profitable justice pipeline for India's 800 million digital consumers.
> 
> This was brought to life in 24 hours by our team:
> - **Rayan**, our Lead Engineer & Architect, who built the streaming event bus and voice pipeline;
> - **Vaishnavi**, who designed our live reactive dashboard;
> - **Yaso**, who led QA, multilingual localization, and mock scenarios;
> - And myself, **Agastya**, leading the Rights Engine and regulatory compliance.
> 
> Stop waiting on hold. Let **Advocall** fight for what is rightfully yours. Thank you!"
