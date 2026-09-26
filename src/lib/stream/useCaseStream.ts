"use client";
// THE ONLY WAY the dashboard gets data. Owner: Rayan (LOCKED).
// Usage:  const { cases, connected, startDemo, reset } = useCaseStream();
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdvocallEvent, CaseView } from "@/types";
import { reduceEvents, sortedCases } from "@/lib/core/reduce";

export interface CaseStream {
  cases: CaseView[]; // newest first
  byId: Record<string, CaseView>;
  events: AdvocallEvent[]; // raw log, oldest first
  connected: boolean;
  startDemo: (scriptId: string, speed?: number) => Promise<void>;
  reset: () => Promise<void>;
}

export function useCaseStream(): CaseStream {
  const [events, setEvents] = useState<AdvocallEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource("/api/stream");
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false); // EventSource auto-reconnects
    es.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === "__snapshot") setEvents(data.events);
      else if (data.type === "__reset") setEvents([]);
      else setEvents((prev) => [...prev, data as AdvocallEvent]);
    };
    return () => es.close();
  }, []);

  const byId = useMemo(() => reduceEvents(events), [events]);
  const cases = useMemo(() => sortedCases(byId), [byId]);

  const startDemo = useCallback(async (scriptId: string, speed = 1) => {
    await fetch(`/api/demo/start?script=${encodeURIComponent(scriptId)}&speed=${speed}`, { method: "POST" });
  }, []);
  const reset = useCallback(async () => {
    await fetch(`/api/demo/reset`, { method: "POST" });
  }, []);

  return { cases, byId, events, connected, startDemo, reset };
}
