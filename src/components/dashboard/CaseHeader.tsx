"use client";

import type { CaseView, Lang } from "@/types";
import StatusBadge from "./StatusBadge";
import { formatINR, formatDate } from "@/lib/core/format";
import { t } from "@/content";
import { User, Calendar, Hash, Globe2 } from "lucide-react";

interface CaseHeaderProps {
  view: CaseView;
  lang?: Lang;
}

export default function CaseHeader({ view, lang = "en" }: CaseHeaderProps) {
  const { case: c } = view;

  return (
    <div className="relative overflow-hidden rounded-card border border-line bg-surface p-5 pt-6 transition-all shadow-elevated">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-accent via-accent-2 to-accent" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/30 px-2.5 py-0.5 rounded">
              {c.id}
            </span>
            <h2 className="text-xl font-bold tracking-tight text-ink">
              {c.company}
            </h2>
            <StatusBadge status={c.status} lang={lang} />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2.5 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted" />
              <span className="text-ink font-medium">{c.userName}</span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted" />
              <span>{t("incident", lang)}: <span className="tabular-nums">{formatDate(c.incidentDate)}</span></span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-muted" />
              <span>{t("reference", lang)}: </span>
              <span className="font-mono text-ink bg-surface-2 px-1.5 py-0.5 rounded border border-line">
                {c.txnRef ?? t("notProvided", lang)}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5 text-muted" />
              <span className="rounded bg-surface-2 px-2 py-0.5 text-xs font-medium text-accent border border-line uppercase">
                {c.language}
              </span>
            </span>
          </div>
        </div>

        <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-line/50 pt-2 sm:pt-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">
            {t("amountDisputed", lang)}
          </div>
          <div className="font-mono text-3xl font-bold text-money tracking-tight tabular-nums">
            {formatINR(c.amountPaise)}
          </div>
        </div>
      </div>

      {c.description && (
        <div className="pt-3 text-xs text-muted leading-relaxed">
          <span className="font-medium text-ink">{t("issue", lang)}: </span>
          {c.description}
        </div>
      )}
    </div>
  );
}
