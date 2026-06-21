import { Fixture } from "./types";

const FOOTBALL_API = "https://api.football-data.org/v4";

// Server-side fetch of all World Cup matches. Returns [] if unavailable so
// callers degrade gracefully.
export async function getMatches(): Promise<Fixture[]> {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) return [];
  try {
    const res = await fetch(`${FOOTBALL_API}/competitions/WC/matches`, {
      headers: { "X-Auth-Token": token },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.matches ?? []) as Fixture[];
  } catch {
    return [];
  }
}

// A match users are allowed to predict on (not yet started).
export function isPredictable(m: Fixture): boolean {
  return (m.status === "SCHEDULED" || m.status === "TIMED") &&
    new Date(m.utcDate).getTime() > Date.now();
}
