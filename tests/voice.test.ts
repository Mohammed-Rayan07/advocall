// Live voice pipeline acceptance tests (Owner: Rayan). No network: a fake Vapi replays webhook payloads.
// The key promise: live mode emits the SAME event sequence as the mock demo scripts.
import { beforeEach, describe, expect, it } from "vitest";
import type { AdvocallEvent, DemoScript, EventInput } from "@/types";
import { reduceEvents } from "@/lib/core/reduce";
import { RULES, addDays } from "@/lib/rules";
import { normalizePhone, readVoiceConfig } from "@/lib/voice/config";
import { parseVapiMessage } from "@/lib/voice/messages";
import {
  authorizeWebhook,
  claimWebLeg,
  handleVapiWebhook,
  LiveCallError,
  peekWebLegs,
  releaseWebLeg,
  startWebIntake,
  resetLive,
  startIntakeCall,
  type OrchestratorDeps,
  type WebhookResult,
} from "@/lib/voice/orchestrator";
import { WEBHOOK_SECRET_HEADER, type VapiAssistant } from "@/lib/voice/assistants";
import { SIM_COMPANY_PHONE, SIM_USER_PHONE, simConfig, simPersona, simulatedDialer, type SimScenario } from "@/lib/voice/simulate";
import { upiScript } from "@/mock/scripts/upi";
import { refusalScript } from "@/mock/scripts/refusal";

const TODAY = "2026-09-26";

interface Run {
  events: AdvocallEvent[];
  responses: WebhookResult[];
  dialed: { to: string; assistant: VapiAssistant }[];
  deps: OrchestratorDeps;
}

function makeDeps(events: AdvocallEvent[], deferred: (() => Promise<void>)[]): OrchestratorDeps {
  let n = 0;
  return {
    emit: (e: EventInput) => {
      n += 1;
      events.push({ ...e, id: `ev${n}`, at: new Date(Date.UTC(2026, 8, 26, 10, 0, n)).toISOString() } as AdvocallEvent);
    },
    dial: async () => ({ id: "unused" }),
    config: simConfig(readVoiceConfig({}).config),
    today: () => TODAY,
    now: () => new Date().toISOString(),
    defer: (t) => deferred.push(t),
    log: () => {},
  };
}

async function runScenario(scenario: SimScenario): Promise<Run> {
  const events: AdvocallEvent[] = [];
  const responses: WebhookResult[] = [];
  const dialed: Run["dialed"] = [];
  const deferred: (() => Promise<void>)[] = [];
  const queue: unknown[] = [];
  const deps = makeDeps(events, deferred);
  const sim = simulatedDialer(scenario, TODAY, (body) => queue.push(body));
  deps.dial = async (req) => {
    dialed.push({ to: req.to, assistant: req.assistant });
    return sim(req);
  };
  const p = simPersona(scenario);
  await startIntakeCall(deps, { phone: p.phone, lang: p.lang });
  while (queue.length || deferred.length) {
    if (queue.length) responses.push(await handleVapiWebhook(deps, queue.shift()));
    else await deferred.shift()!();
  }
  return { events, responses, dialed, deps };
}

/** Event types in order, without transcript lines and advocate states (their count naturally differs). */
function skeleton(types: { type: string; data: unknown }[]): string[] {
  return types
    .filter((e) => e.type !== "transcript" && e.type !== "call.state")
    .map((e) => (e.type === "case.status" ? `status:${(e.data as { status: string }).status}` : e.type));
}

const mockSkeleton = (s: DemoScript) => skeleton(s.steps.map((x) => x.event));

beforeEach(() => resetLive());

