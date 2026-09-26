"use client";
// Owner: VAISHNAVI. Placeholder: replace following team/MANUAL_VAISHNAVI.md.
import { useCaseStream } from "@/lib/stream/useCaseStream";

export default function Dashboard() {
  const { cases, connected, startDemo } = useCaseStream();
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold text-accent">Advocall</h1>
      <p className="text-muted">{connected ? "Live" : "Connecting..."} · {cases.length} cases</p>
      <button className="mt-4 rounded-lg bg-accent px-4 py-2 font-medium text-bg" onClick={() => startDemo("quick")}>
        Run quick demo
      </button>
    </main>
  );
}
