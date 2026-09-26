# Advocall: MVP Rulebook

The agent may **only** make legal claims that appear in this file. Each rule links to its source. Deadline and compensation maths are implemented in code from these entries.

> Before the hackathon, verify every entry against the primary source (RBI circular text, Gazette notification). If an entry isn't verified, the agent doesn't cite it.

## R1: Failed UPI transfer (account debited, beneficiary not credited)

- **Rule:** reversal by **T+1**. If later, **₹100 per day** of delay beyond T+1, paid to the customer automatically.
- **Source:** RBI circular RBI/2019-20/67 (DPSS.CO.PD No.629/02.01.014/2019-20), *Harmonisation of Turn Around Time (TAT) and customer compensation for failed transactions using authorised Payment Systems*, 20 Sep 2019: https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11693&Mode=0
- **Verified:** Verified by Agastya on 26 Sep 2026 against the circular annexure (UPI row: "auto reversal by the Beneficiary bank latest on T + 1 day; ₹100/- per day if delay is beyond T + 1 day").
- **Goal on call:** complaint number · reversal date · acknowledgement of compensation
- **Escalation:** RBI Integrated Ombudsman Scheme via the RBI Complaint Management System (cms.rbi.org.in)

## R2: E-commerce refund / return not processed

- **Rule:** the grievance officer must **acknowledge within 48 hours** and **redress within one month** of receiving the complaint.
- **Source:** Consumer Protection (E-Commerce) Rules, 2020, Rule 4(5): https://consumeraffairs.nic.in/theconsumerprotection/consumer-protection-e-commerce-rules-2020
- **Verified:** Verified by Agastya on 26 Sep 2026 (48-hour acknowledgement, one-month redress from receipt of complaint).
- **Goal on call:** ticket number · refund date · grievance officer reference
- **Escalation:** National Consumer Helpline (1915 · consumerhelpline.gov.in)

## R3: Telecom / broadband billing and service complaint

- **Rule:** telecom providers must run a complaint centre and an appellate authority with prescribed response timelines under TRAI's consumer complaint redressal framework. *(NOT verified: `verified: false` in code, so the agent makes no TRAI claim until Agastya confirms the timelines.)*
- **Goal on call:** docket number · resolution date · bill correction / credit
- **Escalation:** the provider's appellate authority, then the National Consumer Helpline

## Fallback when no rule matches

The agent makes **no legal claim**. It asks only for standard customer-service commitments: a complaint number and a resolution date.