describe("live pipeline: promise path (UPI, Hindi)", () => {
  it("emits the same event skeleton as the upi mock demo", async () => {
    const { events } = await runScenario("promise");
    expect(skeleton(events)).toEqual(mockSkeleton(upiScript));
  });

  it("creates a live case with its own id range and engine-computed rights", async () => {
    const { events } = await runScenario("promise");
    const view = Object.values(reduceEvents(events))[0];
    expect(view.case.id).toBe("A-0201");
    expect(view.case.userPhone).toBe(SIM_USER_PHONE);
    expect(view.case.language).toBe("hi");
    expect(view.case.amountPaise).toBe(275000);
    expect(view.case.incidentDate).toBe(addDays(TODAY, -4));
    expect(view.case.txnRef).toBe("UPI66302915");
    expect(view.match?.ruleId).toBe("R1");
    expect(view.match?.daysLate).toBe(3);
    expect(view.match?.compensationPaise).toBe(30000);
    expect(view.case.status).toBe("promised");
  });

  it("flushes intake lines spoken before create_case into the case transcript", async () => {
    const { events } = await runScenario("promise");
    const view = Object.values(reduceEvents(events))[0];
    const intake = view.calls.find((c) => c.leg === "intake")!;
    const lines = view.transcript.filter((l) => l.callId === intake.id);
    expect(lines.length).toBe(7); // greeting + 5 lines + outro
    expect(lines[0].speaker).toBe("agent");
    expect(lines[1].speaker).toBe("user");
    expect(lines.every((l) => l.language === "hi")).toBe(true);
  });

  it("dials the company with the engine's brief, then calls the user back", async () => {
    const { dialed } = await runScenario("promise");
    expect(dialed.map((d) => d.to)).toEqual([SIM_USER_PHONE, SIM_COMPANY_PHONE, SIM_USER_PHONE]);
    expect(dialed.map((d) => d.assistant.metadata.advocall.leg)).toEqual(["intake", "advocate", "report"]);
    const advPrompt = dialed[1].assistant.model.messages[0].content;
    expect(advPrompt).toContain(RULES.R1.citeText);
    expect(advPrompt).toContain("₹2,750");
    expect(advPrompt).toContain("UPI66302915");
    expect(dialed[1].assistant.firstMessageMode).toBe("assistant-waits-for-user");
    const report = dialed[2].assistant;
    expect(report.firstMessage).toContain("SBI4471902");
    expect(report.voice.voiceId).toMatch(/^hi-IN/);
  });

  it("records the commitment, walks the advocate states, and sends the SMS text", async () => {
    const { events } = await runScenario("promise");
    const view = Object.values(reduceEvents(events))[0];
    expect(view.commitment).toEqual({
      caseId: "A-0201",
      ticketNo: "SBI4471902",
      promisedBy: addDays(TODAY, 3),
      compensationAck: true,
      confirmed: true,
    });
    const advId = view.calls.find((c) => c.leg === "advocate")!.id;
    const states = events.filter((e) => e.type === "call.state" && e.data.callId === advId).map((e) => (e.type === "call.state" ? e.data.state : ""));
    expect(states).toEqual(["DISCLOSE", "NAVIGATE", "HOLD", "STATE_CASE", "ASK", "PUSH_BACK", "CAPTURE", "CLOSE"]);
    expect(view.calls.map((c) => c.status)).toEqual(["ended", "ended", "ended"]);
    expect(view.messages).toHaveLength(1);
    expect(view.messages[0].text).toContain("A-0201");
    expect(view.messages[0].text).toContain("SBI4471902");
    expect(view.escalation).toBeNull();
  });

  it("answers every tool call with its toolCallId", async () => {
    const { responses } = await runScenario("promise");
    const results = responses.flatMap((r) => ((r.body as { results?: { toolCallId: string; result: string }[] }).results ?? []));
    expect(results.length).toBeGreaterThan(5);
    expect(results.every((x) => /^tc_\d+$/.test(x.toolCallId))).toBe(true);
    const created = results.find((x) => x.result.startsWith("OK. Case"))!;
    expect(created.result).toContain("A-0201");
    expect(created.result).toContain("₹300");
  });
});

