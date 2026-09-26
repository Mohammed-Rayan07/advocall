// Owner: YASO. Telecom billing dispute (R3 unverified: no legal claim, standard docket request).
import type { CaseInput, Commitment, DemoScript } from "@/types";
import { matchRule } from "@/lib/rules";
import { todayIST } from "@/lib/core/format";
import { buildReportScript, buildSmsSummary } from "@/content";
import { makeCase, scriptFor, viewFor } from "../helpers";

const CASE_ID = "A-0145";

const input: CaseInput = {
  userName: "Anita Verma",
  userPhone: "+919800000007",
  language: "hi",
  company: "Airtel",
  category: "telecom_billing",
  amountPaise: 79900,
  incidentDate: "2026-09-10",
  txnRef: "BILL-5521907",
  description: "Overcharged ₹799 on the postpaid mobile bill for international roaming packs that were never activated.",
};

const c = makeCase(input, CASE_ID, "intake");
const match = matchRule(input, todayIST());
const commitment: Commitment = {
  caseId: CASE_ID,
  ticketNo: "AIR-339812",
  promisedBy: "2026-10-05",
  compensationAck: false,
  confirmed: true,
};
const view = viewFor({ ...c, status: "promised" }, match, commitment);

const s = scriptFor(CASE_ID);
const IN = "call_a0145_intake";
const ADV = "call_a0145_adv";
const REP = "call_a0145_report";

export const telecomScript: DemoScript = {
  id: "telecom",
  title: "Telecom billing dispute",
  description: "₹799 postpaid overcharge: Hindi intake → Advocall requests docket number without legal claims → docket AIR-339812 issued.",
  steps: [
    s.created(c),

    // 1. Intake call (Hindi)
    s.startCall(IN, "intake", input.userPhone, 800),
    s.say(IN, "agent", "hi", "नमस्ते! मैं Advocall से AI सहायक बात कर रहा हूँ। बताइए, आपकी क्या समस्या है?", 1200),
    s.say(IN, "user", "hi", "मेरे एयरटेल पोस्टपेड बिल में ₹799 का गलत चार्ज लगा है। मैंने कोई रोमिंग पैक नहीं लिया था।", 3000),
    s.say(IN, "agent", "hi", "समझ गया। क्या आपके पास बिल या अकाउंट नंबर का रेफ़रेंस है?", 2500),
    s.say(IN, "user", "hi", "हाँ, बिल रेफ़रेंस है BILL-5521907।", 2500),
    s.say(IN, "agent", "hi", "पुष्टि कर लेता हूँ: एयरटेल पोस्टपेड, ₹799, 10 सितंबर का बिल, रेफ़रेंस B-I-L-L-5-5-2-1-9-0-7। सही है?", 2500),
    s.say(IN, "user", "hi", "हाँ जी, बिल्कुल सही है।", 2000),
    s.say(IN, "agent", "hi", "धन्यवाद। मैं अभी एयरटेल कस्टमर केयर से बात करके समाधान करवाता हूँ और आपको वापस कॉल करूँगा।", 2500),
    s.endCall(IN, "Case captured: Airtel postpaid overcharge ₹799", 2000),

    // 2. Rights engine (R3 is unverified: claimable is false, standard escalation)
    s.matched(match, 1200),
    s.status("open", "Rule matched", 600),
    s.status("calling", "Calling Airtel", 1200),

    // 3. Advocate call to Airtel customer service
    s.startCall(ADV, "advocate", "+919800000008", 800),
    s.state(ADV, "DISCLOSE", 1500),
    s.say(ADV, "agent", "en", "Hello, I'm an AI assistant calling on behalf of Ms. Anita Verma regarding a billing dispute.", 1000),
    s.state(ADV, "STATE_CASE", 2500),
    s.say(ADV, "agent", "en", "On postpaid bill BILL-5521907 dated 10 September, ₹799 was wrongly billed for unactivated roaming packs.", 800),
    s.state(ADV, "ASK", 3500),
    s.say(ADV, "agent", "en", "Could you please register this complaint and provide a service docket number for the billing adjustment?", 600),
    s.say(ADV, "company", "en", "Ma'am, charges once billed cannot be reversed immediately. You can pay this cycle and adjust next month.", 3500),
    s.state(ADV, "PUSH_BACK", 800),
    s.say(ADV, "agent", "en", match.pushBackLine, 1000),
    s.say(ADV, "company", "en", "Alright, let me generate a docket for billing review. Docket number is AIR-339812, resolution by 05 October.", 5000),
    s.state(ADV, "CAPTURE", 800),
    s.say(ADV, "agent", "en", "Confirming docket number A-I-R-3-3-9-8-1-2 with credit adjustment scheduled by 05 October. Correct?", 1000),
    s.say(ADV, "company", "en", "Yes, that is correct. It has been marked for billing reversal.", 3000),
    s.commitment(commitment, 1000),
    s.state(ADV, "CLOSE", 1000),
    s.say(ADV, "agent", "en", "Thank you for the confirmation. Have a nice day.", 800),
    s.endCall(ADV, "Docket AIR-339812, credit adjustment promised by 05 Oct", 1500),
    s.status("promised", "Docket AIR-339812", 800),

    // 4. Report-back call (Hindi)
    s.startCall(REP, "report", input.userPhone, 2000),
    s.say(REP, "agent", "hi", buildReportScript(view, "hi"), 2000),
    s.say(REP, "user", "hi", "बहुत अच्छा हुआ! बहुत धन्यवाद आपकी मदद के लिए।", 5000),
    s.endCall(REP, "User informed", 1500),

    // 5. SMS summary
    s.sms(input.userPhone, "hi", buildSmsSummary(view, "hi"), 1000),
  ],
};
