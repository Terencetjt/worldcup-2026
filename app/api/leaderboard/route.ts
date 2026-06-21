import { redis } from "@/lib/redis";
import { getMatches } from "@/lib/fixtures";
import { computeLeaderboard } from "@/lib/scoring";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export async function GET() {
  try {
    if (!redis) return NextResponse.json({ leaderboard: [] }, { headers: NO_STORE });
    const [predictions, supporters, matches] = await Promise.all([
      redis.hgetall("wc2026:predictions"),
      redis.hgetall("wc2026:supporters"),
      getMatches(),
    ]);
    const leaderboard = computeLeaderboard(predictions, supporters, matches);
    return NextResponse.json({ leaderboard }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ leaderboard: [] }, { headers: NO_STORE });
  }
}
