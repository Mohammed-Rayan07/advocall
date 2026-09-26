"use client";

import { useState } from "react";
import { useCaseStream } from "@/lib/stream/useCaseStream";
import Header from "./Header";
import StatsBar from "./StatsBar";
import EmptyState from "./EmptyState";
import CaseList from "./CaseList";
import CaseHeader from "./CaseHeader";
import RuleCard from "./RuleCard";
import type { Lang } from "@/types";
import {
  Sparkles,
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

  const selectedId = selectedCase?.case.id ?? null;

  const handleReset = async () => {
    setUserSelectedId(null);
    await reset();
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
            <div className="lg:col-span-4 xl:col-span-3">
              <CaseList
                cases={cases}
                selectedId={selectedId}
                onSelect={setUserSelectedId}
                lang={lang}
              />
            </div>

            {/* COLUMN 2: CASE DETAIL (~42% width -> 5 cols on xl) */}
            <div className="lg:col-span-4 xl:col-span-5 space-y-4">
              {selectedCase && (
                <>
                  {/* Case Header */}
                  <CaseHeader view={selectedCase} lang={lang} />

                  {/* Rule Applied Card */}
                  <RuleCard match={selectedCase.match} lang={lang} />

                  {/* Placeholder for Task 2: Call Progress Stepper */}
                  <div className="rounded-card border border-line bg-surface p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-accent-2 uppercase tracking-wide">
                      <PhoneForwarded className="h-4 w-4" />
                      <span>Advocate Call Stepper</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" />
                      <span>9-step autonomous state machine loading...</span>
                    </div>
                  </div>

                  {/* Placeholder for Task 3: Commitment Card */}
                  <div className="rounded-card border border-line bg-surface p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-good uppercase tracking-wide">
                      <Sparkles className="h-4 w-4" />
                      <span>Formal Commitment</span>
                    </div>
                    <p className="font-mono text-xs text-muted">
                      {selectedCase.commitment?.ticketNo
                        ? `Captured Ticket: ${selectedCase.commitment.ticketNo}`
                        : "Waiting for bank complaint reference number..."}
                    </p>
                  </div>

                  {/* Placeholder for Task 3: Escalation Panel */}
                  <div className="rounded-card border border-line bg-surface p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-warn uppercase tracking-wide">
                        <ExternalLink className="h-4 w-4" />
                        <span>Regulator Escalation Packet</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted">
                      Generates statutory RBI Ombudsman / NCH escalation complaints upon deadline breach.
                    </p>
                  </div>
                </>
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

              {/* Transcript placeholder shell (Task 2) */}
              <div className="rounded-card border border-line bg-surface p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-ink uppercase tracking-wide border-b border-line pb-2.5">
                  <MessageSquare className="h-4 w-4 text-accent" />
                  <span>Call Transcript</span>
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

              {/* Timeline & SMS placeholder shell (Task 3) */}
              <div className="rounded-card border border-line bg-surface p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-ink uppercase tracking-wide border-b border-line pb-2.5">
                  <Clock className="h-4 w-4 text-accent-2" />
                  <span>Timeline &amp; SMS Dispatch</span>
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
