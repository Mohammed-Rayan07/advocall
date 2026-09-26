"use client";

import { useState } from "react";
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

  const advocateCall = selectedCase?.calls.find((c) => c.leg === "advocate");

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
                  <CaseHeader view={selectedCase} lang={lang} />
                  <RuleCard match={selectedCase.match} lang={lang} />
                  <CallProgress
                    call={advocateCall}
                    calls={selectedCase.calls}
                    lang={lang}
                  />
                  <CommitmentCard
                    commitment={selectedCase.commitment}
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
