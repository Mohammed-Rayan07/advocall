"use client";

import { motion } from "motion/react";
import { PhoneCall, ShieldCheck, Play, Bot, Sparkles } from "lucide-react";
import { t } from "@/content";
import type { Lang } from "@/types";

interface EmptyStateProps {
  onDemo: (scriptId: string, speed?: number) => void;
  lang?: Lang;
}

export default function EmptyState({ onDemo, lang = "en" }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center p-12 text-center rounded-card bg-surface border border-line my-6"
    >
      <div className="relative mb-6 flex items-center justify-center">
        {/* Ambient glow behind icon composition */}
        <div className="absolute -inset-4 rounded-full bg-accent/10 blur-xl" />
        
        {/* Multi-icon composition */}
        <div className="relative flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 border border-line text-accent shadow-lg shadow-accent/5">
            <Bot className="h-8 w-8" />
          </div>
          <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-good/15 border border-good/30 text-good">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-xl bg-accent-2/15 border border-accent-2/30 text-accent-2">
            <PhoneCall className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 border border-line text-xs font-medium text-accent mb-3">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Autonomous Legal Advocate</span>
      </div>

      <h2 className="text-xl font-semibold tracking-tight text-ink max-w-md">
        {t("noCases", lang)}
      </h2>
      <p className="mt-2 text-sm text-muted max-w-lg leading-relaxed">
        Watch Advocall call customer support, cite statutory RBI &amp; consumer protection turnaround rights, wait on hold, and secure official complaint tickets.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => onDemo("quick", 1)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition hover:opacity-90 active:scale-95 shadow-md shadow-accent/10 cursor-pointer"
        >
          <Play className="h-4 w-4 fill-current" />
          <span>{t("startDemo", lang)}</span>
        </button>
        <button
          onClick={() => onDemo("quick", 5)}
          className="inline-flex items-center gap-2 rounded-lg bg-surface-2 border border-line px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-line/40 active:scale-95 cursor-pointer"
        >
          <span>Run Quick (5× speed)</span>
        </button>
      </div>
    </motion.div>
  );
}
