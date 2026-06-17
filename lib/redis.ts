import Redis from "ioredis";

// Reuse one client across warm serverless invocations to avoid exhausting
// connections. REDIS_URL is provided by the Vercel Redis integration.
declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

function create(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  return new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: false,
  });
}

export const redis: Redis | null = global.__redis ?? create();
if (process.env.NODE_ENV !== "production") global.__redis = redis ?? undefined;
