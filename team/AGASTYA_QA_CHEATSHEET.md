# Advocall: Judge Q&A Cheat Sheet
**Author:** Agastya (Rights Engine Lead & Demo Rep)  
**Usage:** Crisp, authoritative answers for hackathon judges and technical auditors.

---

### 1. "Isn't this just Pine AI or Google Duplex?"
**Answer:** No. Duplex makes routine table reservations with no legal stakes, and Pine AI relies on LLM prompts to negotiate. Advocall is a statutory rights enforcement engine: our AI never invents or negotiates law or compensation. 100% of calculations are computed deterministically in code from verified RBI circulars and Gazette rules.

### 2. "Is it legal for an AI to call customer care on someone's behalf?"
**Answer:** Yes. Indian law permits authorized consumer representation under agency principles (Indian Contract Act, 1872). Advocall discloses immediately in the greeting that it is an automated assistant calling on the consumer's behalf with express authorization, preserving full transparency.

### 3. "What if the AI hallucinates and cites the wrong law or penalty?"
**Answer:** It cannot happen by architecture. The conversational LLM does not generate legal text. Instead, the verified Rights Engine injects verbatim, Gazette-grounded citations (`citeText`) and calculated figures into the call brief. If a rule is unverified or missing, the system defaults to neutral inquiry without making statutory claims.

### 4. "How do you handle OTPs, passwords, and sensitive KYC data?"
**Answer:** We enforce zero-trust financial safety invariants. The advocate agent's strict `mustNot` rules prohibit requesting, accepting, or uttering OTPs, PINs, passwords, CVVs, or card details. If a company representative requires KYC or OTP authentication, Advocall halts and immediately offers to patch in the user.

### 5. "What is the business model?"
**Answer:** A success-based contingency fee (e.g., 10–15% of statutory compensation recovered that the user would have otherwise forfeited) plus a freemium B2C subscription for frequent online shoppers and commuters. In enterprise B2B, we offer white-label rights automation for neo-banks and fintech apps.

### 6. "How does the system scale beyond 3 case categories?"
**Answer:** The Rights Engine is completely decoupled and data-driven. Adding a new domain (e.g., airline cancellation delays under DGCA CAR, insurance claim delays under IRDAI) requires only adding a typed rule definition, URL source, and unit tests in `src/lib/rules/data.ts`. The core state machine and call pipeline remain untouched.

### 7. "How accurate is the multilingual translation in Hindi and Kannada?"
**Answer:** We reject literal machine translation. Our multilingual engine utilizes culturally authentic localized phrasing reviewed for idiomatic accuracy in Indian consumer parlance. All numbers, dates, and amounts are formatted using Indian numbering conventions (`formatINR`).

### 8. "What is the operational cost per call?"
**Answer:** A typical 3-minute voice agent call costs approximately ₹4 to ₹8 using optimized voice and LLM infrastructure. Considering average disputed amounts range from ₹1,000 to ₹10,000 with statutory penalties up to ₹100/day, the unit economics are overwhelmingly positive.

### 9. "Why is India the ideal launch market?"
**Answer:** India executes over 14 billion UPI transactions monthly, but millions of consumers lack the time, knowledge, or persistence to navigate call center IVRs and ombudsman portals. Furthermore, India has explicit statutory delay penalties (like RBI's T+1 compensation) that are clear, quantifiable, and codified.

### 10. "What if the customer care agent hangs up or refuses to register the complaint?"
**Answer:** Advocall politely pushes back up to two times using statutory citations. If the company still refuses or terminates the call, Advocall records the refusal as an event and instantly compiles an automated, evidence-backed Escalation Packet ready for filing with the RBI Ombudsman or National Consumer Helpline.

### 11. "Where is case data stored and how is user privacy protected?"
**Answer:** All personal identifiers and transaction data are scoped per case and stored in encrypted form with strict data minimization principles. Audio recordings and transcripts are retained only for evidentiary audit trail generation and compliance with India's DPDP Act 2023.

### 12. "What's next after the hackathon?"
**Answer:** Direct API integration with the RBI CMS portal and National Consumer Helpline (NCH) for one-click grievance submission, expanding the Rights Engine across healthcare insurance and aviation delays, and rolling out WhatsApp-native voice-note dispute intake.