describe("live pipeline: refusal path (e-commerce, English)", () => {
  it("emits the same event skeleton as the refusal mock demo", async () => {
    const { events } = await runScenario("refusal");
    expect(skeleton(events)).toEqual(mockSkeleton(refusalScript));
  });

  it("caps push-backs at two, fails, then escalates to the regulator", async () => {
    const { events } = await runScenario("refusal");
    const view = Object.values(reduceEvents(events))[0];
    expect(view.case.amountPaise).toBe(189900); // "₹1,899" string parsed
    expect(view.match?.ruleId).toBe("R2");
    const pushBacks = events.filter((e) => e.type === "call.state" && e.data.state === "PUSH_BACK");
    expect(pushBacks).toHaveLength(2);
    const notes = events.filter((e) => e.type === "case.status").map((e) => (e.type === "case.status" ? e.data.note : null));
    expect(notes).toContain("Refused after 2 push-backs");
    expect(view.commitment).toBeNull();
    expect(view.escalation?.to).toBe(RULES.R2.escalation.name);
    expect(view.case.status).toBe("escalated");
    expect(view.messages[0].language).toBe("en");
  });
});

describe("orchestrator safety", () => {
  function bare() {
    const events: AdvocallEvent[] = [];
    const deferred: (() => Promise<void>)[] = [];
    const deps = makeDeps(events, deferred);
    const dialed: VapiAssistant[] = [];
    deps.dial = async ({ assistant }) => {
      dialed.push(assistant);
      return { id: `vapi_${dialed.length}` };
    };
    return { events, deferred, deps, dialed };
  }
  const msg = (vapiId: string, a: VapiAssistant, m: Record<string, unknown>) => ({
    message: { ...m, call: { id: vapiId, assistant: { metadata: { advocall: a.metadata.advocall } } } },
  });
  const tool = (vapiId: string, a: VapiAssistant, name: string, args: Record<string, unknown>) =>
    msg(vapiId, a, { type: "tool-calls", toolCallList: [{ id: "t1", name, parameters: args }] });
  const goodCase = {
    user_name: "Test User",
    company: "HDFC Bank",
    category: "upi_failed",
    amount_rupees: 4500,
    incident_date: "2026-09-22",
    txn_ref: "",
    description: "UPI debit not credited.",
  };
  const resultOf = (r: WebhookResult) => (r.body as { results: { result: string }[] }).results[0].result;

  it("only dials phones in TEAM_PHONES", async () => {
    const { deps } = bare();
    await expect(startIntakeCall(deps, { phone: "+919999999999" })).rejects.toBeInstanceOf(LiveCallError);
    await expect(startIntakeCall(deps, { phone: "not a phone" })).rejects.toBeInstanceOf(LiveCallError);
  });

  it("rejects future dates and bad amounts back to the LLM, without creating a case", async () => {
    const { deps, dialed, events } = bare();
    await startIntakeCall(deps, { phone: SIM_USER_PHONE, lang: "en" });
    const a = dialed[0];
    const future = await handleVapiWebhook(deps, tool("vapi_1", a, "create_case", { ...goodCase, incident_date: "2026-12-01" }));
    expect(resultOf(future)).toMatch(/^ERROR: .*future/);
    const zero = await handleVapiWebhook(deps, tool("vapi_1", a, "create_case", { ...goodCase, amount_rupees: 0 }));
    expect(resultOf(zero)).toMatch(/^ERROR: .*amount/);
    expect(events).toHaveLength(0);
    const ok = await handleVapiWebhook(deps, tool("vapi_1", a, "create_case", goodCase));
    expect(resultOf(ok)).toMatch(/^OK\. Case A-02\d\d/);
    const again = await handleVapiWebhook(deps, tool("vapi_1", a, "create_case", goodCase));
    expect(resultOf(again)).toMatch(/already saved/);
    expect(events.filter((e) => e.type === "case.created")).toHaveLength(1);
  });

  it("routes webhooks by metadata even before POST /call returned the Vapi id (race)", async () => {
    const { deps, dialed, events } = bare();
    await startIntakeCall(deps, { phone: SIM_USER_PHONE, lang: "en" });
    const r = await handleVapiWebhook(deps, tool("vapi_unknown_yet", dialed[0], "create_case", goodCase));
    expect(resultOf(r)).toMatch(/^OK\./);
    expect(events[0].type).toBe("case.created");
  });

  it("handles a duplicated end-of-call (status ended + report + retry) exactly once", async () => {
    const { deps, dialed, events, deferred } = bare();
    await startIntakeCall(deps, { phone: SIM_USER_PHONE, lang: "en" });
    const a = dialed[0];
    await handleVapiWebhook(deps, msg("vapi_1", a, { type: "status-update", status: "in-progress" }));
    await handleVapiWebhook(deps, tool("vapi_1", a, "create_case", goodCase));
    await handleVapiWebhook(deps, msg("vapi_1", a, { type: "status-update", status: "ended", endedReason: "customer-ended-call" }));
    await handleVapiWebhook(deps, msg("vapi_1", a, { type: "end-of-call-report", endedReason: "customer-ended-call" }));
    await handleVapiWebhook(deps, msg("vapi_1", a, { type: "end-of-call-report", endedReason: "customer-ended-call" }));
    expect(events.filter((e) => e.type === "call.ended")).toHaveLength(1);
    expect(deferred).toHaveLength(1); // exactly one advocate dial queued
  });

  it("an unanswered company call fails, still reports back, then escalates", async () => {
    const { deps, dialed, events, deferred } = bare();
    await startIntakeCall(deps, { phone: SIM_USER_PHONE, lang: "en" });
    await handleVapiWebhook(deps, msg("vapi_1", dialed[0], { type: "status-update", status: "in-progress" }));
    await handleVapiWebhook(deps, tool("vapi_1", dialed[0], "create_case", goodCase));
    await handleVapiWebhook(deps, msg("vapi_1", dialed[0], { type: "end-of-call-report", endedReason: "assistant-ended-call" }));
    await deferred.shift()!(); // dial advocate
    await handleVapiWebhook(deps, msg("vapi_2", dialed[1], { type: "end-of-call-report", endedReason: "customer-did-not-answer" }));
    const adv = events.find((e) => e.type === "call.ended" && e.data.status === "failed");
    expect(adv).toBeDefined();
    await deferred.shift()!(); // dial report
    await handleVapiWebhook(deps, msg("vapi_3", dialed[2], { type: "end-of-call-report", endedReason: "customer-did-not-answer" }));
    const view = Object.values(reduceEvents(events))[0];
    expect(view.messages).toHaveLength(1);
    expect(view.case.status).toBe("escalated");
  });

  it("rejects inbound calls from phones outside the team", async () => {
    const { deps } = bare();
    const r = await handleVapiWebhook(deps, { message: { type: "assistant-request", call: { id: "in_1", customer: { number: "+14155550100" } } } });
    expect((r.body as { error?: string }).error).toBeTruthy();
    const ok = await handleVapiWebhook(deps, { message: { type: "assistant-request", call: { id: "in_2", customer: { number: SIM_USER_PHONE } } } });
    expect((ok.body as { assistant?: VapiAssistant }).assistant?.name).toBe("advocall-intake");
  });
});

