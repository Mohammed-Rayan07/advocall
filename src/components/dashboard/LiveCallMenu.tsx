"use client";

import { useEffect, useRef, useState } from "react";
import { PhoneOutgoing, Globe } from "lucide-react";
import type { Lang } from "@/types";
import { t } from "@/content";

interface LiveStatus {
  mode: "mock" | "live";
  ready: boolean;
  webReady: boolean;
}

/** Header menu: start a REAL intake call (Vapi) or open the browser-call fallback. Talks to Rayan's /api/live/*. */
export default function LiveCallMenu({ lang = "en" }: { lang?: Lang }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<LiveStatus | null>(null);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [callLang, setCallLang] = useState<Lang>("hi");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/live/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: LiveStatus) => setStatus(j))
      .catch(() => setStatus(null));
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const phoneReady = status?.mode === "live" && status.ready;
  const webReady = status?.mode === "live" && status.webReady;

  async function callMe() {
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch("/api/live/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, lang: callLang }),
      });
      const j = (await r.json()) as { ok: boolean; error?: string };
      setMsg(j.ok ? t("calling", lang) : (j.error ?? "error"));
      if (j.ok) setTimeout(() => setOpen(false), 1200);
    } catch {
      setMsg("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative hidden sm:block" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-lg border border-good/40 bg-good/10 px-2.5 py-1.5 text-xs font-semibold text-good transition hover:bg-good/20 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-good"
      >
        <PhoneOutgoing className="h-3.5 w-3.5" />
        <span className="hidden md:inline">{t("liveCall", lang)}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-card border border-line bg-surface p-3 shadow-2xl z-50 space-y-2.5 text-xs">
          <div className="font-semibold uppercase tracking-wider text-muted">{t("liveCallTitle", lang)}</div>
          {!status ? (
            <p className="text-muted">…</p>
          ) : !phoneReady && !webReady ? (
            <p className="text-warn leading-relaxed">{t("liveOff", lang)}</p>
          ) : null}

          {phoneReady && (
            <div className="space-y-2">
              <input
                className="w-full rounded border border-line bg-surface-2 px-2.5 py-1.5 text-ink"
                placeholder={t("yourPhone", lang)}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
              />
              <input
                className="w-full rounded border border-line bg-surface-2 px-2.5 py-1.5 text-ink"
                placeholder={t("yourName", lang)}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="flex gap-2">
                <select
                  className="flex-1 rounded border border-line bg-surface-2 px-2 py-1.5 text-ink"
                  value={callLang}
                  onChange={(e) => setCallLang(e.target.value as Lang)}
                >
                  <option value="hi">हिंदी</option>
                  <option value="en">English</option>
                  <option value="kn">ಕನ್ನಡ</option>
                </select>
                <button
                  onClick={callMe}
                  disabled={busy || !phone}
                  className="rounded-lg bg-good px-3 py-1.5 font-semibold text-bg disabled:opacity-40 cursor-pointer"
                >
                  {busy ? t("calling", lang) : t("callMe", lang)}
                </button>
              </div>
            </div>
          )}

          {webReady && (
            <a
              href="/talk?role=customer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-accent hover:underline"
            >
              <Globe className="h-3.5 w-3.5" />
              {t("browserCall", lang)}
            </a>
          )}
          {msg && <p className="break-words text-muted">{msg}</p>}
        </div>
      )}
    </div>
  );
}
