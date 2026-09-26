// Owner: YASO. Texts sent to the user: SMS summary + what the report-back call says.
import type { CaseView, Lang } from "@/types";
import { formatINR } from "@/lib/core/format";

/** SMS after the advocate call. Max 320 characters. Must include case id, amount, ticket (if any). */
export function buildSmsSummary(view: CaseView, lang: Lang): string {
  // TODO(Yaso): proper Hindi / English / Kannada versions. Spec: team/MANUAL_YASO.md
  void lang;
  return `Advocall ${view.case.id}: ${view.case.company} ${formatINR(view.case.amountPaise)}. Ticket ${view.commitment?.ticketNo ?? "-"}`;
}

/** What the AI says on the report-back call. 2–4 short spoken sentences, in `lang`. */
export function buildReportScript(view: CaseView, lang: Lang): string {
  // TODO(Yaso)
  void lang;
  return `Hello ${view.case.userName}, update on case ${view.case.id}.`;
}
