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

  // Full literal class names per badge color (Tailwind's scanner needs the whole
  // string in source; template interpolation like `bg-${x}/10` is invisible to it).
  const GLOW = {
    "accent-2": "bg-accent-2/10 text-accent-2 shadow-[0_0_18px_-4px_var(--color-accent-2)]",
    money: "bg-money/10 text-money shadow-[0_0_18px_-4px_var(--color-money)]",
    good: "bg-good/10 text-good shadow-[0_0_18px_-4px_var(--color-good)]",
    accent: "bg-accent/10 text-accent shadow-[0_0_18px_-4px_var(--color-accent)]",
  } as const;

  const stats = [
    {
      label: t("liveCases", lang),
      value: activeCases,
      isCurrency: false,
      color: "text-ink",
      icon: Activity,
      glow: GLOW["accent-2"],
      badge: t("inFlight", lang),
    },
    {
      label: t("atStake", lang),
      value: totalAtStakePaise,
      isCurrency: true,
      color: "text-money",
      icon: ShieldAlert,
      glow: GLOW.money,
      badge: t("disputed", lang),
    },
    {
      label: t("committed", lang),
      value: totalCommittedPaise,
      isCurrency: true,
      color: "text-good",
      icon: CheckCircle2,
      glow: GLOW.good,
      badge: t("ticketConfirmed", lang),
    },
    {
      label: t("callsMade", lang),
      value: totalCalls,
      isCurrency: false,
      color: "text-accent",
      icon: PhoneCall,
      glow: GLOW.accent,
      badge: t("voiceLegs", lang),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="flex flex-col justify-between rounded-card border border-line bg-surface p-4 transition-all hover:border-line/80 hover:-translate-y-0.5 shadow-soft"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold tracking-wide uppercase text-muted">
                {stat.label}
              </span>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${stat.glow}`}
              >
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                <AnimatedStat
                  value={stat.value}
                  isCurrency={stat.isCurrency}
                  className={stat.color}
                />
              </div>
              <span className="text-xs text-muted/80 hidden sm:inline-block pb-0.5">
                {stat.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