describe("vapi message parsing + config", () => {
  it("parses toolWithToolCallList with JSON-string arguments", () => {
    const m = parseVapiMessage({
      message: {
        type: "tool-calls",
        toolWithToolCallList: [{ name: "set_call_state", toolCall: { id: "x1", function: { arguments: '{"state":"ASK"}' } } }],
      },
    });
    expect(m).toMatchObject({ kind: "tool-calls", toolCalls: [{ id: "x1", name: "set_call_state", args: { state: "ASK" } }] });
  });

  it("returns null for junk", () => {
    expect(parseVapiMessage(null)).toBeNull();
    expect(parseVapiMessage({ hello: 1 })).toBeNull();
  });

  it("normalizes Indian phone numbers", () => {
    expect(normalizePhone("98765 43210")).toBe("+919876543210");
    expect(normalizePhone("919876543210")).toBe("+919876543210");
    expect(normalizePhone("+91 98765-43210")).toBe("+919876543210");
    expect(normalizePhone("12345")).toBe("");
  });

  it("lists missing env and never marks an empty config ready", () => {
    const r = readVoiceConfig({});
    expect(r.ready).toBe(false);
    expect(r.mode).toBe("mock");
    expect(r.missing).toEqual(["VAPI_API_KEY", "VAPI_PHONE_NUMBER_ID", "PUBLIC_URL", "DEMO_COMPANY_PHONE", "TEAM_PHONES"]);
    const full = readVoiceConfig({
      MODE: "live",
      VAPI_API_KEY: "k",
      VAPI_PHONE_NUMBER_ID: "p",
      PUBLIC_URL: "https://x.trycloudflare.com/",
      DEMO_COMPANY_PHONE: "9876500001",
      TEAM_PHONES: "9876500002",
    });
    expect(full.ready).toBe(true);
    expect(full.config.publicUrl).toBe("https://x.trycloudflare.com");
    expect(full.config.teamPhones).toEqual(["+919876500002", "+919876500001"]);
  });
});

