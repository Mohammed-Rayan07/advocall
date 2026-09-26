"use client";

import type { CaseStatus } from "@/types";
import clsx from "clsx";

interface StatusBadgeProps {
  status: CaseStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const configs: Record<
    CaseStatus,
    { label: string; bg: string; text: string; border: string; dot?: boolean }
  > = {
    intake: {
      label: "Intake",
      bg: "bg-accent-2/15",
      text: "text-accent-2",
      border: "border-accent-2/30",
    },
    open: {
      label: "Open",
      bg: "bg-surface-2",
      text: "text-muted",
      border: "border-line",
    },
    calling: {
      label: "Calling",
      bg: "bg-accent/15",
      text: "text-accent",
      border: "border-accent/30",
      dot: true,
    },
    promised: {
      label: "Promised",
      bg: "bg-good/15",
      text: "text-good",
      border: "border-good/30",
    },
    resolved: {
      label: "Resolved",
      bg: "bg-good",
      text: "text-bg font-semibold",
      border: "border-good",
    },
    escalated: {
      label: "Escalated",
      bg: "bg-warn/15",
      text: "text-warn",
      border: "border-warn/30",
    },
    failed: {
      label: "Failed",
      bg: "bg-bad/15",
      text: "text-bad",
      border: "border-bad/30",
    },
  };

  const config = configs[status] ?? configs.open;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide border",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {config.dot && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
      )}
      {config.label}
    </span>
  );
}
