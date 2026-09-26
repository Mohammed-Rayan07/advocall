"use client";

import type { RuleMatch, Lang } from "@/types";
import { formatINR, formatDate } from "@/lib/core/format";
import { t } from "@/content";
import { ShieldCheck, ExternalLink, Scale, Clock, AlertTriangle, Coins, Info } from "lucide-react";

interface RuleCardProps {
  match: RuleMatch | null;
  lang?: Lang;
  className?: string;
}

export default function RuleCard({
  match,
  lang = "en",
  className = "",
}: RuleCardProps) {
  if (!match) {
    return (
      <div
        className={`rounded-card border border-line bg-surface p-5 space-y-4 animate-pulse ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-10 rounded bg-surface-2" />
            <div className="h-5 w-40 rounded bg-surface-2" />
          </div>
          <div className="h-4 w-28 rounded bg-surface-2" />
        </div>
        <div className="h-14 rounded-lg bg-surface-2" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="h-12 rounded bg-surface-2" />
          <div className="h-12 rounded bg-surface-2" />
          <div className="h-12 rounded bg-surface-2" />
          <div className="h-12 rounded bg-surface-2" />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Scale className="h-4 w-4 text-muted animate-spin" />
          <span className="text-xs text-muted">
            Matching statutory rights &amp; regulatory deadlines...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-card border border-line bg-surface p-5 space-y-4 transition-all shadow-sm ${className}`}
    >
      {/* Header: Rule ID Chip + Title + Source Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-bold text-accent bg-accent/15 border border-accent/30 px-2 py-0.5 rounded">
            {match.ruleId}
          </span>
          <h3 className="text-base font-bold text-ink">
            {match.rule.title}
          </h3>
        </div>

        {match.rule.sourceUrl && (
          <a
            href={match.rule.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline cursor-pointer group"
          >
            <span className="truncate max-w-[200px] sm:max-w-[280px]">
              {match.rule.sourceName}
            </span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        )}
      </div>

      {/* citeText as a prominent quote */}
      {match.rule.citeText && (
        <blockquote className="rounded-lg border-l-2 border-accent bg-surface-2/60 p-3 text-xs italic text-ink leading-relaxed">
          &ldquo;{match.rule.citeText}&rdquo;
        </blockquote>
      )}

      {/* Plain English explanation */}
      {match.explanation && (
        <p className="text-xs text-muted leading-relaxed">
          {match.explanation}
        </p>
      )}

      {/* 4 Mini Stats: Deadline, Days Late, Compensation, Total at Stake */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Deadline */}
        <div className="rounded-lg border border-line bg-surface-2 p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-muted mb-1">
            <span>{t("deadline", lang)}</span>
            <Clock className="h-3.5 w-3.5 text-muted" />
          </div>
          <div className="font-mono text-xs font-bold text-ink truncate tabular-nums">
            {match.deadline ? formatDate(match.deadline) : "None"}
          </div>
        </div>

        {/* Days Late */}
        <div className="rounded-lg border border-line bg-surface-2 p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-muted mb-1">
            <span>{t("daysLate", lang)}</span>
            <AlertTriangle
              className={`h-3.5 w-3.5 ${
                match.daysLate > 0 ? "text-bad" : "text-muted"
              }`}
            />
          </div>
          <div
            className={`font-mono text-xs font-bold tabular-nums ${
              match.daysLate > 0 ? "text-bad font-black" : "text-ink"
            }`}
          >
            {match.daysLate > 0 ? `${match.daysLate} days late` : "On time"}
          </div>
        </div>

        {/* Compensation Owed */}
        <div className="rounded-lg border border-line bg-surface-2 p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-muted mb-1">
            <span>{t("compensation", lang)}</span>
            <Coins className="h-3.5 w-3.5 text-money" />
          </div>
          <div className="font-mono text-xs font-bold text-money tabular-nums">
            {formatINR(match.compensationPaise)}
          </div>
        </div>

        {/* Total at Stake */}
        <div className="rounded-lg border border-accent/30 bg-accent/5 p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-accent mb-1 font-medium">
            <span>{t("atStake", lang)}</span>
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          </div>
          <div className="font-mono text-sm font-bold text-money tabular-nums">
            {formatINR(match.totalAtStakePaise)}
          </div>
        </div>
      </div>

      {/* Badges footer */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line/60">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/30 px-2.5 py-1 text-[11px] font-medium text-accent">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Computed by rights engine, not by AI</span>
        </span>

        {!match.claimable && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 border border-line px-2.5 py-1 text-[11px] font-medium text-muted">
            <Info className="h-3.5 w-3.5" />
            <span>No legal claim, standard complaint only</span>
          </span>
        )}
      </div>
    </div>
  );
}
