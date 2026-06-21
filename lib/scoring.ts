import { Fixture } from "./types";

export interface LeaderboardRow {
  name: string;
  teamId: string | null;
  points: number;
  correct: number; // count of correct-winner predictions
  exact: number; // count of exact-score predictions
}

// Predictions hash: field `${name}|${matchId}` -> "h-a".
type PredictionMap = Record<string, string>;
// Supporters hash: name -> teamId.
type SupporterMap = Record<string, string>;

interface Pred {
  name: string;
  home: number;
  away: number;
}

function outcome(h: number, a: number): "H" | "A" | "D" {
  return h > a ? "H" : h < a ? "A" : "D";
}

function parsePredictions(map: PredictionMap): Record<string, Pred[]> {
  const byMatch: Record<string, Pred[]> = {};
  for (const [field, val] of Object.entries(map)) {
    const sep = field.lastIndexOf("|");
    if (sep < 0) continue;
    const name = field.slice(0, sep).trim();
    const matchId = field.slice(sep + 1);
    const [h, a] = val.split("-").map(Number);
    if (!name || Number.isNaN(h) || Number.isNaN(a)) continue;
    (byMatch[matchId] ??= []).push({ name, home: h, away: a });
  }
  return byMatch;
}

export function computeLeaderboard(
  predictions: PredictionMap,
  supporters: SupporterMap,
  matches: Fixture[]
): LeaderboardRow[] {
  const byMatch = parsePredictions(predictions);

  // Everyone with a team or a prediction is a player.
  const rows = new Map<string, LeaderboardRow>();
  const ensure = (name: string): LeaderboardRow => {
    let r = rows.get(name);
    if (!r) {
      r = { name, teamId: supporters[name] ?? null, points: 0, correct: 0, exact: 0 };
      rows.set(name, r);
    }
    return r;
  };
  for (const name of Object.keys(supporters)) if (name.trim()) ensure(name.trim());

  for (const m of matches) {
    if (m.status !== "FINISHED") continue;
    const aH = m.score.fullTime.home;
    const aA = m.score.fullTime.away;
    if (aH == null || aA == null) continue;

    const actual = outcome(aH, aA);
    for (const p of byMatch[String(m.id)] ?? []) {
      const row = ensure(p.name);
      if (p.home === aH && p.away === aA) {
        row.points += 10; // exact score
        row.exact += 1;
      } else if (outcome(p.home, p.away) === actual) {
        row.points += 5; // correct winner, wrong score
        row.correct += 1;
      }
    }
  }

  return [...rows.values()].sort(
    (a, b) => b.points - a.points || a.name.localeCompare(b.name)
  );
}
