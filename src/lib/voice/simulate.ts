// A fake Vapi: instead of phoning anyone, it plays realistic webhook payloads back into the
// REAL orchestrator. Proves the whole live pipeline without keys (tests + the /dev "simulate" button). Owner: Rayan.
import type { Lang } from "@/types";
import { addDays } from "@/lib/rules";
import type { AdvocallCallMeta, VapiAssistant } from "./assistants";
import type { Dialer } from "./orchestrator";
import type { VoiceConfig } from "./config";

export type SimScenario = "promise" | "refusal";
export const SIM_SCENARIOS: SimScenario[] = ["promise", "refusal"];

export const SIM_USER_PHONE = "+919800000011";
export const SIM_COMPANY_PHONE = "+919800000012";

/** Real config with fake phones/URL, so a simulation can never dial a real number. */
export function simConfig(real: VoiceConfig): VoiceConfig {
  return {
    ...real,
    apiKey: "sim",
    phoneNumberId: "sim",
    publicUrl: "https://simulated.advocall.local",
    companyPhone: SIM_COMPANY_PHONE,
    teamPhones: [SIM_USER_PHONE, SIM_COMPANY_PHONE],
  };
}

type Body = { message: Record<string, unknown> };
type Step = [delayMs: number, body: Body];

interface Persona {
  name: string;
  lang: Lang;
  company: string;
  intake: (today: string) => { lines: [role: "user" | "assistant", text: string][]; args: Record<string, unknown>; outro: string };
  advocate: (today: string) => { steps: Array<["say", "user" | "assistant", string] | ["state", string] | ["commit", Record<string, unknown>]> };
}

const PERSONAS: Record<SimScenario, Persona> = {
  promise: {
    name: "Arjun Mehta",
    lang: "hi",
    company: "SBI",
    intake: (today) => ({
      lines: [
        ["user", "चार दिन पहले मैंने UPI से ₹2,750 भेजे थे, मेरे खाते से पैसे कट गए लेकिन सामने वाले को नहीं मिले।"],
        ["assistant", "समझ गया। आपका बैंक कौन सा है, और क्या आपके पास UPI रेफ़रेंस नंबर है?"],
        ["user", "SBI. रेफ़रेंस है UPI 6630 2915."],
        ["assistant", "पुष्टि कर लेता हूँ: SBI, ₹2,750, रेफ़रेंस U-P-I-6-6-3-0-2-9-1-5. सही है?"],
        ["user", "हाँ, सही है।"],
      ],
      args: {
        user_name: "Arjun Mehta",
        company: "SBI",
        category: "upi_failed",
        amount_rupees: 2750,
        incident_date: addDays(today, -4),
        txn_ref: "UPI 66302915",
        description: "Sent ₹2,750 by UPI; money was debited but the receiver never got it.",
      },
      outro: "ठीक है, केस सेव हो गया। RBI नियमों के अनुसार बैंक को देरी के लिए मुआवज़ा भी देना होगा। मैं अभी SBI को कॉल करता हूँ और आपको वापस बताऊँगा। धन्यवाद!",
    }),
    advocate: (today) => ({
      steps: [
        ["say", "user", "Welcome to State Bank of India. For UPI and digital payment complaints, press 3."],
        ["state", "NAVIGATE"],
        ["say", "assistant", "[pressed 3]"],
        ["state", "HOLD"],
        ["say", "user", "Good evening, this is Rahul from SBI customer care. How may I help you?"],
        ["state", "STATE_CASE"],
        ["say", "assistant", "Hello, I'm an AI assistant calling on behalf of Arjun Mehta, who is available to verify if needed. Four days ago ₹2,750 was debited from his account by UPI, reference UPI66302915, but the beneficiary was never credited."],
        ["state", "ASK"],
        ["say", "assistant", "Could you please register a complaint and share the complaint number and the reversal date?"],
        ["say", "user", "Sir, it will auto-reverse. Please wait for 5 to 7 working days."],
        ["state", "PUSH_BACK"],
        ["say", "assistant", "As per RBI's turnaround-time rules, a failed UPI debit must be reversed by T+1, with ₹100 per day compensation after that. Could you please register a complaint and give me the complaint number and the reversal date?"],
        ["say", "user", `Okay sir, I have raised it. Complaint number is SBI 4471 902, reversal by ${addDays(today, 3)}.`],
        ["state", "CAPTURE"],
        ["say", "assistant", "Let me confirm: S-B-I-4-4-7-1-9-0-2, reversal within three days, and the delay compensation will be credited. Correct?"],
        ["say", "user", "Yes sir, correct. Compensation will be credited as per RBI norms."],
        ["commit", { ticket_no: "SBI 4471902", promised_by: addDays(today, 3), compensation_ack: true, confirmed: true }],
        ["state", "CLOSE"],
        ["say", "assistant", "Thank you, Rahul. Have a good evening."],
      ],
    }),
  },
  refusal: {
    name: "Meera Iyer",
    lang: "en",
    company: "Myntra",
    intake: (today) => ({
      lines: [
        ["user", "I returned a jacket on Myntra over a month ago and I still haven't got my ₹1,899 back."],
        ["assistant", "I'm sorry to hear that. Do you have the order ID, and when did you place the return?"],
        ["user", `Order ID is MYN 55 0193 8821. The return was picked up on ${addDays(today, -38)}.`],
        ["assistant", "Let me confirm: Myntra, ₹1,899, order M-Y-N-5-5-0-1-9-3-8-8-2-1. Is that right?"],
        ["user", "Yes."],
      ],
      args: {
        user_name: "Meera Iyer",
        company: "Myntra",
        category: "ecom_refund",
        amount_rupees: "₹1,899",
        incident_date: addDays(today, -38),
        txn_ref: "MYN5501938821",
        description: "Returned a jacket; the ₹1,899 refund has not been paid more than a month later.",
      },
      outro: "Your case is saved. I'll call Myntra now and call you back with the result. Goodbye!",
    }),
    advocate: () => ({
      steps: [
        ["say", "user", "Hi, this is Kavya from Myntra support."],
        ["state", "STATE_CASE"],
        ["say", "assistant", "Hello, I'm an AI assistant calling on behalf of Meera Iyer. Her ₹1,899 refund for order MYN5501938821 is still pending after the return was picked up over a month ago."],
        ["state", "ASK"],
        ["say", "assistant", "Could you please share the ticket number and the date the refund will be processed?"],
        ["say", "user", "We can only discuss orders with the account holder. Please ask her to use the app."],
        ["state", "PUSH_BACK"],
        ["say", "assistant", "Under Rule 4(5) of the Consumer Protection E-Commerce Rules 2020, the grievance officer must acknowledge within 48 hours and resolve within one month. Could you please share the ticket number and the date the refund will be processed?"],
        ["say", "user", "Sorry, I can't raise a ticket on this call."],
        ["state", "PUSH_BACK"],
        ["say", "assistant", "I understand. Meera can join this call to verify. Could you register it with her on the line?"],
        ["say", "user", "No ma'am, app only."],
        ["state", "PUSH_BACK"], // a third push-back: the orchestrator must refuse it
        ["state", "CLOSE"],
        ["say", "assistant", "Understood. I'll note that the complaint was declined. Thank you for your time."],
      ],
    }),
  },
};

