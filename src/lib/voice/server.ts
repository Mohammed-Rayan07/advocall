// Wires the orchestrator to the real bus, clock and Vapi. SERVER ONLY. Owner: Rayan.
import { emit, schedule } from "@/lib/core/bus";
import { todayIST } from "@/lib/core/format";
import { readVoiceConfig } from "./config";
import { createPhoneCall } from "./vapi";
import { handleVapiWebhook, startIntakeCall, type OrchestratorDeps } from "./orchestrator";
import { simConfig, simPersona, simulatedDialer, type SimScenario } from "./simulate";

const fireAndForget = (task: () => Promise<void>) => {
  task().catch((e: unknown) => console.error("[advocall/live] deferred task failed:", e));
};

/** Deps for real calls. `defer` defaults to fire-and-forget; the webhook route passes next/server `after`. */
export function liveDeps(defer: OrchestratorDeps["defer"] = fireAndForget): OrchestratorDeps {
  const { config } = readVoiceConfig();
  return {
    emit,
    dial: (req) => createPhoneCall(config, req),
    config,
    today: () => todayIST(),
    now: () => new Date().toISOString(),
    defer,
  };
}

/** Browser-call routes: null if allowed, else the reason (MODE=live + PUBLIC_URL + VAPI_PUBLIC_KEY needed). */
export function webGate(): string | null {
  const { mode, webReady, webMissing } = readVoiceConfig();
  if (mode !== "live") return "Set MODE=live in .env.local and restart npm run dev";
  if (!webReady) return `Browser calls need these in .env.local: ${webMissing.join(", ")}`;
  return null;
}

export function publicKey(): string {
  return readVoiceConfig().config.publicKey;
}

/** Plays a whole live pipeline (intake -> advocate -> report) with fake webhooks through the real bus. */
export async function runSimulation(scenario: SimScenario, pace = 1): Promise<{ callId: string }> {
  const today = todayIST();
  const deps: OrchestratorDeps = {
    ...liveDeps(fireAndForget),
    config: simConfig(readVoiceConfig().config),
    dial: async () => ({ id: "unused" }),
  };
  deps.dial = simulatedDialer(
    scenario,
    today,
    (body, atMs) =>
      schedule(() => {
        handleVapiWebhook(deps, body).catch((e: unknown) => console.error("[advocall/sim] webhook failed:", e));
      }, atMs),
    pace,
  );
  const p = simPersona(scenario);
  const { callId } = await startIntakeCall(deps, { phone: p.phone, name: null, lang: p.lang });
  return { callId };
}
