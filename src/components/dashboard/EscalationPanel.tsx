"use client";

import { useState } from "react";
import type { CaseView, Lang } from "@/types";
import {
  ExternalLink,
  Phone,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  Send,
  Loader2,
} from "lucide-react";

interface EscalationPanelProps {
  view: CaseView;
  onEscalate?: () => Promise<void>;
  lang?: Lang;
}

export default function EscalationPanel({
  view,
  onEscalate,
}: EscalationPanelProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const { escalation, case: c } = view;

  const handleEscalate = async () => {
    try {
      setLoading(true);
      if (onEscalate) {
        await onEscalate();
      } else {
        await fetch(`/api/cases/${c.id}/escalate`, { method: "POST" });
      }
    } catch (err) {
      console.error("Failed to escalate case:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!escalation?.body) return;
    try {
      await navigator.clipboard.writeText(escalation.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy letter:", err);
    }
  };

  if (!escalation) {
    return (
      <div className="rounded-card border border-line bg-surface p-5 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warn/15 border border-warn/30 text-warn">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
                Regulator Escalation
              </h3>
              <span className="text-[11px] text-muted">
                Statutory complaint generator
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted leading-relaxed">
          If the company misses the promised turnaround deadline or rejects the legal claim, Advocall automatically drafts a verified complaint letter for the RBI Ombudsman or National Consumer Helpline.
        </p>

        <div className="pt-2">
          <button
            onClick={handleEscalate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-warn/15 border border-warn/40 px-4 py-2.5 text-xs font-semibold text-warn transition hover:bg-warn/25 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating Escalation Packet...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Deadline missed → Escalate</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-warn/40 bg-surface p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warn/20 border border-warn/40 text-warn">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-warn font-semibold">
              Escalation Packet Ready
            </span>
            <h3 className="text-sm font-bold text-ink">
              {escalation.to}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {escalation.channelUrl && (
            <a
              href={escalation.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-xs text-accent hover:border-accent/40 cursor-pointer"
            >
              <span>Portal</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {escalation.phone && (
            <a
              href={`tel:${escalation.phone}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-xs text-ink hover:text-accent cursor-pointer"
            >
              <Phone className="h-3 w-3" />
              <span>{escalation.phone}</span>
            </a>
          )}
        </div>
      </div>

      {/* Subject Line */}
      {escalation.subject && (
        <div className="rounded-lg bg-surface-2 border border-line p-3 text-xs">
          <span className="text-muted block text-[11px] font-semibold uppercase mb-0.5">
            Subject
          </span>
          <span className="text-ink font-medium leading-relaxed">
            {escalation.subject}
          </span>
        </div>
      )}

      {/* Key Facts Table */}
      {escalation.facts && escalation.facts.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span>Key Facts Submitted</span>
          </div>

          <div className="rounded-lg border border-line bg-surface-2 overflow-hidden">
            <table className="w-full text-xs">
              <tbody>
                {escalation.facts.map(([label, val], idx) => (
                  <tr
                    key={idx}
                    className="border-b border-line/60 last:border-b-0 hover:bg-surface/50"
                  >
                    <td className="py-1.5 px-3 font-medium text-muted w-1/3">
                      {label}
                    </td>
                    <td className="py-1.5 px-3 font-mono text-ink">
                      {val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Letter Body & Copy Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Formal Complaint Letter
          </span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink transition hover:border-accent hover:text-accent cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-good" />
                <span className="text-good font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy letter</span>
              </>
            )}
          </button>
        </div>

        <pre className="max-h-56 overflow-y-auto rounded-lg bg-surface-2 border border-line p-3 font-mono text-xs whitespace-pre-wrap leading-relaxed text-ink scrollbar-thin scrollbar-thumb-line">
          {escalation.body}
        </pre>
      </div>
    </div>
  );
}
