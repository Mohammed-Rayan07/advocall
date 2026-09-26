"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { TranscriptLine, Call, AdvocateState, Lang } from "@/types";
import { formatTime } from "@/lib/core/format";
import { t } from "@/content";
import { Bot, Building2, User, MessageSquare } from "lucide-react";

interface TranscriptPanelProps {
  lines: (TranscriptLine & { at: string })[];
  calls: (Call & { advocateState: AdvocateState | null })[];
  companyName?: string;
  lang?: Lang;
}

export default function TranscriptPanel({
  lines,
  calls,
  companyName,
  lang = "en",
}: TranscriptPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom whenever a new transcript line arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines.length]);

  const getCallDivider = (callId: string) => {
    const call = calls.find((c) => c.id === callId);
    const leg =
      call?.leg ??
      (callId.includes("intake")
        ? "intake"
        : callId.includes("adv")
        ? "advocate"
        : callId.includes("report")
        ? "report"
        : "session");

    switch (leg) {
      case "intake":
        return t("intakeCall", lang);
      case "advocate":
        return companyName ? `${t("advocateCall", lang)} · ${companyName}` : t("advocateCall", lang);
      case "report":
        return t("reportCall", lang);
      case "followup":
        return t("followupCall", lang);
      default:
        return t("callProgress", lang);
    }
  };

  return (
    <div className="rounded-card border border-line bg-surface p-4 flex flex-col h-[520px] shadow-elevated">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-line pb-3 mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-accent" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
            {t("transcript", lang)}
          </h3>
          <span className="font-mono text-xs text-muted bg-surface-2 px-2 py-0.5 rounded border border-line tabular-nums">
            {lines.length} {t("lines", lang)}
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2.5 text-xs text-muted hidden sm:flex">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_6px_var(--color-accent)]" />
            <span>{t("aiName", lang)}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-accent-2" />
            <span>{t("user", lang)}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-line" />
            <span>{companyName ?? t("company", lang)}</span>
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto pr-1 space-y-3.5 scrollbar-thin scrollbar-thumb-line"
      >
        {lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted">
            <MessageSquare className="h-8 w-8 text-line mb-2" />
            <p className="text-xs">{t("noTranscript", lang)}</p>
            <p className="text-xs text-muted/70 mt-1">
              {t("noTranscriptHint", lang)}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {lines.map((line, idx) => {
              const prevLine = idx > 0 ? lines[idx - 1] : null;
              const showDivider = !prevLine || prevLine.callId !== line.callId;

              const isAgent = line.speaker === "agent";
              const isCompany = line.speaker === "company";

              return (
                <div key={`${line.callId}-${idx}`}>
                  {/* Call Leg Divider */}
                  {showDivider && (
                    <div className="flex items-center gap-3 my-3">
                      <div className="h-px flex-1 bg-line" />
                      <span className="text-xs font-mono uppercase tracking-wider text-muted px-2.5 py-0.5 rounded-full bg-surface-2 border border-line">
                        {getCallDivider(line.callId)}
                      </span>
                      <div className="h-px flex-1 bg-line" />
                    </div>
                  )}

                  {/* Speech Bubble */}
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={`flex items-start gap-2.5 ${
                      isAgent
                        ? "mr-auto max-w-[88%]"
                        : "ml-auto max-w-[88%] flex-row-reverse"
                    }`}
                  >
                    {/* Avatar Icon */}
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs ${
                        isAgent
                          ? "bg-accent/15 border-accent/30 text-accent shadow-[0_0_12px_-4px_var(--color-accent)]"
                          : isCompany
                          ? "bg-surface-2 border-line text-muted"
                          : "bg-accent-2/15 border-accent-2/30 text-accent-2 shadow-[0_0_12px_-4px_var(--color-accent-2)]"
                      }`}
                    >
                      {isAgent ? (
                        <Bot className="h-4 w-4" />
                      ) : isCompany ? (
                        <Building2 className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>

                    {/* Bubble Content */}
                    <div className="flex flex-col">
                      <div
                        className={`flex items-center gap-2 mb-1 px-1 text-xs font-mono text-muted ${
                          isAgent ? "justify-start" : "justify-end"
                        }`}
                      >
                        <span className="font-semibold uppercase tracking-wider">
                          {isAgent
                            ? t("aiName", lang)
                            : isCompany
                            ? companyName ?? t("company", lang)
                            : t("user", lang)}
                        </span>
                        {line.at && (
                          <span className="tabular-nums">
                            {formatTime(line.at)}
                          </span>
                        )}
                      </div>

                      <div
                        className={`rounded-2xl p-3 text-xs leading-[1.6] shadow-sm break-words [overflow-wrap:anywhere] ${
                          isAgent
                            ? "rounded-tl-xs bg-accent/10 border border-accent/25 text-ink"
                            : isCompany
                            ? "rounded-tr-xs bg-surface-2 border border-line text-ink"
                            : "rounded-tr-xs bg-accent-2/10 border border-accent-2/25 text-ink"
                        }`}
                      >
                        {line.text}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
