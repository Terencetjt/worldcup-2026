import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

// Hash: field = supporter name, value = teamId they back.
// Using the name as the field means re-picking a team simply overwrites.
const KEY = "wc2026:supporters";

function group(map: Record<string, string>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [name, teamId] of Object.entries(map)) {
    (out[teamId] ??= []).push(name);
  }
  return out;
}

export async function GET() {
  try {
    const map = (await kv.hgetall(KEY)) as Record<string, string> | null;
    return NextResponse.json({ supporters: group(map ?? {}) });
  } catch {
    return NextResponse.json({ supporters: {} });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, teamId } = await req.json();
    const clean = String(name ?? "").trim().slice(0, 24);
    if (!clean || !teamId || typeof teamId !== "string") {
      return NextResponse.json({ error: "name and teamId required" }, { status: 400 });
    }
    await kv.hset(KEY, { [clean]: teamId });
    const map = (await kv.hgetall(KEY)) as Record<string, string>;
    return NextResponse.json({ supporters: group(map ?? {}) });
  } catch {
    return NextResponse.json({ error: "Failed to save supporter" }, { status: 500 });
  }
}
