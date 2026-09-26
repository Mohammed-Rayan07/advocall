// POST /api/cases/:id/escalate — "deadline missed" button. Owner: Rayan (LOCKED).
import { NextResponse } from "next/server";
import { allEvents, emit } from "@/lib/core/bus";
import { reduceEvents } from "@/lib/core/reduce";
import { todayIST } from "@/lib/core/format";
import { buildEscalationPacket, matchRule } from "@/lib/rules";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const view = reduceEvents(allEvents())[id];
  if (!view) return NextResponse.json({ ok: false, error: "case not found" }, { status: 404 });
  const today = todayIST();
  const match = view.match ?? matchRule(view.case, today);
  const packet = buildEscalationPacket(view.case, match, view.commitment, today);
  emit({ type: "escalation.created", caseId: id, data: { packet } });
  emit({ type: "case.status", caseId: id, data: { status: "escalated", note: `Escalation packet for ${packet.to}` } });
  return NextResponse.json({ ok: true, packet });
}