describe("orchestrator allowlist on every leg", () => {
  it("never dials a report-back to a number outside TEAM_PHONES, even for an adopted call", async () => {
    const events: AdvocallEvent[] = [];
    const deferred: (() => Promise<void>)[] = [];
    const deps = makeDeps(events, deferred);
    const dialed: string[] = [];
    deps.dial = async ({ to }) => {
      dialed.push(to);
      return { id: `v${dialed.length}` };
    };
    // a webhook for a call we never started (e.g. spoofed), claiming to be an intake from a stranger
    const meta = { callId: "call_spoof", leg: "intake", caseId: null, lang: "en" };
    const m = (x: Record<string, unknown>) => ({ message: { ...x, call: { id: "vs", customer: { number: "+14155550100" }, assistant: { metadata: { advocall: meta } } } } });
    await handleVapiWebhook(deps, m({ type: "status-update", status: "in-progress" }));
    await handleVapiWebhook(
      deps,
      m({
        type: "tool-calls",
        toolCallList: [{ id: "t", name: "create_case", parameters: { user_name: "X", company: "Y Bank", category: "other", amount_rupees: 100, incident_date: "2026-09-20", description: "d" } }],
      }),
    );
    await handleVapiWebhook(deps, m({ type: "end-of-call-report", endedReason: "assistant-ended-call" }));
    while (deferred.length) await deferred.shift()!();
    expect(dialed).not.toContain("+14155550100");
  });
});

