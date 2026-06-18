import { NextRequest, NextResponse } from "next/server";

const FOOTBALL_API = "https://api.football-data.org/v4";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const teamTla = searchParams.get("team");

  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "API token not configured" }, { status: 500 });
  }

  // Fetch every match regardless of status, then filter client-side.
  const url = `${FOOTBALL_API}/competitions/WC/matches`;

  const res = await fetch(url, {
    headers: { "X-Auth-Token": token },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const data = await res.json();

  if (teamTla) {
    const tla = teamTla.toUpperCase();
    data.matches = (data.matches ?? []).filter(
      (m: { homeTeam: { tla: string }; awayTeam: { tla: string } }) =>
        m.homeTeam.tla === tla || m.awayTeam.tla === tla
    );
  }

  return NextResponse.json(data);
}
