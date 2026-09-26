"use client";
// /dev — raw pipeline check. Owner: Rayan (LOCKED). Everyone can use it to verify their work.
import { useEffect, useState } from "react";
import { useCaseStream } from "@/lib/stream/useCaseStream";
import { formatINR, formatTime } from "@/lib/core/format";

export default function DevPage() {
  const { events, cases, connected, startDemo, reset } = useCaseStream();
  const [scripts, setScripts] = useState<{ id: string; title: string; steps: number }[]>([]);
  useEffect(() => {
    fetch("/api/demo/start").then((r) => r.json()).then(setScripts).catch(() => {});
  }, []);

  return (
    <main className="mx-auto max-w-6xl p-6 font-mono text-sm">
      <h1 className="text-lg text-accent">Advocall /dev · {connected ? "SSE connected" : "SSE disconnected"}</h1>
      <div className="my-4 flex flex-wrap gap-2">
        {scripts.map((s) => (
          <span key={s.id} className="flex gap-1">
            <button className="rounded border border-line px-3 py-1 hover:bg-surface-2" onClick={() => startDemo(s.id, 1)}>
              ▶ {s.id} ({s.steps})
            </button>
            <button className="rounded border border-line px-2 py-1 hover:bg-surface-2" onClick={() => startDemo(s.id, 10)}>
              10x
            </button>
          </span>
        ))}
        <button className="rounded border border-bad px-3 py-1 text-bad" onClick={reset}>reset</button>
      </div>
      <h2 className="mt-4 text-muted">Cases ({cases.length})</h2>
      {cases.map((v) => (
        <div key={v.case.id} className="my-2 rounded border border-line p-3">
          <b>{v.case.id}</b> · {v.case.company} · {formatINR(v.case.amountPaise)} · status <b>{v.case.status}</b> · rule{" "}
          {v.match?.ruleId ?? "-"} · at stake {v.match ? formatINR(v.match.totalAtStakePaise) : "-"} · ticket {v.commitment?.ticketNo ?? "-"} · calls{" "}
          {v.calls.map((c) => `${c.leg}:${c.status}${c.advocateState ? "/" + c.advocateState : ""}`).join(", ")} · transcript {v.transcript.length} · sms{" "}
          {v.messages.length} · escalation {v.escalation ? "yes" : "no"}
          <button className="ml-3 rounded border border-warn px-2 text-warn" onClick={() => fetch(`/api/cases/${v.case.id}/escalate`, { method: "POST" })}>
            escalate
          </button>
        </div>
      ))}
      <h2 className="mt-4 text-muted">Events ({events.length})</h2>
      <pre className="max-h-[50vh] overflow-auto rounded border border-line bg-surface p-3 text-xs">
        {events
          .slice()
          .reverse()
          .map((e) => `${formatTime(e.at)}  ${e.caseId}  ${e.type.padEnd(20)} ${JSON.stringify(e.data).slice(0, 140)}`)
          .join("\n")}
      </pre>
    </main>
  );
}
