// Owner: AGASTYA. Pure calendar maths on "YYYY-MM-DD" strings. No time zones, no Date.now().

/** true for a real calendar date like "2026-09-20"; false for "20-09-2026", "2026-02-30", "" */
export function isValidYmd(ymd: string): boolean {
  // TODO(Agastya)
  return /^\d{4}-\d{2}-\d{2}$/.test(ymd);
}

/** addDays("2026-09-30", 1) === "2026-10-01" */
export function addDays(ymd: string, days: number): string {
  // TODO(Agastya)
  void days;
  return ymd;
}

/** Whole days from a to b. daysBetween("2026-09-21", "2026-09-26") === 5 (negative if b is before a) */
export function daysBetween(a: string, b: string): number {
  // TODO(Agastya)
  void a;
  void b;
  return 0;
}
