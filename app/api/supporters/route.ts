import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Hash: field = supporter name, value = teamId they back.
// Using the name as the field means re-picking a team simply overwrites.
const KEY = "wc2026:supporters";
// Hash: field = supporter name, value = epoch ms they last picked a team.
const TS_KEY = "wc2026:supporter_ts";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

function group(map: Record<string, string>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [name, teamId] of Object.entries(map)) {
    // Skip entries with a blank/whitespace name or no team attached.
    if (!name?.trim() || !teamId?.trim()) continue;
    (out[teamId] ??= []).push(name.trim());
  }
  return out;
}

// Newest joiners first, for the headlines feed.
function recent(map: Record<string, string>, ts: Record<string, string>) {
  return Object.entries(map)
    .filter(([name, teamId]) => name?.trim() && teamId?.trim())
    .map(([name, teamId]) => ({ name: name.trim(), teamId, ts: Number(ts[name]) || 0 }))
    .sort((a, b) => b.ts - a.ts);
}

export async function GET() {
  try {
    if (!redis) return NextResponse.json({ supporters: {}, recent: [] }, { headers: NO_STORE });
    const [map, ts] = await Promise.all([redis.hgetall(KEY), redis.hgetall(TS_KEY)]);
    return NextResponse.json(
      { supporters: group(map), recent: recent(map, ts) },
      { headers: NO_STORE }
    );
  } catch {
    return NextResponse.json({ supporters: {}, recent: [] }, { headers: NO_STORE });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, teamId } = await req.json();
    const clean = String(name ?? "").trim().slice(0, 24);
    if (!clean || !teamId || typeof teamId !== "string") {
      return NextResponse.json({ error: "name and teamId required" }, { status: 400 });
    }
    if (!redis) return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
    await redis.hset(KEY, clean, teamId);
    await redis.hset(TS_KEY, clean, Date.now().toString());
    const [map, ts] = await Promise.all([redis.hgetall(KEY), redis.hgetall(TS_KEY)]);
    return NextResponse.json({ supporters: group(map), recent: recent(map, ts) });
  } catch {
    return NextResponse.json({ error: "Failed to save supporter" }, { status: 500 });
  }
}
