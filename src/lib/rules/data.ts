// Owner: AGASTYA. The rulebook as data. Source: docs/RULEBOOK.md.
// TODO(Agastya): verify every entry against the primary source, then set verified: true.
import type { Rule, RuleId } from "@/types";

export const RULES: Record<RuleId, Rule> = {
  R1: {
    id: "R1",
    category: "upi_failed",
    title: "Failed UPI transfer",
    summary: "TODO",
    citeText: "TODO",
    sourceName: "TODO",
    sourceUrl: "https://www.rbi.org.in/",
    verified: false,
    goalOnCall: ["complaint number", "reversal date", "acknowledgement of compensation"],
    escalation: { name: "RBI Integrated Ombudsman (CMS)", url: "https://cms.rbi.org.in" },
  },
  R2: {
    id: "R2",
    category: "ecom_refund",
    title: "E-commerce refund not processed",
    summary: "TODO",
    citeText: "TODO",
    sourceName: "TODO",
    sourceUrl: "https://consumeraffairs.nic.in/",
    verified: false,
    goalOnCall: ["ticket number", "refund date", "grievance officer reference"],
    escalation: { name: "National Consumer Helpline", url: "https://consumerhelpline.gov.in", phone: "1915" },
  },
  R3: {
    id: "R3",
    category: "telecom_billing",
    title: "Telecom / broadband billing complaint",
    summary: "TODO",
    citeText: "TODO",
    sourceName: "TODO",
    sourceUrl: "https://www.trai.gov.in/",
    verified: false,
    goalOnCall: ["docket number", "resolution date", "bill correction or credit"],
    escalation: { name: "Provider appellate authority, then National Consumer Helpline", url: "https://consumerhelpline.gov.in", phone: "1915" },
  },
  FALLBACK: {
    id: "FALLBACK",
    category: "other",
    title: "General complaint (no rule matched)",
    summary: "TODO",
    citeText: "",
    sourceName: "None: no legal claim is made",
    sourceUrl: "https://consumerhelpline.gov.in",
    verified: true,
    goalOnCall: ["complaint number", "resolution date"],
    escalation: { name: "National Consumer Helpline", url: "https://consumerhelpline.gov.in", phone: "1915" },
  },
};
