// Owner: YASO. Texts sent to the user: SMS summary + what the report-back call says.
import type { CaseView, Lang } from "@/types";
import { formatDate, formatINR } from "@/lib/core/format";

function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] || full;
}

/** SMS after the advocate call. Max 320 characters. Must include case id, amount, ticket (if any). */
export function buildSmsSummary(view: CaseView, lang: Lang): string {
  const { id, company, amountPaise } = view.case;
  const amount = formatINR(amountPaise);
  const k = view.commitment;
  const by = k?.promisedBy ? formatDate(k.promisedBy) : null;

  let text: string;
  if (k) {
    const date = {
      en: by ? ` Resolution promised by ${by}.` : "",
      hi: by ? ` ${by} तक समाधान का वादा किया गया है।` : "",
      kn: by ? ` ${by} ಒಳಗೆ ಪರಿಹಾರದ ಭರವಸೆ ನೀಡಲಾಗಿದೆ.` : "",
    }[lang];
    text = {
      en: `Advocall: Case ${id}. ${company} registered complaint ${k.ticketNo} for your ${amount}.${date} We'll follow up if it's late.`,
      hi: `Advocall: केस ${id}. ${company} ने आपके ${amount} के लिए शिकायत ${k.ticketNo} दर्ज की है।${date} देर होने पर हम फॉलो-अप करेंगे।`,
      kn: `Advocall: ಕೇಸ್ ${id}. ${company} ನಿಮ್ಮ ${amount} ಗಾಗಿ ದೂರು ${k.ticketNo} ದಾಖಲಿಸಿದೆ.${date} ತಡವಾದರೆ ನಾವು ಫಾಲೋ-ಅಪ್ ಮಾಡುತ್ತೇವೆ.`,
    }[lang];
  } else {
    text = {
      en: `Advocall: Case ${id}. ${company} did not register a complaint for your ${amount}. Reply YES and we'll escalate it to the regulator.`,
      hi: `Advocall: केस ${id}. ${company} ने आपके ${amount} की शिकायत दर्ज नहीं की। YES लिखें, हम इसे नियामक तक ले जाएंगे।`,
      kn: `Advocall: ಕೇಸ್ ${id}. ${company} ನಿಮ್ಮ ${amount} ದೂರನ್ನು ದಾಖಲಿಸಲಿಲ್ಲ. YES ಎಂದು ಉತ್ತರಿಸಿ, ನಾವು ನಿಯಂತ್ರಕರಿಗೆ ದೂರು ನೀಡುತ್ತೇವೆ.`,
    }[lang];
  }
  return text.length <= 320 ? text : text.slice(0, 317) + "...";
}

/** What the AI says on the report-back call. 2–4 short spoken sentences, in `lang`. */
export function buildReportScript(view: CaseView, lang: Lang): string {
  const name = firstName(view.case.userName);
  const company = view.case.company;
  const amount = formatINR(view.case.amountPaise);
  const k = view.commitment;

  if (k) {
    const by = k.promisedBy ? formatDate(k.promisedBy) : null;
    return {
      en: `Hello ${name}, this is Advocall with good news. I spoke to ${company} about your ${amount}, and they registered complaint number ${k.ticketNo}${by ? `, with the money promised back by ${by}` : ""}. I've sent you an SMS with the details, and if they miss the date, I'll escalate it for you.`,
      hi: `नमस्ते ${name} जी, मैं Advocall से बोल रहा हूँ, अच्छी खबर है। मैंने ${company} से आपके ${amount} के बारे में बात की, उन्होंने शिकायत नंबर ${k.ticketNo} दर्ज किया है${by ? ` और ${by} तक पैसे वापस करने का वादा किया है` : ""}। पूरी जानकारी SMS पर भेज दी है, और अगर तारीख निकल गई तो मैं आगे शिकायत करूँगा।`,
      kn: `ನಮಸ್ಕಾರ ${name} ಅವರೇ, ನಾನು Advocall ಇಂದ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ, ಒಳ್ಳೆಯ ಸುದ್ದಿ ಇದೆ. ${company} ಜೊತೆ ನಿಮ್ಮ ${amount} ಬಗ್ಗೆ ಮಾತನಾಡಿದೆ, ಅವರು ದೂರು ಸಂಖ್ಯೆ ${k.ticketNo} ದಾಖಲಿಸಿದ್ದಾರೆ${by ? ` ಮತ್ತು ${by} ಒಳಗೆ ಹಣ ವಾಪಸ್ ಮಾಡುವುದಾಗಿ ಹೇಳಿದ್ದಾರೆ` : ""}. ವಿವರಗಳನ್ನು SMS ಮೂಲಕ ಕಳುಹಿಸಿದ್ದೇನೆ, ದಿನಾಂಕ ತಪ್ಪಿದರೆ ನಾನು ಮುಂದೆ ದೂರು ನೀಡುತ್ತೇನೆ.`,
    }[lang];
  }
  return {
    en: `Hello ${name}, this is Advocall. I called ${company} about your ${amount}, but they did not give a complaint number or a date. Shall I escalate this to the regulator for you?`,
    hi: `नमस्ते ${name} जी, मैं Advocall से बोल रहा हूँ। मैंने ${company} से आपके ${amount} के बारे में बात की, लेकिन उन्होंने कोई शिकायत नंबर या तारीख नहीं दी। क्या मैं इसे नियामक तक ले जाऊँ?`,
    kn: `ನಮಸ್ಕಾರ ${name} ಅವರೇ, ನಾನು Advocall ಇಂದ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ. ${company} ಗೆ ನಿಮ್ಮ ${amount} ಬಗ್ಗೆ ಕರೆ ಮಾಡಿದೆ, ಆದರೆ ಅವರು ದೂರು ಸಂಖ್ಯೆ ಅಥವಾ ದಿನಾಂಕ ನೀಡಲಿಲ್ಲ. ಇದನ್ನು ನಿಯಂತ್ರಕರಿಗೆ ತೆಗೆದುಕೊಂಡು ಹೋಗಲೇ?`,
  }[lang];
}
