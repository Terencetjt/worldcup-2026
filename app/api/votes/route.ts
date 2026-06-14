import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

const VOTES_KEY = "wc2026:votes";

export async function GET() {
  try {
    const votes = (await kv.hgetall(VOTES_KEY)) as Record<string, number> | null;
    const data = votes ?? {};
    const total = Object.values(data).reduce((s, v) => s + Number(v), 0);
    return NextResponse.json({ votes: data, total });
  } catch {
    return NextResponse.json({ votes: {}, total: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { teamId } = await req.json();
    if (!teamId || typeof teamId !== "string") {
      return NextResponse.json({ error: "Invalid teamId" }, { status: 400 });
    }
    await kv.hincrby(VOTES_KEY, teamId, 1);
    const votes = (await kv.hgetall(VOTES_KEY)) as Record<string, number>;
    const total = Object.values(votes).reduce((s, v) => s + Number(v), 0);
    return NextResponse.json({ votes, total });
  } catch {
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
  }
}
