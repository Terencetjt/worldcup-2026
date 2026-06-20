import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Raw dump of everything stored, including blank/junk entries that the normal
// endpoints filter out. Read-only.
export async function GET() {
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
  }

  const [votes, supporters] = await Promise.all([
    redis.hgetall("wc2026:votes"),
    redis.hgetall("wc2026:supporters"),
  ]);

  return NextResponse.json(
    {
      votes,
      voteEntries: Object.keys(votes).length,
      supporters,
      supporterEntries: Object.keys(supporters).length,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
