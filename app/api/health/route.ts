import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.REDIS_URL;
  const info = {
    hasRedisUrl: Boolean(url),
    urlScheme: url ? url.split("://")[0] : null,
    clientCreated: Boolean(redis),
    ping: null as string | null,
    error: null as string | null,
  };

  if (!redis) {
    return NextResponse.json(info);
  }

  try {
    info.ping = await redis.ping();
  } catch (e) {
    info.error = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  }

  return NextResponse.json(info);
}
