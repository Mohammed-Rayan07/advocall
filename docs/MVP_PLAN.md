# Advocall: MVP Plan

## Scope

| Priority | Feature |
|---|---|
| P0 | Voice intake (Kannada/Hindi/English) + confirm-back |
| P0 | Case file + rights engine (R1 first, then R2, R3) |
| P0 | Strategy planner + outbound advocate call (disclosure, phone menu, hold, push-back, capture) |
| P0 | Warm transfer for OTP/KYC |
| P0 | Report-back call + SMS summary |
| P0 | Live case dashboard |
| P1 | Follow-up scheduler + escalation packet (NCH / RBI CMS) |
| P1 | Hold detection + "we'll call you back" handling |
| P2 | WhatsApp voice-note intake, more case types and languages, company phone-menu directory |

**Out of scope:** handling credentials, filing on portals automatically without the user's approval, legal advice beyond cited rules, calling real companies during the demo.

## Live demo (3 min)

1. A judge calls Advocall and describes a failed ₹4,500 UPI payment in Kannada or Hindi. The case file fills live and the details are confirmed back.
2. The rights engine matches RBI TAT (T+1, 4 days late → ₹400 compensation) and shows the source link.
3. Advocall calls a second judge playing the bank's customer-care rep, who brushes it off. Advocall cites the rule politely and gets a complaint number, confirmed back.
4. The first judge's phone rings, and Advocall reports back in their language. An SMS summary follows.
5. Fast-forward: the deadline is missed, and an RBI Ombudsman complaint packet appears awaiting approval.

## 24-hour build plan (26 Sep 10:00 → 27 Sep 10:00)

| Hours | Voice (Rayan) | Backend (Yaso) | Dashboard / research (Vaishnavi, Agastya) |
|---|---|---|---|
| H0–2 | Speech-model benchmark on Kannada/Hindi, lock choice · numbers live | Repo, mock adapters, case schema | Dashboard skeleton · rulebook verification |
| H2–6 | Intake assistant + confirm-back | Case extractor, rights engine (R1) | Timeline + transcript views |
| H6–10 | Advocate assistant: disclosure, phone menu, hold, push-back, capture | Strategy planner, call tools, commitments | Rule and ₹ panels, prompt cards |
| H10–13 | Warm transfer + report-back call | SMS summary, outbound trigger | Pitch deck v1 |
| H13–16 | Voice polish: latency, tone, repair steps | Scheduler + escalation packet | Comparison and architecture slides |
| H16–19 | End-to-end runs ×5, fixes, R2/R3 if stable | | |
| H19–22 | Failure drills, backup video, feature freeze | | |
| H22–24 | Submission, README, 3 pitch rehearsals | | |
