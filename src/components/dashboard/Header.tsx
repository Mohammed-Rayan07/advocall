"use client";

import { useState, useRef, useEffect } from "react";
import { Play, ChevronDown, RotateCcw, Zap, MonitorPlay, Scale } from "lucide-react";
import { t } from "@/content";
import type { Lang } from "@/types";
import LiveCallMenu from "./LiveCallMenu";

interface HeaderProps {
  connected: boolean;
  lang: Lang;
  onLang: (lang: Lang) => void;
  onDemo: (scriptId: string, speed?: number) => void;
  onReset: () => void;
  presentMode?: boolean;
  onTogglePresent?: () => void;
}

export default function Header({
  connected,
  lang,
  onLang,
  onDemo,
  onReset,
  presentMode = false,
  onTogglePresent,
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
    { id: "telecom", label: "Telecom bill dispute", desc: "Airtel overcharge, no legal claim (R3 unverified)", speed: 1 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-bg/90 backdrop-blur-md px-3 py-3 sm:px-6">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand + Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-bg shadow-[0_4px_16px_-4px_var(--color-accent)]">
              <Scale className="h-[18px] w-[18px]" strokeWidth={2.25} />
            </span>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-gradient font-sans">
              Advocall
            </span>
          </div>

          <span className="hidden text-xs text-muted md:inline-block border-l border-line pl-3">
            {t("tagline", lang)}
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Live / Offline status badge */}
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 sm:px-2.5 text-xs font-medium border ${
              connected
                ? "bg-accent/10 border-accent/30 text-accent shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                : "bg-bad/10 border-bad/30 text-bad"
            }`}
            title={connected ? t("connected", lang) : t("disconnected", lang)}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connected ? "bg-accent animate-pulse-dot" : "bg-bad"
              }`}
            />
            <span className="hidden sm:inline">
              {connected ? t("connected", lang) : t("disconnected", lang)}
            </span>
          </div>

          {/* Language toggle: EN | हि | ಕ */}
          <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
            {languages.map((l) => (
              <button
                key={l.id}
                onClick={() => onLang(l.id)}
                aria-label={`Switch language to ${l.label}`}
                className={`rounded-md px-1.5 sm:px-2.5 py-1 text-xs font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  lang === l.id
                    ? "bg-surface-2 text-accent border border-accent/30 font-semibold"
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
              aria-label="Run demo menu"
              aria-expanded={dropdownOpen}
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg bg-gradient-to-br from-accent to-accent-2 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-bg transition hover:brightness-110 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg shadow-soft"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span className="hidden sm:inline">{t("startDemo", lang)}</span>
              <span className="sm:hidden">{t("demo", lang)}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-card border border-line bg-surface-2 p-1.5 shadow-elevated z-50">
                <div className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted border-b border-line mb-1">
                  {t("chooseDemo", lang)}
                </div>
                {demoScripts.map((s, idx) => (
                  <button
                    key={`${s.id}-${s.speed}-${idx}`}
                    onClick={() => {
                      setDropdownOpen(false);
                      onDemo(s.id, s.speed);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-surface-2 transition flex items-center justify-between group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                  >
                    <div>
                      <div className="font-semibold text-ink group-hover:text-accent flex items-center gap-1.5">
                        {s.speed > 1 && <Zap className="h-3 w-3 text-warn" />}
                        {s.label}
                      </div>
                      <div className="text-xs text-muted">{s.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Live call (real phone / browser call) */}
          <LiveCallMenu lang={lang} />

          {/* Present button (Projector mode) */}
          <button
            onClick={onTogglePresent}
            title="Toggle presentation mode for projectors (shortcut: P)"
            aria-label="Toggle presentation mode"
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              presentMode
                ? "bg-gradient-to-br from-accent to-accent-2 text-bg border-accent shadow-soft"
                : "border-line bg-surface text-muted hover:border-accent/40 hover:text-accent"
            }`}
          >
            <MonitorPlay className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("present", lang)}</span>
            <span className="hidden lg:inline opacity-75 font-mono ml-0.5">P</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onReset}
            title={t("reset", lang)}
            aria-label={t("reset", lang)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-muted transition hover:border-bad/40 hover:text-bad cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bad"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("reset", lang)}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
