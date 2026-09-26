"use client";

import { motion } from "motion/react";
import type { Commitment, CaseStatus, Lang } from "@/types";
import { formatDate } from "@/lib/core/format";
import { t } from "@/content";
import { Ticket, CheckCircle2, Clock, Sparkles, XCircle, AlertTriangle } from "lucide-react";

interface CommitmentCardProps {
  commitment: Commitment | null;
  caseStatus?: CaseStatus;
  lang?: Lang;
}

export default function CommitmentCard({
  commitment,
  caseStatus,
  lang = "en",
}: CommitmentCardProps) {
  // If company refused to give a ticket and case failed / escalated
  if (!commitment && (caseStatus === "failed" || caseStatus === "escalated")) {
    return (
      <div className="rounded-card border border-bad/40 bg-bad/5 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-bad/20 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-bad/15 text-bad border border-bad/30">
              <XCircle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-bad">
                No Ticket Issued
              </h3>
              <span className="text-xs text-muted">
                Company refused complaint registration
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-bad/15 border border-bad/30 px-2.5 py-0.5 text-xs text-bad font-semibold">
            Declined
          </span>
        </div>

        <div className="rounded-lg bg-surface border border-bad/20 p-3.5 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-bad font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Advocall Safety Protocol Triggered</span>
          </div>
          <p className="text-muted leading-relaxed">
            The company representative refused to register a formal ticket after 2 polite push-backs. Per safety limits, Advocall ended the call and generated an escalation complaint.
          </p>
        </div>
      </div>
    );
  }

  if (!commitment) {
    return (
      <div className="rounded-card border border-line bg-surface p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-muted border border-line">
              <Ticket className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Formal Commitment
              </h3>
              <span className="text-xs text-muted">
                Official grievance reference
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 border border-line px-2.5 py-0.5 text-xs text-muted font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-muted animate-pulse" />
            Awaiting
          </span>
        </div>

        <div className="flex flex-col items-center justify-center py-6 text-center text-muted">
          <Sparkles className="h-8 w-8 text-line mb-2 animate-pulse" />
          <p className="text-xs font-medium">Waiting for ticket number…</p>
          <p className="text-xs text-muted/70 max-w-xs mt-1">
            Advocall will insist on registering a formal complaint and capture the reference number.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{
        opacity: 1,
        scale: 1,
        boxShadow: "0 0 30px -4px rgba(52, 211, 153, 0.25)",
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-card border border-good/50 bg-good/5 p-5 space-y-4 transition-all shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-good/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-good/20 border border-good/40 text-good">
            <Ticket className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-good">
              Formal Commitment Captured
            </h3>
            <span className="text-xs text-muted">
              Official company reference
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-good/20 border border-good/40 px-2.5 py-0.5 text-xs font-semibold text-good">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Acknowledged
        </span>
      </div>

      {/* Hero Ticket Number */}
      <div className="rounded-xl bg-surface/90 border border-good/30 p-4 text-center">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
          {t("ticket", lang)}
        </div>
        <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-good select-all tabular-nums">
          {commitment.ticketNo}
        </div>
      </div>

      {/* Commitment Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Promised By */}
        <div className="rounded-lg bg-surface border border-line p-3 flex items-center justify-between">
          <span className="text-muted flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted" />
            <span>{t("promisedBy", lang)}:</span>
          </span>
          <span className="font-mono font-bold text-ink tabular-nums">
            {commitment.promisedBy ? formatDate(commitment.promisedBy) : "Immediate"}
          </span>
        </div>

        {/* Compensation Acknowledged */}
        <div className="rounded-lg bg-surface border border-line p-3 flex items-center justify-between">
          <span className="text-muted">Statutory comp:</span>
          <span
            className={`font-semibold flex items-center gap-1 ${
              commitment.compensationAck ? "text-good" : "text-warn"
            }`}
          >
            {commitment.compensationAck ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Acknowledged</span>
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5" />
                <span>Not agreed</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Confirmed Readback Badge */}
      {commitment.confirmed && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-good font-medium pt-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Ticket read back &amp; verified with company representative</span>
        </div>
      )}
    </motion.div>
  );
}
