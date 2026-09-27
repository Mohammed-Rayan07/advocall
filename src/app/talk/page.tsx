"use client";
// /talk: the no-Twilio fallback. A browser tab plays the phone. Owner: Rayan.
//   /talk?role=customer  -> start the intake, and answer the report-back when it rings
//   /talk?role=company   -> the "bank" teammate answers Advocall's call (on a SECOND device, via the https tunnel URL)
// Same webhooks, same events, same dashboard as real phone calls.
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Lang } from "@/types";

// Vapi Web SDK straight from a CDN (pinned), so the team never has to npm install anything.
const SDK_URLS = ["https://cdn.jsdelivr.net/npm/@vapi-ai/web@2.7.1/+esm", "https://esm.sh/@vapi-ai/web@2.7.1"];

interface VapiClient {
  start(assistant: unknown): Promise<unknown>;
  stop(): Promise<void>;
  on(event: string, fn: (arg: unknown) => void): void;
  setMuted(mute: boolean): void;
}
type VapiCtor = new (publicKey: string) => VapiClient;

async function loadVapi(): Promise<VapiCtor> {
  let last: unknown = null;
  for (const url of SDK_URLS) {
    try {
      const m = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url)) as { default: VapiCtor | { default: VapiCtor } };
      const ctor = typeof m.default === "function" ? m.default : m.default.default;
      if (typeof ctor === "function") return ctor;
    } catch (e) {
      last = e;
    }
  }
  throw new Error(`Could not load the Vapi web SDK (${String(last)})`);
}

type Role = "customer" | "company";
interface Line {
  who: "advocall" | "you";
  text: string;
}
interface Ringing {
  callId: string;
  leg: string;
  caseId: string;
}

const LEG_LABEL: Record<string, string> = {
  intake: "Intake call",
  advocate: "Advocall is calling the company",
  report: "Advocall is calling you back",
};