describe("browser (web) channel: the no-Twilio fallback", () => {
  async function runWeb(scenario: SimScenario, secret = "") {
    const events: AdvocallEvent[] = [];
    const deferred: (() => Promise<void>)[] = [];
    const deps = makeDeps(events, deferred);
    deps.config = { ...deps.config, webhookSecret: secret };
    const queue: unknown[] = [];
    const sim = simulatedDialer(scenario, TODAY, (body) => queue.push(body));
    deps.dial = async () => {
      throw new Error("web legs must never dial a phone");
    };
    const assistants: VapiAssistant[] = [];
    const talk = async (a: VapiAssistant) => {
      assistants.push(a);
      await sim({ to: "web", assistant: a }); // the browser's Vapi SDK would now produce these webhooks
    };
    const drain = async () => {
      while (queue.length || deferred.length) {
        if (queue.length) await handleVapiWebhook(deps, queue.shift());
        else await deferred.shift()!();
      }
    };
    const p = simPersona(scenario);
    const { assistant } = startWebIntake(deps, { lang: p.lang });
    await talk(assistant);
    await drain();
    const company = claimWebLeg("company");
    expect(company?.leg).toBe("advocate");
    expect(claimWebLeg("company")).toBeNull(); // claim-once: a second tab gets nothing
    await talk(company!.assistant);
    await drain();
    expect(peekWebLegs("customer").map((l) => l.leg)).toEqual(["report"]);
    const report = claimWebLeg("customer")!;
    await talk(report.assistant);
    await drain();
    return { events, assistants, deps };
  }

  it("emits the same event skeleton as the mock demos, with no phone dialled", async () => {
    const promise = await runWeb("promise");
    expect(skeleton(promise.events)).toEqual(mockSkeleton(upiScript));
    resetLive();
    const refusal = await runWeb("refusal");
    expect(skeleton(refusal.events)).toEqual(mockSkeleton(refusalScript));
    const view = Object.values(reduceEvents(promise.events))[0];
    expect(view.calls.map((c) => c.to)).toEqual(["web", "web", "web"]);
    expect(view.case.status).toBe("promised");
  });

  it("never sends the global webhook secret to a browser; each leg gets its own token", async () => {
    const { assistants, deps } = await runWeb("promise", "GLOBAL-SECRET");
    const tokens = assistants.map((a) => a.server.headers?.[WEBHOOK_SECRET_HEADER]);
    expect(tokens.every((t) => t && t !== "GLOBAL-SECRET")).toBe(true);
    expect(new Set(tokens).size).toBe(3);
    const bodyFor = (a: VapiAssistant) => ({ message: { type: "status-update", status: "ended", call: { id: "x", assistant: { metadata: a.metadata } } } });
    expect(authorizeWebhook(deps.config, tokens[0]!, bodyFor(assistants[0]))).toBe(true);
    expect(authorizeWebhook(deps.config, tokens[0]!, bodyFor(assistants[1]))).toBe(false); // token of another call
    expect(authorizeWebhook(deps.config, "GLOBAL-SECRET", bodyFor(assistants[1]))).toBe(true);
    expect(authorizeWebhook(deps.config, null, bodyFor(assistants[1]))).toBe(false);
  });
});

describe("browser leg release (failed start must not strand a case)", () => {
  it("puts an answered-but-never-started leg back to ringing, but never one that really started", async () => {
    const events: AdvocallEvent[] = [];
    const deferred: (() => Promise<void>)[] = [];
    const deps = makeDeps(events, deferred);
    const { assistant } = startWebIntake(deps, { lang: "en" });
    const m = (x: Record<string, unknown>) => ({ message: { ...x, call: { id: "w1", assistant: { metadata: assistant.metadata } } } });
    await handleVapiWebhook(deps, m({ type: "status-update", status: "in-progress" }));
    await handleVapiWebhook(
      deps,
      m({
        type: "tool-calls",
        toolCallList: [{ id: "t", name: "create_case", parameters: { user_name: "Web User", company: "HDFC Bank", category: "upi_failed", amount_rupees: 4500, incident_date: "2026-09-22", description: "d" } }],
      }),
    );
    await handleVapiWebhook(deps, m({ type: "end-of-call-report", endedReason: "customer-ended-call" }));
    await deferred.shift()!(); // advocate leg parked for the company browser
    const claimed = claimWebLeg("company")!;
    expect(peekWebLegs("company")).toHaveLength(0);
    expect(releaseWebLeg(claimed.callId)).toBe(true); // mic denied -> ring again
    expect(peekWebLegs("company").map((l) => l.callId)).toEqual([claimed.callId]);
    const again = claimWebLeg("company")!;
    const adv = (x: Record<string, unknown>) => ({ message: { ...x, call: { id: "w2", assistant: { metadata: again.assistant.metadata } } } });
    await handleVapiWebhook(deps, adv({ type: "status-update", status: "in-progress" }));
    expect(releaseWebLeg(again.callId)).toBe(false); // it really started: never re-ring
    expect(releaseWebLeg("nope")).toBe(false);
  });
});
