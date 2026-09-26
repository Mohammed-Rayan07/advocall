"use client";

import { useState, useRef, useEffect } from "react";
import { Play, ChevronDown, RotateCcw, Zap } from "lucide-react";
import { t } from "@/content";
import type { Lang } from "@/types";

interface HeaderProps {
  connected: boolean;
  lang: Lang;
  onLang: (lang: Lang) => void;
  onDemo: (scriptId: string, speed?: number) => void;
  onReset: () => void;
}

export default function Header({
  connected,
  lang,
  onLang,
  onDemo,
  onReset,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages: { id: Lang; label: string }[] = [
    { id: "en", label: "EN" },
    { id: "hi", label: "हि" },
    { id: "kn", label: "ಕ" },
  ];

  const demoScripts = [
    { id: "quick", label: "Quick demo", desc: "Short simulated UPI call", speed: 1 },
    { id: "quick", label: "Quick demo (5× fast)", desc: "Accelerated playback", speed: 5 },
    { id: "upi", label: "UPI Hero dispute", desc: "Full T+1 TAT & ₹100/day claim", speed: 1 },
    { id: "ecom", label: "E-Commerce return", desc: "30-day refund window", speed: 1 },
    { id: "refusal", label: "Refusal & Escalation", desc: "Company push-back → Ombudsman", speed: 1 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-bg/95 backdrop-blur px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
        {/* Left: Brand + Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            <span className="text-xl font-bold tracking-tight text-ink">
              Advocall
            </span>
          </div>

          <span className="hidden text-xs text-muted md:inline-block border-l border-line pl-3">
            {t("tagline", lang)}
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Live / Offline status badge */}
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
              connected
                ? "bg-accent/10 border-accent/30 text-accent"
                : "bg-bad/10 border-bad/30 text-bad"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connected ? "bg-accent animate-pulse-dot" : "bg-bad"
              }`}
            />
            <span>{connected ? t("connected", lang) : t("disconnected", lang)}</span>
          </div>

          {/* Language toggle: EN | हि | ಕ */}
          <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
            {languages.map((l) => (
              <button
                key={l.id}
                onClick={() => onLang(l.id)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition cursor-pointer ${
                  lang === l.id
                    ? "bg-surface-2 text-accent border border-accent/30"
                    : "text-muted hover:text-ink"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Demo Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-bg transition hover:opacity-90 active:scale-95 shadow-sm shadow-accent/10 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{t("startDemo", lang)}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-card border border-line bg-surface p-1.5 shadow-2xl z-50">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted border-b border-line mb-1">
                  Select Demo Script
                </div>
                {demoScripts.map((s, idx) => (
                  <button
                    key={`${s.id}-${s.speed}-${idx}`}
                    onClick={() => {
                      setDropdownOpen(false);
                      onDemo(s.id, s.speed);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-surface-2 transition flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="font-medium text-ink group-hover:text-accent flex items-center gap-1.5">
                        {s.speed > 1 && <Zap className="h-3 w-3 text-warn" />}
                        {s.label}
                      </div>
                      <div className="text-[11px] text-muted">{s.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset button */}
          <button
            onClick={onReset}
            title={t("reset", lang)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-muted transition hover:border-bad/40 hover:text-bad cursor-pointer active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("reset", lang)}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
