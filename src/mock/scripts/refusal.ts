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
    s.say(IN, "agent", "kn", "ನಮಸ್ಕಾರ! ನಾನು Advocall, ಒಂದು AI ಸಹಾಯಕ. ಏನು ಸಮಸ್ಯೆ ಹೇಳಿ?", 1200),
    s.say(IN, "user", "kn", "18ನೇ ತಾರೀಖು UPI ಮೂಲಕ ₹2,000 ಕಳುಹಿಸಿದೆ. ನನ್ನ ಖಾತೆಯಿಂದ ಹಣ ಕಡಿತವಾಗಿದೆ, ಆದರೆ ಅವರಿಗೆ ತಲುಪಿಲ್ಲ. Axis Bank.", 3000),
    s.say(IN, "agent", "kn", "ಖಚಿತಪಡಿಸುತ್ತೇನೆ: Axis Bank, ₹2,000, 18 ಸೆಪ್ಟೆಂಬರ್, ರೆಫರೆನ್ಸ್ UPI7719203. ಈಗ ಬ್ಯಾಂಕ್‌ಗೆ ಕರೆ ಮಾಡುತ್ತೇನೆ.", 3000),
    s.endCall(IN, "Case captured: Axis Bank, ₹2,000", 2000),
    s.matched(match, 1200),
    s.status("open", "Rule matched", 600),
    s.status("calling", "Calling Axis Bank", 1000),
    s.startCall(ADV, "advocate", "+919800000006", 800),
    s.state(ADV, "DISCLOSE", 1500),
    s.say(ADV, "agent", "en", "Hello, I'm an AI assistant calling on behalf of Suresh Gowda, who is available to verify.", 1000),
    s.state(ADV, "STATE_CASE", 2500),
    s.say(ADV, "agent", "en", "On 18 September, ₹2,000 was debited by UPI, reference UPI7719203, but the beneficiary was not credited.", 800),
    s.state(ADV, "ASK", 3500),
    s.say(ADV, "agent", "en", "Could you please register a complaint and give me the complaint number?", 600),
    s.say(ADV, "company", "en", "We can only take complaints from the account holder directly. Please ask him to visit the branch.", 3500),
    s.state(ADV, "PUSH_BACK", 800),
    s.say(ADV, "agent", "en", match.pushBackLine, 1000),
    s.say(ADV, "company", "en", "Sorry sir, I can't raise it on this call.", 5000),
    s.state(ADV, "PUSH_BACK", 800),
    s.say(ADV, "agent", "en", "I understand. The customer can join this call to verify. Could you register it with him on the line?", 1000),
    s.say(ADV, "company", "en", "No sir, branch visit only.", 3500),
    s.state(ADV, "CLOSE", 1000),
    s.say(ADV, "agent", "en", "Understood, I'll note that the complaint was declined. Thank you for your time.", 800),
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
