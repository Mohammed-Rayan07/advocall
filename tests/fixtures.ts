// LOCKED (Rayan). Shared test fixtures.
import type { Case, CaseInput, CaseView, Commitment, Lang } from "@/types";

export const upiInput: CaseInput = {
  userName: "Ravi Kumar",
  userPhone: "+919800000001",
  language: "hi",
  company: "HDFC Bank",
  category: "upi_failed",
  amountPaise: 450000,
  incidentDate: "2026-09-20",
  txnRef: "UPI4829301",
  description: "Paid Rs 4,500 by UPI, debited, merchant not credited.",
};

export const upiCase: Case = {
  ...upiInput,
  id: "A-0142",
  status: "promised",
  createdAt: "2026-09-26T05:00:00.000Z",
  updatedAt: "2026-09-26T05:00:00.000Z",
};

export const commitment: Commitment = {
  caseId: "A-0142",
  ticketNo: "CMP88213",
  promisedBy: "2026-09-29",
  compensationAck: true,
  confirmed: true,
};

export function makeView(withCommitment: boolean, language: Lang = "hi"): CaseView {
  return {
    case: { ...upiCase, language },
    match: null,
    calls: [],
    transcript: [],
    commitment: withCommitment ? commitment : null,
    escalation: null,
    messages: [],
    timeline: [],
  };
}
