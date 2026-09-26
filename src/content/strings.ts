// Owner: YASO. Dashboard UI labels in 3 languages. Vaishnavi's components call t("key", lang).
import type { Lang } from "@/types";

const en = {
  appName: "Advocall",
  tagline: "Your AI advocate on hold, so you don't have to be",
  liveCases: "Live cases",
  atStake: "At stake",
  recovered: "Recovered",
  ruleApplied: "Rule applied",
  deadline: "Deadline",
  daysLate: "Days late",
  compensation: "Compensation owed",
  ticket: "Ticket number",
  promisedBy: "Promised by",
  transcript: "Live transcript",
  timeline: "Timeline",
  escalate: "Deadline missed: escalate",
  startDemo: "Run demo",
  reset: "Reset",
  connected: "Live",
  disconnected: "Offline",
  noCases: "No cases yet. Call Advocall or run a demo.",
};

export type StringKey = keyof typeof en;

const hi: Record<StringKey, string> = {
  appName: "Advocall",
  tagline: "होल्ड पर आपका AI वकील, ताकि आपको इंतज़ार न करना पड़े",
  liveCases: "लाइव केस",
  atStake: "दांव पर राशि",
  recovered: "वापस मिला",
  ruleApplied: "लागू नियम",
  deadline: "समय सीमा",
  daysLate: "दिन की देरी",
  compensation: "बकाया मुआवज़ा",
  ticket: "शिकायत नंबर",
  promisedBy: "वादा की गई तारीख",
  transcript: "लाइव बातचीत",
  timeline: "टाइमलाइन",
  escalate: "समय सीमा निकल गई: आगे शिकायत करें",
  startDemo: "डेमो चलाएँ",
  reset: "रीसेट",
  connected: "लाइव",
  disconnected: "ऑफ़लाइन",
  noCases: "अभी कोई केस नहीं। Advocall को कॉल करें या डेमो चलाएँ।",
};

const kn: Record<StringKey, string> = {
  appName: "Advocall",
  tagline: "ಹೋಲ್ಡ್‌ನಲ್ಲಿ ನಿಮ್ಮ AI ವಕೀಲ, ನೀವು ಕಾಯಬೇಕಾಗಿಲ್ಲ",
  liveCases: "ಲೈವ್ ಪ್ರಕರಣಗಳು",
  atStake: "ಅಪಾಯದಲ್ಲಿರುವ ಮೊತ್ತ",
  recovered: "ಮರಳಿ ಪಡೆದದ್ದು",
  ruleApplied: "ಅನ್ವಯಿಸಿದ ನಿಯಮ",
  deadline: "ಗಡುವು",
  daysLate: "ದಿನಗಳ ವಿಳಂಬ",
  compensation: "ಬಾಕಿ ಪರಿಹಾರ",
  ticket: "ದೂರು ಸಂಖ್ಯೆ",
  promisedBy: "ಭರವಸೆ ನೀಡಿದ ದಿನಾಂಕ",
  transcript: "ಲೈವ್ ಸಂಭಾಷಣೆ",
  timeline: "ಟೈಮ್‌ಲೈನ್",
  escalate: "ಗಡುವು ಮೀರಿದೆ: ಮುಂದೆ ದೂರು ನೀಡಿ",
  startDemo: "ಡೆಮೊ ಪ್ರಾರಂಭಿಸಿ",
  reset: "ಮರುಹೊಂದಿಸಿ",
  connected: "ಲೈವ್",
  disconnected: "ಆಫ್‌ಲೈನ್",
  noCases: "ಇನ್ನೂ ಯಾವುದೇ ಪ್ರಕರಣಗಳಿಲ್ಲ. Advocall ಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ ಡೆಮೊ ಪ್ರಾರಂಭಿಸಿ.",
};

export const STRINGS: Record<Lang, Record<StringKey, string>> = { en, hi, kn };

export function t(key: StringKey, lang: Lang = "en"): string {
  return STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
}
