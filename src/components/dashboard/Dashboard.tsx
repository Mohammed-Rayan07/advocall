"use client";

import { useState, useEffect } from "react";
import { useCaseStream } from "@/lib/stream/useCaseStream";
import Header from "./Header";
import StatsBar from "./StatsBar";
import EmptyState from "./EmptyState";
import CaseList from "./CaseList";
import CaseHeader from "./CaseHeader";
import RuleCard from "./RuleCard";
import CallProgress from "./CallProgress";
import CommitmentCard from "./CommitmentCard";
import EscalationPanel from "./EscalationPanel";
import TranscriptPanel from "./TranscriptPanel";
import Timeline from "./Timeline";
import SmsPreview from "./SmsPreview";
import type { Lang } from "@/types";
import { Minimize2 } from "lucide-react";

export default function Dashboard() {
  const { cases, byId, connected, startDemo, reset } = useCaseStream();
  const [userSelectedId, setUserSelectedId] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("en");
  const [presentMode, setPresentMode] = useState(false);

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

  // Keyboard shortcut: "p" toggles presentation mode, "Esc" exits
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        setPresentMode((v) => !v);
      } else if (e.key === "Escape") {
        setPresentMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const advocateCall = selectedCase?.calls.find((c) => c.leg === "advocate");

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col selection:bg-accent/20 selection:text-accent">
      <Header
        connected={connected}
        lang={lang}
        onLang={setLang}
        onDemo={startDemo}
        onReset={handleReset}
        presentMode={presentMode}
        onTogglePresent={() => setPresentMode((v) => !v)}
      />

      <main className="flex-1 w-full max-w-[1700px] mx-auto p-4 sm:p-6 space-y-6">
        {/* Metric tiles (hidden in Presentation Mode) */}
        {!presentMode && <StatsBar cases={cases} lang={lang} />}

        {/* Presentation mode indicator banner */}
        {presentMode && (
          <div className="flex items-center justify-between rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-xs">
            <span className="font-semibold text-accent flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" />
              <span>PROJECTOR PRESENTATION MODE · Focus on live case dialogue and legal rights</span>
            </span>
            <button
              onClick={() => setPresentMode(false)}
              className="inline-flex items-center gap-1.5 rounded bg-surface px-2.5 py-1 font-mono text-ink border border-line hover:border-accent hover:text-accent transition cursor-pointer"
            >
              <Minimize2 className="h-3.5 w-3.5" />
              <span>Exit (P / Esc)</span>
            </button>
          </div>
        )}

        {/* Zero state vs Content layout */}
        {cases.length === 0 ? (
          <EmptyState onDemo={startDemo} lang={lang} />
        ) : presentMode ? (
          /* PRESENTATION MODE: 2 LARGE COLUMNS (Transcript on left, Details on right) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Expanded live transcript (~55% width) */}
            <div className="lg:col-span-7">
              {selectedCase && (
                <TranscriptPanel
                  lines={selectedCase.transcript}
                  calls={selectedCase.calls}
                  companyName={selectedCase.case.company}
                  lang={lang}
                />
              )}
            </div>

            {/* Right: Case Core + Rule + Stepper + Hero Commitment (~45% width) */}
            <div className="lg:col-span-5 space-y-5">
              {selectedCase && (
                <>
                  <CaseHeader view={selectedCase} lang={lang} />
                  <RuleCard match={selectedCase.match} lang={lang} />
                  <CallProgress
                    call={advocateCall}
                    calls={selectedCase.calls}
                    lang={lang}
                  />
                  <CommitmentCard
                    commitment={selectedCase.commitment}
                    caseStatus={selectedCase.case.status}
                    lang={lang}
                  />
                  <EscalationPanel view={selectedCase} lang={lang} />
                </>
              )}
            </div>
          </div>
        ) : (
          /* STANDARD 3-COLUMN DASHBOARD LAYOUT */
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
                  <CaseHeader view={selectedCase} lang={lang} />
                  <RuleCard match={selectedCase.match} lang={lang} />
                  <CallProgress
                    call={advocateCall}
                    calls={selectedCase.calls}
                    lang={lang}
                  />
                  <CommitmentCard
                    commitment={selectedCase.commitment}
                    caseStatus={selectedCase.case.status}
                    lang={lang}
                  />
                  <EscalationPanel view={selectedCase} lang={lang} />
                </>
              )}
            </div>

            {/* COLUMN 3: LIVE TRANSCRIPT & OPERATIONS (~36% width -> 4 cols on xl) */}
            <div className="lg:col-span-4 xl:col-span-4 space-y-4">
              {selectedCase && (
                <>
                  <TranscriptPanel
                    lines={selectedCase.transcript}
                    calls={selectedCase.calls}
                    companyName={selectedCase.case.company}
                    lang={lang}
                  />
                  <Timeline events={selectedCase.timeline} lang={lang} />
                  <SmsPreview messages={selectedCase.messages} lang={lang} />
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
