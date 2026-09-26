// Owner: YASO. THE hero demo: failed UPI, Hindi intake, English advocate call, Hindi report-back.
import type { CaseInput, Commitment, DemoScript } from "@/types";
import { matchRule } from "@/lib/rules";
import { todayIST } from "@/lib/core/format";
import { buildReportScript, buildSmsSummary } from "@/content";
import { makeCase, scriptFor, viewFor } from "../helpers";

const CASE_ID = "A-0142";
const BANK_PHONE = "+919800000002";

const input: CaseInput = {
  userName: "Ravi Kumar",
  userPhone: "+919800000001",
  language: "hi",
  company: "HDFC Bank",
  category: "upi_failed",
  amountPaise: 450000,
  incidentDate: "2026-09-22",
  txnRef: "UPI4829301",
  description: "Paid ₹4,500 by UPI to a shop; the money was debited from the account but the shop never received it.",
};

const c = makeCase(input, CASE_ID, "intake");
const match = matchRule(input, todayIST());
const commitment: Commitment = {
  caseId: CASE_ID,
  ticketNo: "CMP88213",
  promisedBy: "2026-09-29",
  compensationAck: true,
  confirmed: true,
};
const view = viewFor({ ...c, status: "promised" }, match, commitment);

const s = scriptFor(CASE_ID);
const IN = "call_a0142_intake";
const ADV = "call_a0142_adv";
const REP = "call_a0142_report";

export const upiScript: DemoScript = {
  id: "upi",
  title: "UPI hero demo",
  description: "₹4,500 failed UPI: Hindi intake → Advocall calls HDFC, handles the brush-off, gets a ticket → Hindi report-back + SMS.",
  steps: [
    s.created(c),

    // 1. Intake call (Hindi)
    s.startCall(IN, "intake", input.userPhone, 800),
    s.say(IN, "agent", "hi", "नमस्ते! मैं Advocall हूँ, एक AI सहायक। बताइए, आज मैं आपकी क्या मदद कर सकता हूँ?", 1500),
    s.say(IN, "user", "hi", "मैंने 22 तारीख को एक दुकान पर UPI से ₹4,500 भेजे। पैसे मेरे खाते से कट गए, लेकिन दुकानदार को नहीं मिले।", 3500),
    s.say(IN, "agent", "hi", "समझ गया। आपका बैंक कौन सा है, और क्या आपके पास UPI रेफ़रेंस नंबर है?", 3000),
    s.say(IN, "user", "hi", "HDFC बैंक। रेफ़रेंस है UPI4829301।", 3000),
    s.say(IN, "agent", "hi", "पुष्टि कर लेता हूँ: HDFC बैंक, ₹4,500, 22 सितंबर, रेफ़रेंस U-P-I-4-8-2-9-3-0-1. सही है?", 3000),
    s.say(IN, "user", "hi", "हाँ, सही है।", 2500),
    s.say(IN, "agent", "hi", "ठीक है। मैं अभी HDFC बैंक को आपकी तरफ़ से कॉल करता हूँ और नतीजा बताने के लिए आपको वापस कॉल करूँगा।", 2500),
    s.endCall(IN, "Case captured: HDFC Bank, ₹4,500, UPI4829301", 2000),

    // 2. Rights engine
    s.matched(match, 1500),
    s.status("open", "Rule matched", 800),
    s.status("calling", "Calling HDFC Bank", 1500),

    // 3. Advocate call (English)
    s.startCall(ADV, "advocate", BANK_PHONE, 800),
    s.state(ADV, "DISCLOSE", 2000),
    s.say(ADV, "agent", "en", "Hello, I'm an AI assistant calling on behalf of Ravi Kumar, who is available to verify if needed.", 1200),
    s.state(ADV, "NAVIGATE", 2000),
    s.say(ADV, "company", "en", "Welcome to HDFC Bank. For UPI and payment complaints, press 2.", 1200),
    s.say(ADV, "agent", "en", "[pressed 2]", 2000),
    s.state(ADV, "HOLD", 800),
    s.say(ADV, "company", "en", "[hold music] Your call is important to us. Please stay on the line.", 1200),
    s.say(ADV, "company", "en", "Good afternoon, this is Priya from HDFC Bank. How may I help you?", 6000),
    s.state(ADV, "STATE_CASE", 500),
    s.say(ADV, "agent", "en", "On 22 September, ₹4,500 was debited from Mr. Ravi Kumar's account by UPI, reference UPI4829301, but the merchant was never credited.", 1500),
    s.state(ADV, "ASK", 3500),
    s.say(ADV, "agent", "en", "Could you please register a complaint and share the complaint number and the reversal date?", 800),
    s.say(ADV, "company", "en", "Sir, these cases usually auto-reverse. Please wait 7 to 10 working days.", 3500),
    s.state(ADV, "PUSH_BACK", 800),
    s.say(ADV, "agent", "en", match.pushBackLine, 1200),
    s.say(ADV, "company", "en", "Okay sir, I'm raising it now. Your complaint number is CMP88213, reversal by 29 September.", 5000),
    s.state(ADV, "CAPTURE", 800),
    s.say(ADV, "agent", "en", "Let me confirm: C-M-P-8-8-2-1-3, reversal by 29 September, and the delay compensation will be credited. Correct?", 1200),
    s.say(ADV, "company", "en", "Yes sir, that's correct. Compensation will be credited as per RBI norms.", 4000),
    s.commitment(commitment, 1200),
    s.state(ADV, "CLOSE", 1200),
    s.say(ADV, "agent", "en", "Thank you, Priya. Have a good day.", 800),
    s.endCall(ADV, "Ticket CMP88213, reversal by 29 Sep, compensation acknowledged", 2000),
    s.status("promised", "Ticket CMP88213", 800),

    // 4. Report-back call (Hindi)
    s.startCall(REP, "report", input.userPhone, 2500),
    s.say(REP, "agent", "hi", buildReportScript(view, "hi"), 2500),
    s.say(REP, "user", "hi", "बहुत बढ़िया, धन्यवाद!", 6000),
    s.endCall(REP, "User informed", 1500),

    // 5. SMS summary
    s.sms(input.userPhone, "hi", buildSmsSummary(view, "hi"), 1000),
  ],
};
