# Advocall Rights Engine: Technical & Legal Architecture
**Author:** Agastya (Rights Engine Lead)  
**Target Audience:** Hackathon Judges, Technical Auditors, Regulatory Compliance

---

## 1. Executive Summary: Why the AI Never Computes Money

Existing consumer automation tools (like Pine AI or generic LLM agents) ask a probabilistic language model to "reason" about laws and calculate refunds. In legal and financial advocacy, this approach fails:
- **LLMs hallucinate** regulatory provisions and penalty calculations.
- **Probabilistic arithmetic is unreliable**, creating unacceptable liability in monetary disputes.
- **Compliance risk:** Regulatory bodies (like the Reserve Bank of India or National Consumer Helpline) dismiss complaints citing inaccurate rules or inflated statutory claims.

**Advocall solves this with deterministic separation:**
The voice LLM acts strictly as a conversational interface that extracts facts. Once extracted, **100% of the legal classification, deadline calculation, and statutory compensation is computed in pure, deterministic TypeScript code** grounded in verified Gazette notifications and central bank circulars. The AI is structurally prohibited from inventing or negotiating money.

---

## 2. Core Engine Components

```
CaseInput (from Voice Call)
   │
   ▼
[ matchRule(input, today) ] ────────► RuleMatch
   │                                   - Rule ID (R1, R2, R3, FALLBACK)
   │                                   - Statutory Deadline & Days Late
   │                                   - Exact Statutory Compensation (paise)
   │                                   - Total at Stake (paise)
   │                                   - Verbatim Pushback Line (cites law)
   ▼
[ buildCallBrief(input, match) ] ────► CallBrief
   │                                   - Exact objective & mandatory call limits
   │                                   - Verbatim cite & pushback phrases
   │                                   - Strict guardrails (e.g., never accept OTP/PIN)
   ▼
[ buildEscalationPacket(...) ] ──────► EscalationPacket
                                       - Formal complaint letter for Ombudsman / NCH
                                       - Structured facts table (clean evidence audit)
```

### A. `matchRule(input: CaseInput, today: string): RuleMatch`
- **Validation:** Strictly validates `amountPaise` (must be a positive integer) and ISO calendar dates (`isValidYmd` using UTC arithmetic).
- **Rule Resolution:** Maps `category` directly to official regulations:
  - `upi_failed` $\rightarrow$ **R1**: RBI Harmonisation Circular (DPSS.CO.PD No.629/02.01.014/2019-20). Auto-reversal by **T+1**, then **₹100/day** penalty.
  - `ecom_refund` $\rightarrow$ **R2**: Consumer Protection (E-Commerce) Rules 2020, Rule 4(5). 48-hour acknowledgment, 1-month resolution.
  - `telecom_billing` $\rightarrow$ **R3**: TRAI framework (unverified rules remain unclaimable).
  - `other` $\rightarrow$ **FALLBACK**: General advocacy; makes zero statutory claims, demanding standard docket number.
- **Precision Arithmetic:** All monetary amounts are held as integers in **paise** ($₹1 = 100\text{ paise}$), preventing floating-point drift.

### B. `buildCallBrief(input: CaseInput, match: RuleMatch): CallBrief`
Provides strict operating instructions for the voice agent before initiating the outbound call:
- **Exact Citation:** Provides the authorized legal sentence (`citeText`) only if `match.claimable === true`.
- **Pre-scripted Pushback:** Gives the agent the polite pushback line when representatives attempt to brush off the complaint.
- **Safety Invariants (`mustNot`):** Prohibits requesting or repeating OTPs, passwords, PINs, or card numbers; prohibits unauthorized settlements; caps pushback attempts to at most two.

### C. `buildEscalationPacket(case, match, commitment, today): EscalationPacket`
When a company fails to honor commitments or breaches statutory deadlines, this generates a ready-to-file legal complaint packet:
- Targets the appropriate statutory body (e.g., RBI Integrated Ombudsman via CMS portal, or National Consumer Helpline).
- Produces a formal, factual plain-text legal petition under 250 words referencing case identifiers, transaction references, exact circular citations, and specific relief demanded.

---

## 3. Real-World Walkthrough: Failed UPI Transaction

Consider a real case processed by the Rights Engine:
- **Transaction Amount:** $₹4,500$ (`450000 paise`)
- **Category:** Failed UPI Transfer (`upi_failed`)
- **Incident Date:** `2026-09-22` (Tuesday)
- **Evaluation Date (`today`):** `2026-09-27` (Sunday)

### Step-by-Step Mathematical & Legal Resolution:
1. **Rule Match:** Matches `R1` (RBI TAT Circular of 20 Sep 2019). Rule is verified (`verified: true`), so `claimable = true`.
2. **Statutory Deadline ($T+1$):**
   $$\text{Deadline} = \text{addDays}(\text{"2026-09-22"}, 1) = \mathbf{\text{2026-09-23}}$$
3. **Days Overdue:**
   $$\text{daysLate} = \max(0, \text{daysBetween}(\text{"2026-09-23"}, \text{"2026-09-27"})) = \mathbf{4\text{ days}}$$
4. **Statutory Compensation:**
   $$\text{compensationPaise} = 4 \times 10,000\text{ paise} = 40,000\text{ paise} = \mathbf{₹400}$$
5. **Total at Stake:**
   $$\text{totalAtStakePaise} = 450,000 + 40,000 = 490,000\text{ paise} = \mathbf{₹4,900}$$
6. **Agent Pushback Line:**
   > *"As per RBI's turnaround-time rules, a failed UPI debit must be reversed by T+1, with ₹100 per day compensation after that. Could you please register a complaint and give me the complaint number and the reversal date?"*

---

## 4. Key Takeaways for Judges

1. **Grounded in Gazette Law:** No simulated guidelines. Every claim is rooted in active statutory frameworks.
2. **Zero Financial Hallucination:** Deterministic arithmetic in integer paise guarantees zero mathematical error.
3. **Consumer Safety First:** Rigid guardrails ensure the caller never surrenders credentials or accepts lowball compromises.