function TalkInner() {
  const params = useSearchParams();
  const router = useRouter();
  const role: Role = params.get("role") === "company" ? "company" : "customer";

  const [name, setName] = useState("");
  const [lang, setLang] = useState<Lang>("hi");
  const [phase, setPhase] = useState<"idle" | "connecting" | "live">("idle");
  const [leg, setLeg] = useState<string>("");
  const [lines, setLines] = useState<Line[]>([]);
  const [ringing, setRinging] = useState<Ringing[]>([]);
  const [error, setError] = useState("");
  const [volume, setVolume] = useState(0);
  const [muted, setMuted] = useState(false);
  const [secure, setSecure] = useState(true);
  const vapiRef = useRef<VapiClient | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSecure(window.isSecureContext), 0);
    return () => clearTimeout(t);
  }, []);

  // Poll for ringing legs while idle.
  useEffect(() => {
    if (phase !== "idle") return;
    let alive = true;
    const poll = async () => {
      try {
        const j = (await fetch(`/api/live/web/pending?role=${role}`, { cache: "no-store" }).then((r) => r.json())) as { ok: boolean; legs: Ringing[]; error?: string };
        if (!alive) return;
        setRinging(j.legs ?? []);
        if (!j.ok && j.error) setError(j.error);
      } catch {
        /* dev server restarting */
      }
    };
    poll();
    const t = setInterval(poll, 2000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [phase, role]);

  const run = useCallback(async (publicKey: string, assistant: unknown, legName: string, claimedCallId: string | null) => {
    // If an answered leg never starts (mic denied, SDK blocked, http page), hand it back so it rings again.
    let started = false;
    let released = false;
    const giveBack = () => {
      if (!claimedCallId || started || released) return;
      released = true;
      fetch(`/api/live/web/release?callId=${encodeURIComponent(claimedCallId)}`, { method: "POST" }).catch(() => {});
    };
    setError("");
    setLines([]);
    setLeg(legName);
    setPhase("connecting");
    try {
      const Vapi = await loadVapi();
      const vapi = new Vapi(publicKey);
      vapiRef.current = vapi;
      vapi.on("call-start", () => {
        started = true;
        setPhase("live");
      });
      vapi.on("call-end", () => {
        setError("");
        setPhase("idle");
        setVolume(0);
        vapiRef.current = null;
      });
      vapi.on("volume-level", (v) => setVolume(typeof v === "number" ? v : 0));
      vapi.on("error", (e) => {
        const detail = JSON.stringify(e);
        // Daily emits this teardown event after a normal room hangup; it is not a call failure.
        if (/meeting has ended/i.test(detail)) {
          setError("");
          setPhase("idle");
          setVolume(0);
          vapiRef.current = null;
          return;
        }
        setError(`Call error: ${detail.slice(0, 300)}`);
        setPhase((p) => (p === "connecting" ? "idle" : p));
        giveBack();
      });
      vapi.on("message", (m) => {
        const msg = m as { type?: string; transcriptType?: string; role?: string; transcript?: string };
        if (msg.type === "transcript" && msg.transcriptType === "final" && msg.transcript) {
          const line: Line = { who: msg.role === "user" ? "you" : "advocall", text: msg.transcript };
          setLines((prev) => [...prev.slice(-30), line]);
        }
      });
      const call = await vapi.start(assistant);
      if (!call) {
        setPhase("idle"); // start failed; the "error" event carries the reason
        giveBack();
      }
    } catch (e) {
      setError((e as Error).message);
      setPhase("idle");
      giveBack();
    }
  }, []);

  async function startIntake() {
    setError("");
    const r = await fetch("/api/live/web/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, lang }),
    });
    const j = (await r.json()) as { ok: boolean; error?: string; publicKey?: string; assistant?: unknown };
    if (!j.ok || !j.publicKey) return setError(j.error ?? "could not start");
    await run(j.publicKey, j.assistant, "intake", null);
  }

  async function answer(r: Ringing) {
    const res = await fetch(`/api/live/web/claim?role=${role}&callId=${encodeURIComponent(r.callId)}`, { method: "POST" });
    const j = (await res.json()) as { ok: boolean; error?: string; publicKey?: string; assistant?: unknown; leg?: string };
    if (!j.ok || !j.publicKey) return setError(j.error ?? "could not answer");
    await run(j.publicKey, j.assistant, j.leg ?? r.leg, r.callId);
  }

  const hangUp = () => vapiRef.current?.stop();
  const toggleMute = () => {
    vapiRef.current?.setMuted(!muted);
    setMuted(!muted);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-5 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">
          Advocall <span className="text-accent">· talk</span>
        </h1>
        <div className="flex gap-1 rounded-card border border-line p-1 text-sm">
          {(["customer", "company"] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => router.replace(`/talk?role=${r}`)}
              className={`rounded px-3 py-1 ${role === r ? "bg-accent text-bg" : "text-muted hover:text-ink"}`}
            >
              {r === "customer" ? "Customer" : "Company (bank)"}
            </button>
          ))}
        </div>
      </header>

      {!secure && (
        <p className="rounded-card border border-warn p-3 text-sm text-warn">
          The microphone only works on https or localhost. On a second device, open the https tunnel URL (PUBLIC_URL)/talk, not the 10.x address.
        </p>
      )}

      {phase === "idle" && ringing.length > 0 && (
        <div className="rounded-card border border-good bg-surface p-5">
          {ringing.map((r) => (
            <div key={r.callId} className="flex items-center justify-between gap-3">
              <div>
                <p className="animate-pulse text-lg text-good">📞 Incoming call</p>
                <p className="text-sm text-muted">
                  {LEG_LABEL[r.leg] ?? r.leg} · case {r.caseId}
                </p>
                {r.leg === "advocate" && <p className="mt-2 text-sm text-ink">Answer and speak first, like an IVR: “Welcome to HDFC Bank. For UPI complaints, press 2.”</p>}
              </div>
              <button onClick={() => answer(r)} className="rounded-card bg-good px-5 py-3 font-semibold text-bg">
                Answer
              </button>
            </div>
          ))}
        </div>
      )}

      {phase === "idle" && role === "customer" && ringing.length === 0 && (
        <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5">
          <p className="text-sm text-muted">Tell Advocall your money problem. It will call the company for you, then call you back here.</p>
          <input className="rounded border border-line bg-surface-2 px-3 py-2" placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
          <select className="rounded border border-line bg-surface-2 px-3 py-2" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="en">English</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
          </select>
          <button onClick={startIntake} className="rounded-card bg-accent px-5 py-3 font-semibold text-bg">
            🎙 Start talking to Advocall
          </button>
        </div>
      )}

      {phase === "idle" && role === "company" && ringing.length === 0 && (
        <div className="rounded-card border border-line bg-surface p-5 text-sm text-muted">
          Waiting for Advocall to call the company… keep this tab open. It rings here when the customer&apos;s intake call ends.
        </div>
      )}

      {phase !== "idle" && (
        <div className="flex flex-col gap-4 rounded-card border border-accent bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-ink">
              {phase === "connecting" ? "Connecting…" : "● Live"} <span className="text-muted">· {LEG_LABEL[leg] ?? leg}</span>
            </p>
            <div className="flex gap-2">
              <button onClick={toggleMute} className="rounded border border-line px-3 py-1 text-sm">
                {muted ? "Unmute" : "Mute"}
              </button>
              <button onClick={hangUp} className="rounded bg-bad px-3 py-1 text-sm text-bg">
                Hang up
              </button>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded bg-surface-2">
            <div className="h-full bg-accent transition-all" style={{ width: `${Math.min(100, Math.round(volume * 100))}%` }} />
          </div>
          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto text-sm">
            {lines.map((l, i) => (
              <p key={i} className={l.who === "you" ? "self-end rounded-card bg-surface-2 px-3 py-2" : "rounded-card border border-line px-3 py-2"}>
                <span className="mr-2 text-xs text-muted">{l.who === "you" ? "You" : "Advocall"}</span>
                {l.text}
              </p>
            ))}
          </div>
        </div>
      )}

      {error && <p className="rounded-card border border-bad p-3 text-sm text-bad">{error}</p>}
      <p className="text-xs text-muted">Use headphones. Customer and company should be on different devices to avoid echo.</p>
    </main>
  );
}

export default function TalkPage() {
  return (
    <Suspense>
      <TalkInner />
    </Suspense>
  );
}
