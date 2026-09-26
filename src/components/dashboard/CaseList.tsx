"use client";

import type { CaseView, Lang } from "@/types";
import StatusBadge from "./StatusBadge";
import { formatINR, formatDate } from "@/lib/core/format";
import { t } from "@/content";
import { Smartphone, ShoppingBag, Wifi, FileText } from "lucide-react";

interface CaseListProps {
  cases: CaseView[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  lang?: Lang;
}

export default function CaseList({
  cases,
  selectedId,
  onSelect,
  lang = "en",
}: CaseListProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "upi_failed":
        return <Smartphone className="h-4 w-4" />;
      case "ecom_refund":
        return <ShoppingBag className="h-4 w-4" />;
      case "telecom_billing":
        return <Wifi className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          {t("caseList", lang)} ({cases.length})
        </span>
        <span className="text-xs text-muted">{t("newestFirst", lang)}</span>
      </div>

      {/* Horizontal scroll row on mobile (<1024px), vertical list on desktop (>=1024px) */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
        {cases.map((c) => {
          const isSelected = selectedId === c.case.id;
          return (
            <button
              key={c.case.id}
              onClick={() => onSelect(c.case.id)}
              aria-label={`Select case ${c.case.id} for ${c.case.company}`}
              className={`relative overflow-hidden min-w-[260px] sm:min-w-[280px] lg:min-w-0 w-full text-left rounded-card p-3.5 pl-4 border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isSelected
                  ? "bg-surface border-accent shadow-soft"
                  : "bg-surface border-line hover:border-line/80 hover:bg-surface-2/40"
              }`}
            >
              {isSelected && (
                <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-accent to-accent-2" />
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-semibold text-ink">
                  {c.case.id}
                </span>
                <StatusBadge status={c.case.status} lang={lang} />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-accent-2/10 text-accent-2 border border-accent-2/20">
                  {getCategoryIcon(c.case.category)}
                </span>
                <span className="text-sm font-semibold text-ink truncate">
                  {c.case.company}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-line/60">
                <span className="font-mono font-bold text-money tabular-nums">
                  {formatINR(c.case.amountPaise)}
                </span>
                <span className="text-muted text-xs tabular-nums">
                  {formatDate(c.case.incidentDate)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
