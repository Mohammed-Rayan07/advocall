// Rights engine public API. Owner: AGASTYA (folder src/lib/rules/).
// Keep these export names and signatures EXACTLY. Rayan's backend and Yaso's mock scripts import them.
export { RULES } from "./data";
export { addDays, daysBetween, isValidYmd } from "./dates";
export { matchRule } from "./engine";
export { buildEscalationPacket } from "./escalation";
