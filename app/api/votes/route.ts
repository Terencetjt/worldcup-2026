import { redis } from "@/lib/redis";
import { TEAMS } from "@/lib/teams";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VOTES_KEY = "wc2026:votes";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };
const VALID_TEAMS = new Set(TEAMS.map((t) => t.id));

function total(map: Record<string, string>): number {
  return Object.values(map).reduce((s, v) => s + Number(v), 0);
}

// Drop votes for teams that no longer exist (e.g. removed placeholders),
// physically deleting the stale fields from Redis.
async function clean(votes: Record<string, string>): Promise<Record<string, string>> {
  const stale = Object.keys(votes).filter((id) => !VALID_TEAMS.has(id));
  if (stale.length && redis) {
    await redis.hdel(VOTES_KEY, ...stale);
    for (const id of stale) delete votes[id];
  }
  return votes;
}

export async function GET() {
  try {
    if (!redis) return NextResponse.json({ votes: {}, total: 0 }, { headers: NO_STORE });
    const votes = await clean(await redis.hgetall(VOTES_KEY));
    return NextResponse.json({ votes, total: total(votes) }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ votes: {}, total: 0 }, { headers: NO_STORE });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { teamId } = await req.json();
    if (!teamId || typeof teamId !== "string") {
      return NextResponse.json({ error: "Invalid teamId" }, { status: 400 });
    }
    if (!redis) return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
    await redis.hincrby(VOTES_KEY, teamId, 1);
    const votes = await redis.hgetall(VOTES_KEY);
    return NextResponse.json({ votes, total: total(votes) });
  } catch {
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
  }
}
