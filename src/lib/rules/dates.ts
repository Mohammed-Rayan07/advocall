// Owner: AGASTYA. Pure calendar maths on "YYYY-MM-DD" strings. No time zones, no Date.now().

const DAY_MS = 86_400_000;

function toUtcMs(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** true for a real calendar date like "2026-09-20"; false for "20-09-2026", "2026-02-30", "" */
export function isValidYmd(ymd: string): boolean {
  if (typeof ymd !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** addDays("2026-09-30", 1) === "2026-10-01" */
export function addDays(ymd: string, days: number): string {
  return new Date(toUtcMs(ymd) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Whole days from a to b. daysBetween("2026-09-21", "2026-09-26") === 5 (negative if b is before a) */
export function daysBetween(a: string, b: string): number {
  return Math.round((toUtcMs(b) - toUtcMs(a)) / DAY_MS);
}
