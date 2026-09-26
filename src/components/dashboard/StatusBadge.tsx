"use client";

import type { CaseStatus, Lang } from "@/types";
import { t, type StringKey } from "@/content";
import clsx from "clsx";
import {
  Inbox,
  Clock,
  PhoneCall,
  Check,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  type LucideIcon,
} from "lucide-react";

interface StatusBadgeProps {
  status: CaseStatus;
  className?: string;
  lang?: Lang;
}

export default function StatusBadge({ status, className, lang = "en" }: StatusBadgeProps) {
  const configs: Record<
    CaseStatus,
    {
      label: StringKey;
      bg: string;
      text: string;
      border: string;
      icon: LucideIcon;
      dot?: boolean;
    }
  > = {
    intake: {
      label: "statusIntake",
      bg: "bg-accent-2/15",
      text: "text-accent-2",
      border: "border-accent-2/30",
      icon: Inbox,
    },
    open: {
      label: "statusOpen",
      bg: "bg-surface-2",
      text: "text-muted",
      border: "border-line",
      icon: Clock,
    },
    calling: {
      label: "statusCalling",
      bg: "bg-accent/15",
      text: "text-accent",
      border: "border-accent/30",
      icon: PhoneCall,
      dot: true,
    },
    promised: {
      label: "statusPromised",
      bg: "bg-good/15",
      text: "text-good",
      border: "border-good/30",
      icon: Check,
    },
    resolved: {
      label: "statusResolved",
      bg: "bg-good",
      text: "text-bg font-semibold",
      border: "border-good",
      icon: CheckCircle2,
    },
    escalated: {
      label: "statusEscalated",
      bg: "bg-warn/15",
      text: "text-warn",
      border: "border-warn/30",
      icon: AlertTriangle,
    },
    failed: {
      label: "statusFailed",
      bg: "bg-bad/15",
      text: "text-bad",
      border: "border-bad/30",
      icon: XCircle,
    },
  };

  const config = configs[status] ?? configs.open;
  const Icon = config.icon;

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
      <Icon className="h-3 w-3 shrink-0" />
      {config.dot && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
      )}
      <span>{t(config.label, lang)}</span>
    </span>
  );
}
