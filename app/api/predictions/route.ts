import { redis } from "@/lib/redis";
import { getMatches, isPredictable } from "@/lib/fixtures";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEY = "wc2026:predictions";
const SUBJECT_KEY = "wc2026:pred_subject";
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
    const { name, matchId, home, away, teamId } = await req.json();
    const clean = String(name ?? "").trim().slice(0, 24);
    const subject = String(teamId ?? "").trim();
    const h = Number(home);
    const a = Number(away);
    if (
      !clean || matchId == null || !subject ||
      !Number.isInteger(h) || !Number.isInteger(a) ||
      h < 0 || a < 0 || h > 99 || a > 99
    ) {
      return NextResponse.json({ error: "Invalid prediction" }, { status: 400 });
    }
    if (!redis) return NextResponse.json({ error: "Storage not configured" }, { status: 500 });

    // Only allow predictions on matches that haven't kicked off.
    const match = (await getMatches()).find((m) => String(m.id) === String(matchId));
    if (!match || !isPredictable(match)) {
      return NextResponse.json({ error: "Match is closed for predictions" }, { status: 400 });
    }

    // The team being voted on must play in this match and be one fans have backed.
    if (match.homeTeam.tla !== subject && match.awayTeam.tla !== subject) {
      return NextResponse.json({ error: "Team is not in this match" }, { status: 400 });
    }
    const supporters = await redis.hgetall("wc2026:supporters");
    const backed = new Set(Object.values(supporters));
    if (!backed.has(subject)) {
      return NextResponse.json(
        { error: "You can only vote on teams fans have backed" },
        { status: 403 }
      );
    }

    await redis.hset(KEY, `${clean}|${matchId}`, `${h}-${a}`);
    await redis.hset(SUBJECT_KEY, `${clean}|${matchId}`, subject);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save prediction" }, { status: 500 });
  }
}
