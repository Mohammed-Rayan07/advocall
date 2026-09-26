"use client";

import { useEffect, useState } from "react";
import type { Call, AdvocateState, Lang } from "@/types";
import { ADVOCATE_STATES } from "@/types";
import { Phone, PhoneCall, CheckCircle2, Clock, Activity } from "lucide-react";

interface CallProgressProps {
  call?: Call & { advocateState: AdvocateState | null };
  calls?: (Call & { advocateState: AdvocateState | null })[];
  lang?: Lang;
}

export default function CallProgress({
  call,
  calls = [],
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

  // Labels for the 9 states
  const stateLabels: Record<AdvocateState, string> = {
    DISCLOSE: "Disclose",
    NAVIGATE: "IVR Menu",
    HOLD: "Hold",
    STATE_CASE: "State Case",
    ASK: "Ask Ticket",
    PUSH_BACK: "Push Back",
    VERIFY: "Verify",
    CAPTURE: "Capture",
    CLOSE: "Close",
  };

  // Find intake and report legs
  const intakeCall = calls.find((c) => c.leg === "intake");
  const reportCall = calls.find((c) => c.leg === "report");

  return (
    <div className="rounded-card border border-line bg-surface p-5 space-y-4 shadow-sm">
      {/* Header: Title + Duration Timer + Call Legs Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 border border-accent/30 text-accent">
            <PhoneCall className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">
              Advocate Call Progress
            </h3>
            <span className="text-[11px] text-muted">
              Autonomous IVR &amp; negotiation state machine
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
                  <span className="text-accent font-semibold">LIVE</span>
                </>
              ) : call.status === "ended" ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-good" />
                  <span className="text-good">COMPLETED</span>
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5 text-muted" />
                  <span className="text-muted uppercase">{call.status}</span>
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
        {/* Step dots and labels */}
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 relative z-10">
          {ADVOCATE_STATES.map((step, idx) => {
            const isCurrent = idx === currentIndex && call?.status === "in_progress";
            const isDone =
              call?.status === "ended" ||
              (currentIndex > -1 && idx < currentIndex);

            return (
              <div key={step} className="flex flex-col items-center text-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-mono font-bold transition-all ${
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
                  className={`mt-2 text-[10px] tracking-tight leading-tight line-clamp-1 ${
                    isCurrent
                      ? "text-accent font-bold"
                      : isDone
                      ? "text-ink font-medium"
                      : "text-muted"
                  }`}
                >
                  {stateLabels[step]}
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
          <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 border border-line px-2.5 py-1 text-[11px]">
            <Phone className="h-3 w-3 text-muted" />
            <span className="text-muted">Intake Call:</span>
            {intakeCall ? (
              <span className="font-semibold text-good">Done</span>
            ) : (
              <span className="text-muted">Pending</span>
            )}
          </span>

          {/* Report Call Chip */}
          <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 border border-line px-2.5 py-1 text-[11px]">
            <Activity className="h-3 w-3 text-muted" />
            <span className="text-muted">Report-back:</span>
            {reportCall ? (
              reportCall.status === "in_progress" ? (
                <span className="font-semibold text-accent flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
                  Active
                </span>
              ) : reportCall.status === "ended" ? (
                <span className="font-semibold text-good">Done</span>
              ) : (
                <span className="text-muted capitalize">{reportCall.status}</span>
              )
            ) : (
              <span className="text-muted">Queued</span>
            )}
          </span>
        </div>

        {call?.outcome && (
          <span className="text-[11px] text-muted italic">
            Outcome: <span className="text-ink not-italic">{call.outcome}</span>
          </span>
        )}
      </div>
    </div>
  );
}
