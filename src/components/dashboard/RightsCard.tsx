"use client";

import type { CaseView, Lang } from "@/types";
import { formatDate, todayIST } from "@/lib/core/format";
import { rightsSummary, rightsTimeline, type RightsMilestone } from "@/lib/rules";
import { t, type StringKey } from "@/content";
import { CalendarClock } from "lucide-react";

interface RightsCardProps {
  view: CaseView;
  lang?: Lang;
}

const KIND_LABEL: Record<RightsMilestone["kind"], StringKey> = {
  incident: "msIncident",
  deadline: "msDeadline",
  promised: "msPromised",
  today: "msToday",
  escalate: "msEscalate",
};

const KIND_DOT: Record<RightsMilestone["kind"], string> = {
  incident: "bg-muted",
  deadline: "bg-bad",
  promised: "bg-good",
  today: "bg-accent",
  escalate: "bg-warn",
};

/** Agastya's rights timeline + plain-language summary, straight from the rights engine. */
export default function RightsCard({ view, lang = "en" }: RightsCardProps) {
  const { match } = view;
  if (!match) return null;
  const milestones = rightsTimeline(view.case, match, view.commitment, todayIST());

  return (
    <div className="rounded-card border border-line bg-surface p-5 space-y-4 shadow-soft">
      <div className="flex items-center gap-2 border-b border-line pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-2/15 border border-accent-2/30 text-accent-2 shadow-[0_0_14px_-4px_var(--color-accent-2)]">
          <CalendarClock className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-ink">{t("rightsTitle", lang)}</h3>
          <span className="text-xs text-muted">{t("rightsSub", lang)}</span>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-ink font-serif">{rightsSummary(match, lang)}</p>

      <ol className="relative space-y-3 border-l border-line pl-4">
        {milestones.map((m) => (
          <li key={`${m.kind}-${m.date}`} className="relative">
            <span
              className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-surface ${KIND_DOT[m.kind]} ${
                m.kind === "today" ? "animate-pulse-dot" : ""
              }`}
            />
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className={m.status === "future" ? "text-muted" : "font-medium text-ink"}>{t(KIND_LABEL[m.kind], lang)}</span>
              <span className={`font-mono tabular-nums ${m.kind === "today" ? "text-accent font-bold" : "text-muted"}`}>
                {formatDate(m.date)}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
