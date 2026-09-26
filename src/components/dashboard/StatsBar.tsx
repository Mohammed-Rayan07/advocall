"use client";

import { useEffect, useState, useRef } from "react";
import { animate } from "motion/react";
import { Activity, ShieldAlert, CheckCircle2, PhoneCall } from "lucide-react";
import { formatINR } from "@/lib/core/format";
import { t } from "@/content";
import type { CaseView, Lang } from "@/types";

interface StatsBarProps {
  cases: CaseView[];
  lang?: Lang;
}

function AnimatedStat({
  value,
  isCurrency = false,
  className = "",
}: {
  value: number;
  isCurrency?: boolean;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const from = prevValueRef.current;
    prevValueRef.current = value;
    const controls = animate(from, value, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span className={`tabular-nums font-mono font-bold ${className}`}>
      {isCurrency ? formatINR(displayValue) : displayValue.toLocaleString("en-IN")}
    </span>
  );
}

export default function StatsBar({ cases, lang = "en" }: StatsBarProps) {
  const activeCases = cases.filter(
    (c) => c.case.status !== "resolved" && c.case.status !== "failed"
  ).length;

  const totalAtStakePaise = cases.reduce(
    (sum, c) => sum + (c.match?.totalAtStakePaise ?? 0),
    0
  );

  const totalCommittedPaise = cases.reduce(
    (sum, c) =>
      sum + (c.commitment ? c.match?.totalAtStakePaise ?? c.case.amountPaise : 0),
    0
  );

  const totalCalls = cases.reduce((sum, c) => sum + c.calls.length, 0);

  const stats = [
    {
      label: t("liveCases", lang),
      value: activeCases,
      isCurrency: false,
      color: "text-ink",
      icon: Activity,
      iconColor: "text-accent-2",
      badge: "In flight",
    },
    {
      label: t("atStake", lang),
      value: totalAtStakePaise,
      isCurrency: true,
      color: "text-money",
      icon: ShieldAlert,
      iconColor: "text-money",
      badge: "Disputed",
    },
    {
      label: t("recovered", lang),
      value: totalCommittedPaise,
      isCurrency: true,
      color: "text-good",
      icon: CheckCircle2,
      iconColor: "text-good",
      badge: "Ticket confirmed",
    },
    {
      label: "Calls made",
      value: totalCalls,
      isCurrency: false,
      color: "text-accent",
      icon: PhoneCall,
      iconColor: "text-accent",
      badge: "Voice legs",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="flex flex-col justify-between rounded-card border border-line bg-surface p-4 transition-all hover:border-line/80 shadow-sm"
          >
            <div className="flex items-center justify-between text-xs text-muted mb-2">
              <span className="font-medium tracking-wide uppercase text-[11px]">
                {stat.label}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted hidden sm:inline-block">
                  {stat.badge}
                </span>
                <Icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight">
              <AnimatedStat
                value={stat.value}
                isCurrency={stat.isCurrency}
                className={stat.color}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
