// In-memory event bus + event log. SERVER ONLY. Owner: Rayan (LOCKED).
// Every action in the app calls emit(). The SSE route streams these to the dashboard.
import type { AdvocallEvent, EventInput } from "@/types";
import { newId } from "./ids";

type Listener = (ev: AdvocallEvent) => void;

interface BusState {
  log: AdvocallEvent[];
  listeners: Set<Listener>;
  timers: Set<ReturnType<typeof setTimeout>>;
}

// Survive Next.js dev hot-reloads.
const g = globalThis as unknown as { __advocallBus?: BusState };
const bus: BusState = (g.__advocallBus ??= { log: [], listeners: new Set(), timers: new Set() });

export function emit(input: EventInput): AdvocallEvent {
  const ev = { ...input, id: newId(), at: new Date().toISOString() } as AdvocallEvent;
  bus.log.push(ev);
  for (const l of bus.listeners) {
    try {
      l(ev);
    } catch {
      /* a broken listener must never break emit */
    }
  }
  return ev;
}

export function allEvents(): AdvocallEvent[] {
  return bus.log;
}

export function subscribe(l: Listener): () => void {
  bus.listeners.add(l);
  return () => bus.listeners.delete(l);
}

export function schedule(fn: () => void, ms: number) {
  const t = setTimeout(() => {
    bus.timers.delete(t);
    fn();
  }, ms);
  bus.timers.add(t);
}

/** Clears the log and cancels scheduled demo steps. Connected dashboards get a reset signal. */
export function resetBus() {
  for (const t of bus.timers) clearTimeout(t);
  bus.timers.clear();
  bus.log.length = 0;
  for (const l of bus.listeners) {
    try {
      l({ type: "__reset" } as unknown as AdvocallEvent);
    } catch {}
  }
}
