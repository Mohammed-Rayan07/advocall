# Advocall: Architecture

## Components

| Component | Responsibility |
|---|---|
| **Voice leg A** (Vapi assistant) | Inbound intake call and outbound report-back call with the user, in their language |
| **Voice leg B** (Vapi assistant) | Outbound advocate call to the company: disclosure, phone menu, hold, negotiation, capture |
| **Case extractor** (LLM tool) | Turns intake speech into a structured case: company, category, amount, date, transaction reference |
| **Rights engine** (code + data) | Matches the case to a rule in `RULEBOOK.md`, computes deadline and compensation |
| **Strategy planner** (LLM tool) | Produces the call goal, talking points, allowed push-backs and stop conditions |
| **Case store + event timeline** | Single source of truth. Every action is an event |
| **Scheduler + escalation** | Watches promised deadlines and generates NCH / RBI CMS complaint packets for user approval |
| **Dashboard** | Live view of cases, transcripts, rule applied, ₹ at stake / recovered |

## Advocate-call states

The LLM phrases each turn, but it can't skip or reorder these states.

1. `DISCLOSE`: "AI assistant calling on behalf of [name], who is available to verify."
2. `NAVIGATE`: phone menu via a stored path or by listening, sending DTMF
3. `HOLD`: detects hold music or silence vs. a live human, and waits quietly
4. `STATE_CASE`: facts only (amount, date, transaction reference)
5. `ASK`: the goal (complaint number + committed date)
6. `PUSH_BACK`: cites the matched rule politely, at most twice
7. `VERIFY`: if OTP or KYC is needed, warm-transfers the user in
8. `CAPTURE`: ticket number + deadline, read back and confirmed
9. `CLOSE`: thanks them and ends. The case timeline is updated

`endCall` is only allowed after `CAPTURE` or an explicit refusal.

## Data model (MVP)

```
User        id, name, phone, language, consent_at
Case        id, user_id, company, category, amount, txn_ref, incident_date,
            rule_id, goal, status(open|calling|promised|resolved|escalated), created_at
Call        id, case_id, leg(intake|advocate|report|followup), started_at, ended_at,
            outcome, transcript_url
Commitment  id, case_id, ticket_no, promised_by, compensation_ack, confirmed
Rule        id, category, source_url, deadline_logic, compensation_logic,
            cite_text, escalation_path
Event       id, case_id, type, payload, at
```

## Adapters (mock-first)

Every external dependency sits behind an adapter with a `MODE=mock|live` switch:

`telephony` · `stt` · `tts` · `llm` · `messaging` · `store`

In `mock` mode the whole flow runs on test data, which also serves as the demo fallback if the network fails.
