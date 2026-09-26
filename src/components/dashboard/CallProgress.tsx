"use client";

import { useEffect, useState } from "react";
import type { Call, AdvocateState, Lang } from "@/types";
import { t, type StringKey } from "@/content";
import { ADVOCATE_STATES } from "@/types";
import { Phone, PhoneCall, CheckCircle2, Clock, Activity } from "lucide-react";

interface CallProgressProps {
  call?: Call & { advocateState: AdvocateState | null };
  calls?: (Call & { advocateState: AdvocateState | null })[];
  visited?: AdvocateState[]; // states this call really went through (from the event timeline)
  lang?: Lang;
}

export default function CallProgress({
  call,
  calls = [],
  visited = [],
  lang = "en",
}: CallProgressProps) {
  // Static seconds for ended or completed calls calculated without setState
  const staticSeconds =
    call?.startedAt && call?.endedAt
      ? Math.max(
          0,
          Math.floor(
            (new Date(call.endedAt).getTime() -
              new Date(call.startedAt).getTime()) /
              1000
          )
        )
      : 0;

  const [liveSeconds, setLiveSeconds] = useState(0);

  // Live timer only when status is in_progress
  useEffect(() => {
    if (call?.status !== "in_progress" || !call.startedAt) {
      return;
    }

    const startTime = new Date(call.startedAt).getTime();
    const update = () => {
      setLiveSeconds(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [call?.status, call?.startedAt]);

  const elapsedSeconds =
    call?.status === "in_progress" ? liveSeconds : staticSeconds;

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const currentState = call?.advocateState ?? null;
  const currentIndex = currentState
    ? ADVOCATE_STATES.indexOf(currentState)
    : -1;

  // Labels for the 9 states (stepDISCLOSE, stepNAVIGATE, ...)
  const stateLabel = (s: AdvocateState) => t(`step${s}` as StringKey, lang);
  const statusLabel = (s: Call["status"]) =>
    ({ queued: t("queued", lang), ringing: t("ringing", lang), in_progress: t("live", lang), ended: t("done", lang), failed: t("failed", lang) })[s];

  // Find intake and report legs
  const intakeCall = calls.find((c) => c.leg === "intake");
  const reportCall = calls.find((c) => c.leg === "report");

  const totalSteps = ADVOCATE_STATES.length;
  const doneCount =
    visited.length > 0
      ? ADVOCATE_STATES.filter((s) => visited.includes(s)).length
      : call?.status === "ended"
      ? totalSteps
      : Math.max(currentIndex, 0);
  const progressPct = totalSteps > 1 ? (doneCount / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="rounded-card border border-line bg-surface p-5 space-y-4 shadow-soft">
      {/* Header: Title + Duration Timer + Call Legs Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 border border-accent/30 text-accent">
            <PhoneCall className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">
              {t("advocateProgress", lang)}
            </h3>
            <span className="text-xs text-muted">
              {t("advocateProgressSub", lang)}
            </span>
          </div>
        </div>

        {/* Status + Duration Timer */}
        <div className="flex items-center gap-3">
          {call && (
            <div className="flex items-center gap-1.5 rounded-full bg-surface-2 border border-line px-3 py-1 font-mono text-xs">
              {call.status === "in_progress" ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" />
                  <span className="text-accent font-semibold uppercase">{t("live", lang)}</span>
                </>
              ) : call.status === "ended" ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-good" />
                  <span className="text-good font-semibold uppercase">{t("done", lang)}</span>
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5 text-muted" />
                  <span className="text-muted uppercase font-semibold">{statusLabel(call.status)}</span>
                </>
              )}
              <span className="text-line">|</span>
              <span className="text-ink font-bold tabular-nums">
                {formatTimer(elapsedSeconds)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 9-Step Stepper */}
      <div className="relative pt-2">
        {/* Connecting progress track (single-row layout only, sm+) */}
        <div className="hidden sm:block absolute left-4 right-4 top-6 h-0.5 rounded-full bg-line overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-good transition-[width] duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-x-1 gap-y-3 relative z-10">
          {ADVOCATE_STATES.map((step, idx) => {
            const isCurrent = idx === currentIndex && call?.status === "in_progress";
            // A step is done only if the call really passed through it (the refusal demo never reaches CAPTURE).
            const isDone = visited.length > 0 ? visited.includes(step) && !isCurrent :
              call?.status === "ended" ||
              (currentIndex > -1 && idx < currentIndex);

            return (
              <div key={step} className="flex flex-col items-center text-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-mono font-bold transition-all ${
                    isCurrent
                      ? "bg-accent text-bg ring-4 ring-accent/25 shadow-lg shadow-accent/20 scale-110"
                      : isDone
                      ? "bg-good text-bg font-semibold"
                      : "bg-surface-2 border border-line text-muted"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <span
                  className={`mt-2 text-[11px] sm:text-[10px] xl:text-xs tracking-tight leading-tight break-words hyphens-auto ${
                    isCurrent
                      ? "text-accent font-bold"
                      : isDone
                      ? "text-ink font-medium"
                      : "text-muted"
                  }`}
                >
                  {stateLabel(step)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Chips for Intake & Report Call Legs */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-line/60 text-xs">
        <div className="flex items-center gap-2">
          {/* Intake Call Chip */}
          <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 border border-line px-2.5 py-1 text-xs">
            <Phone className="h-3.5 w-3.5 text-muted" />
            <span className="text-muted">{t("intakeCall", lang)}:</span>
            {intakeCall ? (
              intakeCall.status === "ended" ? (
                <span className="font-semibold text-good">{t("done", lang)}</span>
              ) : (
                <span className="font-semibold text-accent">{statusLabel(intakeCall.status)}</span>
              )
            ) : (
              <span className="text-muted">{t("pending", lang)}</span>
            )}
          </span>

          {/* Report Call Chip */}
          <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 border border-line px-2.5 py-1 text-xs">
            <Activity className="h-3.5 w-3.5 text-muted" />
            <span className="text-muted">{t("reportCall", lang)}:</span>
            {reportCall ? (
              reportCall.status === "in_progress" ? (
                <span className="font-semibold text-accent flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
                  {t("live", lang)}
                </span>
              ) : reportCall.status === "ended" ? (
                <span className="font-semibold text-good">{t("done", lang)}</span>
              ) : (
                <span className="text-muted">{statusLabel(reportCall.status)}</span>
              )
            ) : (
              <span className="text-muted">{t("queued", lang)}</span>
            )}
          </span>
        </div>

        {call?.outcome && (
          <span className="text-xs text-muted italic">
            {t("outcome", lang)}: <span className="text-ink not-italic">{call.outcome}</span>
          </span>
        )}
      </div>
    </div>
  );
}
