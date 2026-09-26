// Plays a DemoScript through the SAME bus as live calls. SERVER ONLY. Owner: Rayan (LOCKED).
import type { DemoScript } from "@/types";
import { emit, schedule } from "./bus";

/** speed 1 = real time, 5 = five times faster. Returns total duration in ms. */
export function playScript(script: DemoScript, speed = 1): number {
  let t = 0;
  for (const step of script.steps) {
    t += Math.max(0, step.delayMs) / speed;
    schedule(() => emit(step.event), t);
  }
  return t;
}
