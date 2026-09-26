// POST /api/demo/reset — clears all events. Owner: Rayan (LOCKED).
import { NextResponse } from "next/server";
import { resetBus } from "@/lib/core/bus";

export const dynamic = "force-dynamic";

export async function POST() {
  resetBus();
  return NextResponse.json({ ok: true });
}
