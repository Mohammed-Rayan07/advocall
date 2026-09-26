// Owner: AGASTYA. The rulebook as data. Source: docs/RULEBOOK.md.
// R1 and R2 verified against primary sources on 26 Sep 2026. R3 NOT verified: the agent must not cite it.
import type { Rule, RuleId } from "@/types";

export const RULES: Record<RuleId, Rule> = {
  R1: {
    id: "R1",
    category: "upi_failed",
    title: "Failed UPI transfer",
    summary:
      "If your account is debited but the beneficiary is not credited, the bank must auto-reverse the money by T+1 day, and pay ₹100 per day for any delay beyond that.",
    citeText:
      "As per the RBI circular on turnaround time for failed transactions, a UPI debit that did not reach the beneficiary must be reversed by T+1 day, with ₹100 per day compensation for any delay beyond that.",
    sourceName:
      "RBI circular RBI/2019-20/67 (DPSS.CO.PD No.629/02.01.014/2019-20), Harmonisation of TAT and customer compensation for failed transactions, 20 Sep 2019",
    sourceUrl: "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11693&Mode=0",
    verified: true,
    goalOnCall: ["complaint number", "reversal date", "acknowledgement of compensation"],
    escalation: { name: "RBI Integrated Ombudsman (CMS)", url: "https://cms.rbi.org.in" },
  },
  R2: {
    id: "R2",
    category: "ecom_refund",
    title: "E-commerce refund not processed",
    summary:
      "The e-commerce platform's grievance officer must acknowledge your complaint within 48 hours and resolve it within one month of receiving it.",
    citeText:
      "Under Rule 4(5) of the Consumer Protection (E-Commerce) Rules, 2020, your grievance officer must acknowledge a complaint within 48 hours and resolve it within one month.",
    sourceName: "Consumer Protection (E-Commerce) Rules, 2020, Rule 4(5), Department of Consumer Affairs",
    sourceUrl: "https://consumeraffairs.nic.in/theconsumerprotection/consumer-protection-e-commerce-rules-2020",
    verified: true,
    goalOnCall: ["ticket number", "refund date", "grievance officer reference"],
    escalation: { name: "National Consumer Helpline", url: "https://consumerhelpline.gov.in", phone: "1915" },
  },
  R3: {
    id: "R3",
    category: "telecom_billing",
    title: "Telecom / broadband billing complaint",
    summary:
      "Telecom providers must run a complaint centre and an appellate authority under TRAI's complaint redressal regulations (exact timelines pending verification).",
    citeText:
      "Under TRAI's consumer complaint redressal regulations, your company must register this complaint and give a docket number.",
    sourceName: "TRAI Telecom Consumers Complaint Redressal Regulations, 2012 (timelines not yet verified)",
    sourceUrl: "https://www.trai.gov.in/",
    verified: false,
    goalOnCall: ["docket number", "resolution date", "bill correction or credit"],
    escalation: { name: "Provider appellate authority, then National Consumer Helpline", url: "https://consumerhelpline.gov.in", phone: "1915" },
  },
  FALLBACK: {
    id: "FALLBACK",
    category: "other",
    title: "General complaint (no rule matched)",
    summary: "No specific regulation matched, so Advocall makes no legal claim and only asks for a complaint number and a resolution date.",
    citeText: "",
    sourceName: "None: no legal claim is made",
    sourceUrl: "https://consumerhelpline.gov.in",
    verified: true,
    goalOnCall: ["complaint number", "resolution date"],
    escalation: { name: "National Consumer Helpline", url: "https://consumerhelpline.gov.in", phone: "1915" },
  },
};
