import Redis, { RedisOptions } from "ioredis";

// Reuse one client across warm serverless invocations to avoid exhausting
// connections. REDIS_URL is provided by the Vercel Redis integration.
declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

function create(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  const opts: RedisOptions = {
    // Fail fast in serverless instead of hanging on a dead connection.
    maxRetriesPerRequest: 2,
    connectTimeout: 10_000,
    // Don't queue commands while offline — surfaces errors instead of hanging.
    enableOfflineQueue: false,
    lazyConnect: false,
  };

  // Managed Redis (rediss://) requires TLS. Enable it explicitly; some hosts
  // present certs that need the SNI servername set.
  if (url.startsWith("rediss://")) {
    opts.tls = { servername: new URL(url).hostname };
  }

  const client = new Redis(url, opts);
  // Prevent an unhandled 'error' event from crashing the function.
  client.on("error", (err) => console.error("[redis] connection error:", err.message));
  return client;
}

export const redis: Redis | null = global.__redis ?? create();
if (process.env.NODE_ENV !== "production") global.__redis = redis ?? undefined;
