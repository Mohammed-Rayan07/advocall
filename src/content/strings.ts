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
  // TODO(Yaso): add any keys Vaishnavi asks for (add to ALL languages)
};

export type StringKey = keyof typeof en;

export const STRINGS: Record<Lang, Record<StringKey, string>> = {
  en,
  hi: { ...en }, // TODO(Yaso): translate every value to Hindi
  kn: { ...en }, // TODO(Yaso): translate every value to Kannada
};

export function t(key: StringKey, lang: Lang = "en"): string {
  return STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
}
