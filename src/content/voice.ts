// Owner: YASO. Voice lines for the LIVE phone agent (intake greeting, confirmation, disclosure, callback promise).
import type { CaseInput, Lang } from "@/types";
import { formatDate, formatINR } from "@/lib/core/format";

function spellOut(ref: string): string {
  return ref.trim().split("").join("-");
}

/** First thing the AI says when the user calls: greet, say it's Advocall, an AI assistant, ask what happened. */
export function intakeGreeting(lang: Lang): string {
  return {
    en: "Hello! This is Advocall, your AI advocate assistant. Please tell me, what happened?",
    hi: "नमस्ते! मैं Advocall से AI सहायक बात कर रहा हूँ। बताइए, आज क्या समस्या हुई?",
    kn: "ನಮಸ್ಕಾರ! ನಾನು Advocall ನ AI ಸಹಾಯಕ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ. ತಿಳಿಸಿ, ಏನು ತೊಂದರೆಯಾಗಿದೆ?",
  }[lang];
}

/** Reads back company, amount (formatINR), date (formatDate) and the reference SPELLED with hyphens, then asks "is that correct?". */
export function confirmCaseLine(input: CaseInput, lang: Lang): string {
  const company = input.company;
  const amount = formatINR(input.amountPaise);
  const date = formatDate(input.incidentDate);
  const ref = input.txnRef ? spellOut(input.txnRef) : "";

  return {
    en: `Let me confirm the details: ${company}, amount ${amount}, date ${date}${ref ? `, reference ${ref}` : ""}. Is that correct?`,
    hi: `मैं जानकारी की पुष्टि कर लेता हूँ: ${company}, राशि ${amount}, तारीख ${date}${ref ? `, रेफ़रेंस ${ref}` : ""}। क्या यह सही है?`,
    kn: `ವಿವರಗಳನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳುತ್ತೇನೆ: ${company}, ಮೊತ್ತ ${amount}, ದಿನಾಂಕ ${date}${ref ? `, ರೆಫರೆನ್ಸ್ ${ref}` : ""}. ಇದು ಸರಿಯಾಗಿದೆಯೇ?`,
  }[lang];
}

/** English disclosure line when calling company: "Hello, I'm an AI assistant calling on behalf of <name>, who is available to verify if needed." */
export function disclosureLine(userName: string): string {
  return `Hello, I'm an AI assistant calling on behalf of ${userName}, who is available to verify if needed.`;
}

/** "I'll call the company now and call you back with the result." in en / hi / kn. */
export function callbackPromise(lang: Lang): string {
  return {
    en: "I'll call the company now and call you back with the result.",
    hi: "मैं अभी कंपनी को कॉल करता हूँ और नतीजे के साथ आपको वापस कॉल करूँगा।",
    kn: "ನಾನು ಈಗಲೇ ಕಂಪನಿಗೆ ಕರೆ ಮಾಡಿ ಮಾತನಾಡಿ, ಫಲಿತಾಂಶದೊಂದಿಗೆ ನಿಮಗೆ ಮತ್ತೆ ಕರೆ ಮಾಡುತ್ತೇನೆ.",
  }[lang];
}
