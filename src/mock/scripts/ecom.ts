// Owner: YASO. E-commerce refund (R2), English end to end.
import type { CaseInput, Commitment, DemoScript } from "@/types";
import { matchRule } from "@/lib/rules";
import { todayIST } from "@/lib/core/format";
import { buildReportScript, buildSmsSummary } from "@/content";
import { makeCase, scriptFor, viewFor } from "../helpers";

const CASE_ID = "A-0143";

const input: CaseInput = {
  userName: "Priya Sharma",
  userPhone: "+919800000003",
  language: "en",
  company: "Flipkart",
  category: "ecom_refund",
  amountPaise: 129900,
  incidentDate: "2026-08-20",
  txnRef: "OD4312987765",
  description: "Returned a pair of headphones; the pickup was completed but the ₹1,299 refund never arrived.",
};

const c = makeCase(input, CASE_ID, "intake");
const match = matchRule(input, todayIST());
const commitment: Commitment = {
  caseId: CASE_ID,
  ticketNo: "FK-77120394",
  promisedBy: "2026-09-30",
  compensationAck: false,
  confirmed: true,
};
const view = viewFor({ ...c, status: "promised" }, match, commitment);

const s = scriptFor(CASE_ID);
const IN = "call_a0143_intake";
const ADV = "call_a0143_adv";
const REP = "call_a0143_report";

export const ecomScript: DemoScript = {
  id: "ecom",
  title: "E-commerce refund",
  description: "₹1,299 Flipkart refund stuck for a month: Advocall cites the E-Commerce Rules 2020 and gets a ticket.",
  steps: [
    s.created(c),
    s.startCall(IN, "intake", input.userPhone, 800),
    s.say(IN, "agent", "en", "Hi, this is Advocall, an AI assistant. What can I help you with today?", 1200),
    s.say(IN, "user", "en", "I returned headphones to Flipkart on 20 August. Pickup was done, but my ₹1,299 refund never came.", 3000),
    s.say(IN, "agent", "en", "Got it: Flipkart, ₹1,299, order OD4312987765, returned 20 August. I'll call them now and get back to you.", 3000),
    s.endCall(IN, "Case captured: Flipkart refund ₹1,299", 2000),
    s.matched(match, 1200),
    s.status("open", "Rule matched", 600),
    s.status("calling", "Calling Flipkart", 1200),
    s.startCall(ADV, "advocate", "+919800000005", 800),
    s.state(ADV, "DISCLOSE", 1500),
    s.say(ADV, "agent", "en", "Hello, I'm an AI assistant calling on behalf of Priya Sharma about a pending refund.", 1000),
    s.state(ADV, "STATE_CASE", 2500),
    s.say(ADV, "agent", "en", "Order OD4312987765 was returned on 20 August and picked up, but the ₹1,299 refund has not been credited.", 800),
    s.state(ADV, "ASK", 3500),
    s.say(ADV, "agent", "en", "Could you share a ticket number and the date the refund will be processed?", 600),
    s.say(ADV, "company", "en", "Ma'am, refunds can take some time. Please check again next week.", 3500),
    s.state(ADV, "PUSH_BACK", 800),
    s.say(ADV, "agent", "en", match.pushBackLine, 1000),
    s.say(ADV, "company", "en", "Understood. I've escalated it: ticket FK-77120394, refund by 30 September.", 5000),
    s.state(ADV, "CAPTURE", 800),
    s.say(ADV, "agent", "en", "Confirming: F-K-7-7-1-2-0-3-9-4, refund by 30 September. Correct?", 1000),
    s.say(ADV, "company", "en", "Yes, that's right.", 3000),
    s.commitment(commitment, 1000),
    s.state(ADV, "CLOSE", 1000),
    s.endCall(ADV, "Ticket FK-77120394, refund by 30 Sep", 1500),
    s.status("promised", "Ticket FK-77120394", 800),
    s.startCall(REP, "report", input.userPhone, 2000),
    s.say(REP, "agent", "en", buildReportScript(view, "en"), 2000),
    s.endCall(REP, "User informed", 5000),
    s.sms(input.userPhone, "en", buildSmsSummary(view, "en"), 1000),
  ],
};
