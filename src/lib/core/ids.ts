// Owner: Rayan (LOCKED).
let caseCounter = 141;

export function newId(prefix = "ev"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** Human-friendly case ids: A-0142, A-0143 ... */
export function newCaseId(): string {
  caseCounter += 1;
  return `A-${String(caseCounter).padStart(4, "0")}`;
}
