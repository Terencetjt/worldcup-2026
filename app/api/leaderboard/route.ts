import { redis } from "@/lib/redis";
import { getMatches } from "@/lib/fixtures";
import { computeLeaderboard } from "@/lib/scoring";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export async function GET() {
  try {
    if (!redis) return NextResponse.json({ leaderboard: [], picks: [] }, { headers: NO_STORE });
    const [predictions, subjects, supporters, matches] = await Promise.all([
      redis.hgetall("wc2026:predictions"),
      redis.hgetall("wc2026:pred_subject"),
      redis.hgetall("wc2026:supporters"),
      getMatches(),
    ]);
    const leaderboard = computeLeaderboard(predictions, supporters, matches);

    // Each player's picked scoreline, newest matches first, for the callout feed.
    const byId = new Map(matches.map((m) => [String(m.id), m]));
    const picks = Object.entries(predictions)
      .map(([field, val]) => {
        const sep = field.lastIndexOf("|");
        if (sep < 0) return null;
        const name = field.slice(0, sep).trim();
        const m = byId.get(field.slice(sep + 1));
        const [h, a] = val.split("-");
        if (!name || !m) return null;
        // The team this pick is a vote on (defaults to the predictor's own team).
        const subject = (subjects[field] as string) ?? supporters[name] ?? null;
        return {
          name,
          teamId: supporters[name] ?? null,
          subject,
          home: m.homeTeam.tla,
          away: m.awayTeam.tla,
          ph: Number(h),
          pa: Number(a),
          status: m.status,
          ts: new Date(m.utcDate).getTime(),
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => b.ts - a.ts);

    return NextResponse.json({ leaderboard, picks }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ leaderboard: [] }, { headers: NO_STORE });
  }
}
