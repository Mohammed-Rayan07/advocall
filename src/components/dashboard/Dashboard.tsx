"use client";

import { useState } from "react";
import { useCaseStream } from "@/lib/stream/useCaseStream";
import Header from "./Header";
import StatsBar from "./StatsBar";
import EmptyState from "./EmptyState";
import StatusBadge from "./StatusBadge";
import type { Lang } from "@/types";
import { formatINR } from "@/lib/core/format";
import {
  FileText,
  Smartphone,
  ShoppingBag,
  Wifi,
  Sparkles,
  ShieldCheck,
  PhoneForwarded,
  MessageSquare,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function Dashboard() {
  const { cases, byId, connected, startDemo, reset } = useCaseStream();
  const [userSelectedId, setUserSelectedId] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("en");

  // Auto-select newest case unless user has explicitly chosen an existing case
  const selectedCase =
    userSelectedId && byId[userSelectedId]
      ? byId[userSelectedId]
      : cases[0] ?? null;

  const handleReset = async () => {
    setUserSelectedId(null);
    await reset();
  };

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
    <div className="min-h-screen bg-bg text-ink flex flex-col selection:bg-accent/20 selection:text-accent">
      <Header
        connected={connected}
        lang={lang}
        onLang={setLang}
        onDemo={startDemo}
        onReset={handleReset}
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6">
        {/* Metric tiles */}
        <StatsBar cases={cases} />

        {/* Zero state vs 3-Column layout */}
        {cases.length === 0 ? (
          <EmptyState onDemo={startDemo} lang={lang} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* COLUMN 1: CASE LIST (~22% width -> 3 cols on xl) */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Case List ({cases.length})
                </span>
                <span className="text-[11px] text-muted">Newest first</span>
              </div>

              {/* Horizontal scroll row on mobile (<1024px), vertical list on desktop */}
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
                {cases.map((c) => {
                  const isSelected = selectedCase?.case.id === c.case.id;
                  return (
                    <button
                      key={c.case.id}
                      onClick={() => setUserSelectedId(c.case.id)}
                      className={`min-w-[240px] sm:min-w-[280px] lg:min-w-0 w-full text-left rounded-card p-3.5 border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-surface border-accent shadow-md shadow-accent/5 ring-1 ring-accent/30"
                          : "bg-surface border-line hover:border-line/80 hover:bg-surface/80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-semibold text-ink">
                          {c.case.id}
                        </span>
                        <StatusBadge status={c.case.status} />
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="p-1 rounded bg-surface-2 text-muted border border-line">
                          {getCategoryIcon(c.case.category)}
                        </span>
                        <span className="text-sm font-medium text-ink truncate">
                          {c.case.company}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-line/60">
                        <span className="font-mono font-bold text-money">
                          {formatINR(c.case.amountPaise)}
                        </span>
                        <span className="text-muted text-[11px]">
                          {c.case.incidentDate}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 2: CASE DETAIL (~42% width -> 5 cols on xl) */}
            <div className="lg:col-span-4 xl:col-span-5 space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Case Detail
                </span>
                {selectedCase && (
                  <span className="font-mono text-xs text-accent">
                    {selectedCase.case.id}
                  </span>
                )}
              </div>

              {selectedCase && (
                <div className="rounded-card border border-line bg-surface p-5 space-y-5">
                  {/* Case Header summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-ink">
                          {selectedCase.case.company}
                        </h2>
                        <StatusBadge status={selectedCase.case.status} />
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Customer: <span className="text-ink">{selectedCase.case.userName}</span> · Ref:{" "}
                        <span className="font-mono text-ink">
                          {selectedCase.case.txnRef ?? "None"}
                        </span>
                      </p>
                    </div>
                    <div className="text-right sm:text-right">
                      <div className="text-xs text-muted uppercase tracking-wider text-[11px]">
                        Amount Disputed
                      </div>
                      <div className="font-mono text-2xl font-bold text-money">
                        {formatINR(selectedCase.case.amountPaise)}
                      </div>
                    </div>
                  </div>

                  {/* Shell placeholder: Rule Applied */}
                  <div className="rounded-xl border border-line bg-surface-2 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wide">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Rule Applied (Step 3)</span>
                      </div>
                      {selectedCase.match && (
                        <span className="rounded bg-accent/15 px-2 py-0.5 font-mono text-[11px] font-bold text-accent">
                          {selectedCase.match.ruleId}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">
                      {selectedCase.match?.explanation ??
                        "Computing regulatory rights & turnaround deadlines..."}
                    </p>
                  </div>

                  {/* Shell placeholder: Call Progress Stepper */}
                  <div className="rounded-xl border border-line bg-surface-2 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-accent-2 uppercase tracking-wide">
                      <PhoneForwarded className="h-4 w-4" />
                      <span>Advocate Call Stepper (Step 4)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" />
                      <span>9-step autonomous state machine will render here</span>
                    </div>
                  </div>

                  {/* Shell placeholder: Commitment Card */}
                  <div className="rounded-xl border border-line bg-surface-2 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-good uppercase tracking-wide">
                      <Sparkles className="h-4 w-4" />
                      <span>Formal Commitment (Step 5)</span>
                    </div>
                    <p className="font-mono text-xs text-muted">
                      {selectedCase.commitment?.ticketNo
                        ? `Captured Ticket: ${selectedCase.commitment.ticketNo}`
                        : "Waiting for bank complaint reference number..."}
                    </p>
                  </div>

                  {/* Shell placeholder: Escalation Panel */}
                  <div className="rounded-xl border border-line bg-surface-2 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-warn uppercase tracking-wide">
                        <ExternalLink className="h-4 w-4" />
                        <span>Regulator Escalation Packet (Step 5)</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted">
                      Generates statutory RBI Ombudsman / NCH escalation complaints upon deadline breach.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* COLUMN 3: LIVE TRANSCRIPT & TIMELINE (~36% width -> 4 cols on xl) */}
            <div className="lg:col-span-4 xl:col-span-4 space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Live Operations
                </span>
                <span className="text-xs text-accent flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
                  Live Stream
                </span>
              </div>

              {/* Transcript placeholder shell */}
              <div className="rounded-card border border-line bg-surface p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-ink uppercase tracking-wide border-b border-line pb-2.5">
                  <MessageSquare className="h-4 w-4 text-accent" />
                  <span>Call Transcript (Step 4)</span>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {selectedCase && selectedCase.transcript.length > 0 ? (
                    selectedCase.transcript.slice(-4).map((line, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                          line.speaker === "agent"
                            ? "bg-accent/10 border border-accent/20 text-ink"
                            : line.speaker === "company"
                            ? "bg-surface-2 border border-line text-ink"
                            : "bg-accent-2/10 border border-accent-2/20 text-ink"
                        }`}
                      >
                        <div className="text-[10px] uppercase font-mono text-muted mb-0.5">
                          {line.speaker}
                        </div>
                        <div>{line.text}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-muted">
                      No active transcript lines. Run a demo to stream dialogue.
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline & SMS placeholder shell */}
              <div className="rounded-card border border-line bg-surface p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-ink uppercase tracking-wide border-b border-line pb-2.5">
                  <Clock className="h-4 w-4 text-accent-2" />
                  <span>Timeline &amp; SMS Dispatch (Step 5)</span>
                </div>
                <div className="text-xs text-muted space-y-1">
                  <p>• Real-time chronological audit events</p>
                  <p>• Phone notification bubble for user SMS alerts</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
