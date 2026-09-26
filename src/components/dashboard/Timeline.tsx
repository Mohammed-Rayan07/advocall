"use client";

import type { AdvocallEvent, Lang } from "@/types";
import { formatTime, formatINR, formatDate } from "@/lib/core/format";
import {
  FilePlus,
  Activity,
  ShieldCheck,
  PhoneCall,
  PhoneForwarded,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Send,
  MessageSquare,
  Clock,
} from "lucide-react";

interface TimelineProps {
  events: AdvocallEvent[];
  lang?: Lang;
}

export default function Timeline({ events }: TimelineProps) {
  // Newest events at the top
  const sortedEvents = [...events].reverse();

  const getEventDetails = (event: AdvocallEvent) => {
    switch (event.type) {
      case "case.created":
        return {
          icon: FilePlus,
          color: "text-accent-2",
          bgColor: "bg-accent-2/15",
          title: `Case ${event.data.case.id} created`,
          desc: `${event.data.case.company} · ${formatINR(event.data.case.amountPaise)} disputed`,
        };
      case "case.status":
        return {
          icon: Activity,
          color: "text-accent",
          bgColor: "bg-accent/15",
          title: `Status changed to ${event.data.status}`,
          desc: event.data.note ?? "Case lifecycle progression",
        };
      case "rule.matched":
        return {
          icon: ShieldCheck,
          color: "text-accent",
          bgColor: "bg-accent/15",
          title: `Rule ${event.data.match.ruleId} matched: ${event.data.match.rule.title}`,
          desc: `${formatINR(event.data.match.totalAtStakePaise)} at stake · ${
            event.data.match.claimable
              ? "Statutory claim confirmed"
              : "Standard grievance"
          }`,
        };
      case "call.started":
        return {
          icon: PhoneCall,
          color: "text-accent",
          bgColor: "bg-accent/15",
          title: `Calling ${event.data.call.to}`,
          desc: `Voice leg: ${event.data.call.leg} call session initiated`,
        };
      case "call.state":
        return {
          icon: PhoneForwarded,
          color: "text-accent-2",
          bgColor: "bg-accent-2/15",
          title: `Advocate state: ${event.data.state}`,
          desc: "Autonomous negotiation progression",
        };
      case "call.ended":
        return {
          icon: CheckCircle2,
          color: event.data.status === "ended" ? "text-good" : "text-bad",
          bgColor: event.data.status === "ended" ? "bg-good/15" : "bg-bad/15",
          title: `Call concluded (${event.data.status})`,
          desc: event.data.outcome ?? "Call session ended",
        };
      case "transcript":
        return {
          icon: MessageSquare,
          color: "text-muted",
          bgColor: "bg-surface-2",
          title: `Dialogue (${event.data.line.speaker})`,
          desc: event.data.line.text,
        };
      case "commitment.recorded":
        return {
          icon: Sparkles,
          color: "text-good",
          bgColor: "bg-good/15",
          title: `Ticket ${event.data.commitment.ticketNo} captured ✅`,
          desc: `Promised resolution: ${
            event.data.commitment.promisedBy
              ? formatDate(event.data.commitment.promisedBy)
              : "Immediate"
          }`,
        };
      case "escalation.created":
        return {
          icon: AlertTriangle,
          color: "text-warn",
          bgColor: "bg-warn/15",
          title: `Escalation packet generated`,
          desc: `Forwarded to ${event.data.packet.to}`,
        };
      case "message.sent":
        return {
          icon: Send,
          color: "text-accent",
          bgColor: "bg-accent/15",
          title: `SMS dispatched to ${event.data.to}`,
          desc: event.data.text,
        };
      default:
        return {
          icon: Clock,
          color: "text-muted",
          bgColor: "bg-surface-2",
          title: (event as { type: string }).type,
          desc: "",
        };
    }
  };

  // Filter out noisy raw transcript lines in timeline to keep the audit trail clean
  const meaningfulEvents = sortedEvents.filter((e) => e.type !== "transcript");

  return (
    <div className="rounded-card border border-line bg-surface p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent-2" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
            Audit Timeline
          </h3>
        </div>
        <span className="font-mono text-[11px] text-muted">
          {meaningfulEvents.length} events
        </span>
      </div>

      <div className="max-h-64 overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-line">
        {meaningfulEvents.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted">
            No events logged yet.
          </div>
        ) : (
          meaningfulEvents.map((event) => {
            const details = getEventDetails(event);
            const Icon = details.icon;

            return (
              <div
                key={event.id}
                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-surface-2/40 transition text-xs"
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${details.bgColor} ${details.color} mt-0.5`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-ink truncate">
                      {details.title}
                    </span>
                    <span className="font-mono text-[10px] text-muted shrink-0 tabular-nums">
                      {formatTime(event.at)}
                    </span>
                  </div>
                  {details.desc && (
                    <p className="text-[11px] text-muted truncate mt-0.5">
                      {details.desc}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
