import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Hash: field = supporter name, value = teamId they back.
// Using the name as the field means re-picking a team simply overwrites.
const KEY = "wc2026:supporters";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

function group(map: Record<string, string>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [name, teamId] of Object.entries(map)) {
    (out[teamId] ??= []).push(name);
  }
  return out;
}

export async function GET() {
  try {
    if (!redis) return NextResponse.json({ supporters: {} }, { headers: NO_STORE });
    const map = await redis.hgetall(KEY);
    return NextResponse.json({ supporters: group(map) }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ supporters: {} }, { headers: NO_STORE });
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
    const map = await redis.hgetall(KEY);
    return NextResponse.json({ supporters: group(map) });
  } catch {
    return NextResponse.json({ error: "Failed to save supporter" }, { status: 500 });
  }
}
