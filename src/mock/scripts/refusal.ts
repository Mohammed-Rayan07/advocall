// Owner: YASO. Company refuses twice: Advocall stops pushing (safety rule) and escalates. Kannada user.
import type { CaseInput, DemoScript } from "@/types";
import { buildEscalationPacket, matchRule } from "@/lib/rules";
import { todayIST } from "@/lib/core/format";
import { buildReportScript, buildSmsSummary } from "@/content";
import { makeCase, scriptFor, viewFor } from "../helpers";

const CASE_ID = "A-0144";

const input: CaseInput = {
  userName: "Suresh Gowda",
  userPhone: "+919800000004",
  language: "kn",
  company: "Axis Bank",
  category: "upi_failed",
  amountPaise: 200000,
  incidentDate: "2026-09-18",
  txnRef: "UPI7719203",
  description: "Sent ₹2,000 by UPI to a relative; the amount was debited but never credited to the beneficiary.",
};

const c = makeCase(input, CASE_ID, "intake");
const today = todayIST();
const match = matchRule(input, today);
const view = viewFor({ ...c, status: "failed" }, match, null);
const packet = buildEscalationPacket({ ...c, status: "failed" }, match, null, today);

const s = scriptFor(CASE_ID);
const IN = "call_a0144_intake";
const ADV = "call_a0144_adv";
const REP = "call_a0144_report";

export const refusalScript: DemoScript = {
  id: "refusal",
  title: "Refusal → escalation",
  description: "Axis Bank refuses twice. Advocall stops after 2 push-backs (safety rule) and prepares an RBI Ombudsman complaint.",
  steps: [
    s.created(c),
    s.startCall(IN, "intake", input.userPhone, 800),
    s.say(IN, "agent", "kn", "ನಮಸ್ಕಾರ! ನಾನು Advocall ನ AI ಸಹಾಯಕ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ. ಏನು ತೊಂದರೆಯಾಗಿದೆ ತಿಳಿಸಿ?", 1200),
    s.say(IN, "user", "kn", "18ನೇ ತಾರೀಖು UPI ಮೂಲಕ ₹2,000 ಕಳುಹಿಸಿದ್ದೆ. ಖಾತೆಯಿಂದ ಹಣ ಕಟ್ ಆಗಿದೆ, ಆದರೆ ಅವರಿಗೆ ತಲುಪಿಲ್ಲ. Axis Bank.", 3000),
    s.say(IN, "agent", "kn", "ಖಚಿತಪಡಿಸುತ್ತೇನೆ: Axis Bank, ₹2,000, 18 ಸೆಪ್ಟೆಂಬರ್, ರೆಫರೆನ್ಸ್ UPI7719203. ಈಗಲೇ ಬ್ಯಾಂಕ್‌ಗೆ ಕರೆ ಮಾಡಿ ಮಾತನಾಡುತ್ತೇನೆ.", 3000),
    s.endCall(IN, "Case captured: Axis Bank, ₹2,000", 2000),
    s.matched(match, 1200),
    s.status("open", "Rule matched", 600),
    s.status("calling", "Calling Axis Bank", 1000),
    s.startCall(ADV, "advocate", "+919800000006", 800),
    s.state(ADV, "DISCLOSE", 1500),
    s.say(ADV, "agent", "en", "Hello, I'm an AI assistant calling on behalf of Mr. Suresh Gowda, who is available to verify.", 1000),
    s.state(ADV, "STATE_CASE", 2500),
    s.say(ADV, "agent", "en", "On 18 September, ₹2,000 was debited by UPI, reference UPI7719203, but the beneficiary account was not credited.", 800),
    s.state(ADV, "ASK", 3500),
    s.say(ADV, "agent", "en", "Could you please register an official complaint and provide the ticket number?", 600),
    s.say(ADV, "company", "en", "Sir, we cannot accept complaints from third parties or AI. The account holder must visit the branch in person.", 3500),
    s.state(ADV, "PUSH_BACK", 800),
    s.say(ADV, "agent", "en", match.pushBackLine, 1000),
    s.say(ADV, "company", "en", "I apologize sir, but as per our bank policy, I cannot log this complaint over the phone.", 5000),
    s.state(ADV, "PUSH_BACK", 800),
    s.say(ADV, "agent", "en", "I understand. Mr. Gowda is available to join this line right now to verify. Could we register it with him present?", 1000),
    s.say(ADV, "company", "en", "No sir, branch visit with photo ID is mandatory for this issue. We cannot assist further on this call.", 3500),
    s.state(ADV, "CLOSE", 1000),
    s.say(ADV, "agent", "en", "Understood. I will record that registration was declined. Thank you for your time.", 800),
    s.endCall(ADV, "Company refused to register complaint", 1500),
    s.status("failed", "Refused after 2 push-backs", 800),
    s.startCall(REP, "report", input.userPhone, 2000),
    s.say(REP, "agent", "kn", buildReportScript(view, "kn"), 2000),
    s.say(REP, "user", "kn", "ಹೌದು, ದಯವಿಟ್ಟು ದೂರು ನೀಡಿ.", 5000),
    s.endCall(REP, "User approved escalation", 1500),
    s.sms(input.userPhone, "kn", buildSmsSummary(view, "kn"), 800),
    s.escalation(packet, 1500),
    s.status("escalated", `Escalation packet for ${packet.to}`, 800),
  ],
};