function body(vapiId: string, meta: AdvocallCallMeta, message: Record<string, unknown>): Body {
  return { message: { ...message, call: { id: vapiId, assistant: { metadata: { advocall: meta } } } } };
}

let simSeq = 0;
let toolSeq = 0;

/**
 * A Dialer that never dials. Each "call" turns into timed webhook bodies handed to `send`,
 * which the caller feeds into handleVapiWebhook (real bus in /api/live/simulate, a queue in tests).
 */
export function simulatedDialer(scenario: SimScenario, today: string, send: (body: Body, atMs: number) => void, pace = 1): Dialer {
  const p = PERSONAS[scenario];
  return async ({ assistant }: { assistant: VapiAssistant }) => {
    simSeq += 1;
    const id = `vapi_sim_${simSeq}`;
    const meta = assistant.metadata.advocall;
    const steps: Step[] = [];
    const say = (delay: number, role: "user" | "assistant", text: string) =>
      steps.push([delay, body(id, meta, { type: "transcript", role, transcriptType: "final", transcript: text })]);
    const tool = (delay: number, name: string, args: Record<string, unknown>) => {
      toolSeq += 1;
      // alternate the two payload shapes Vapi uses, so both parsers stay exercised
      const tc =
        toolSeq % 2 === 0
          ? { id: `tc_${toolSeq}`, type: "function", function: { name, arguments: JSON.stringify(args) } }
          : { id: `tc_${toolSeq}`, name, parameters: args };
      steps.push([delay, body(id, meta, { type: "tool-calls", toolCallList: [tc] })]);
    };

    steps.push([900, body(id, meta, { type: "status-update", status: "ringing" })]);
    steps.push([1500, body(id, meta, { type: "status-update", status: "in-progress" })]);

    if (meta.leg === "intake") {
      const s = p.intake(today);
      if (assistant.firstMessage) say(600, "assistant", assistant.firstMessage);
      for (const [role, text] of s.lines) say(role === "user" ? 3200 : 2400, role, text);
      tool(1200, "create_case", s.args);
      say(1500, "assistant", s.outro);
    } else if (meta.leg === "advocate") {
      for (const st of p.advocate(today).steps) {
        if (st[0] === "say") say(st[1] === "user" ? 3000 : 2200, st[1], st[2]);
        else if (st[0] === "state") tool(500, "set_call_state", { state: st[1] });
        else tool(900, "record_commitment", st[1]);
      }
    } else {
      if (assistant.firstMessage) say(800, "assistant", assistant.firstMessage);
      say(5500, "user", p.lang === "hi" ? "बहुत बढ़िया, धन्यवाद!" : p.lang === "kn" ? "ತುಂಬಾ ಧನ್ಯವಾದಗಳು!" : "Yes please, go ahead. Thank you!");
    }

    steps.push([1500, body(id, meta, { type: "status-update", status: "ended", endedReason: "assistant-ended-call" })]);
    steps.push([300, body(id, meta, { type: "end-of-call-report", endedReason: "assistant-ended-call" })]);

    let t = 0;
    for (const [delay, b] of steps) {
      t += delay / pace;
      send(b, t);
    }
    return { id };
  };
}

export function simPersona(scenario: SimScenario): { name: string; lang: Lang; phone: string } {
  const p = PERSONAS[scenario];
  return { name: p.name, lang: p.lang, phone: SIM_USER_PHONE };
}
