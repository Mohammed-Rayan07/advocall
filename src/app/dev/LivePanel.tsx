"use client";
// /dev live-voice controls: config status, "call me", fake-Vapi simulation, live call registry. Owner: Rayan.
import { useCallback, useEffect, useState } from "react";
import type { Lang } from "@/types";

interface LiveStatus {
  mode: "mock" | "live";
  ready: boolean;
  missing: string[];
  webReady: boolean;
  webMissing: string[];
  webhookUrl: string | null;
  model: string;
  defaultLang: Lang;
  companyPhone: string | null;
  teamPhones: string[];
  webhookSecret: string;
  calls: { callId: string; vapiCallId: string | null; leg: string; channel: string; caseId: string | null; to: string; inProgress: boolean; ended: boolean; lastState: string | null }[];
}

export function LivePanel() {
  const [st, setSt] = useState<LiveStatus | null>(null);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [lang, setLang] = useState<Lang>("hi");
  const [msg, setMsg] = useState<string>("");

  const refresh = useCallback(async () => {
    try {
      setSt(await fetch("/api/live/status").then((r) => r.json()));
    } catch {
      /* dev server restarting */
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(refresh, 0);
    const t = setInterval(refresh, 3000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [refresh]);

  async function post(url: string, body?: unknown) {
    setMsg("…");
    const r = await fetch(url, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const j = await r.json().catch(() => ({}));
    setMsg(r.ok ? `ok ${JSON.stringify(j)}` : `error ${j.error ?? r.status}`);
    refresh();
  }

  return (
    <section className="my-4 rounded border border-line p-3">
      <h2 className="text-accent">
        Live voice · MODE={st?.mode ?? "?"} · {st ? (st.ready ? "READY" : `not ready, missing: ${st.missing.join(", ")}`) : "loading"}
      </h2>
      {st && (
        <p className="mt-1 text-xs">
          Browser fallback (/talk): {st.webReady ? <span className="text-good">READY</span> : <span className="text-warn">missing {st.webMissing.join(", ")}</span>} ·{" "}
          <a className="text-accent underline" href="/talk?role=customer" target="_blank">
            customer tab
          </a>{" "}
          ·{" "}
          <a className="text-accent underline" href="/talk?role=company" target="_blank">
            company tab
          </a>
        </p>
      )}
      {st && (
        <p className="mt-1 text-xs text-muted">
          webhook {st.webhookUrl ?? "-"} · model {st.model} · company {st.companyPhone ?? "-"} · team [{st.teamPhones.join(", ")}] · secret {st.webhookSecret}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input className="w-44 rounded border border-line bg-surface px-2 py-1" placeholder="+91 phone (team only)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="w-36 rounded border border-line bg-surface px-2 py-1" placeholder="name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="rounded border border-line bg-surface px-2 py-1" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
          <option value="hi">Hindi</option>
          <option value="en">English</option>
          <option value="kn">Kannada</option>
        </select>
        <button
          className="rounded border border-good px-3 py-1 text-good disabled:opacity-40"
          disabled={!st?.ready || st.mode !== "live" || !phone}
          onClick={() => post("/api/live/call", { phone, name, lang })}
        >
          ☎ call me (real)
        </button>
        <span className="mx-2 text-muted">|</span>
        <button className="rounded border border-line px-3 py-1 hover:bg-surface-2" onClick={() => post("/api/live/simulate?scenario=promise&pace=1")}>
          ▶ simulate live: promise
        </button>
        <button className="rounded border border-line px-3 py-1 hover:bg-surface-2" onClick={() => post("/api/live/simulate?scenario=refusal&pace=1")}>
          ▶ simulate live: refusal
        </button>
        <button className="rounded border border-line px-2 py-1 hover:bg-surface-2" onClick={() => post("/api/live/simulate?scenario=promise&pace=10")}>
          10x
        </button>
      </div>
      {msg && <p className="mt-2 break-all text-xs text-muted">{msg}</p>}

      {st && st.calls.length > 0 && (
        <table className="mt-3 w-full text-xs">
          <thead className="text-muted">
            <tr>
              <th className="text-left">call</th>
              <th className="text-left">leg</th>
              <th className="text-left">via</th>
              <th className="text-left">case</th>
              <th className="text-left">to</th>
              <th className="text-left">state</th>
              <th className="text-left">vapi id</th>
            </tr>
          </thead>
          <tbody>
            {st.calls.map((c) => (
              <tr key={c.callId}>
                <td>{c.callId}</td>
                <td>{c.leg}</td>
                <td>{c.channel}</td>
                <td>{c.caseId ?? "-"}</td>
                <td>{c.to}</td>
                <td>{c.ended ? "ended" : c.inProgress ? `live ${c.lastState ?? ""}` : "dialing"}</td>
                <td>{c.vapiCallId ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
