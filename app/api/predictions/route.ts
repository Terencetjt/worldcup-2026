import { redis } from "@/lib/redis";
import { getMatches, isPredictable } from "@/lib/fixtures";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEY = "wc2026:predictions";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

// GET /api/predictions?name=foo -> { predictions: { [matchId]: "h-a" } }
export async function GET(req: NextRequest) {
  const name = (new URL(req.url).searchParams.get("name") ?? "").trim();
  if (!redis || !name) return NextResponse.json({ predictions: {} }, { headers: NO_STORE });

  const all = await redis.hgetall(KEY);
  const mine: Record<string, string> = {};
  const prefix = `${name}|`;
  for (const [field, val] of Object.entries(all)) {
    if (field.startsWith(prefix)) mine[field.slice(prefix.length)] = val;
  }
  return NextResponse.json({ predictions: mine }, { headers: NO_STORE });
}

export async function POST(req: NextRequest) {
  try {
    const { name, matchId, home, away } = await req.json();
    const clean = String(name ?? "").trim().slice(0, 24);
    const h = Number(home);
    const a = Number(away);
    if (
      !clean || matchId == null ||
      !Number.isInteger(h) || !Number.isInteger(a) ||
      h < 0 || a < 0 || h > 99 || a > 99
    ) {
      return NextResponse.json({ error: "Invalid prediction" }, { status: 400 });
    }
    if (!redis) return NextResponse.json({ error: "Storage not configured" }, { status: 500 });

    // Anyone can predict any match that hasn't kicked off.
    const match = (await getMatches()).find((m) => String(m.id) === String(matchId));
    if (!match || !isPredictable(match)) {
      return NextResponse.json({ error: "Match is closed for predictions" }, { status: 400 });
    }

    await redis.hset(KEY, `${clean}|${matchId}`, `${h}-${a}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save prediction" }, { status: 500 });
  }
}
