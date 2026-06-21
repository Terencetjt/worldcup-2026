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
    const preds = byMatch[String(m.id)] ?? [];
    const home = m.homeTeam.tla;
    const away = m.awayTeam.tla;

    // Base points earned by each predictor.
    for (const p of preds) {
      const row = ensure(p.name);
      if (p.home === aH && p.away === aA) {
        row.points += 10;
        row.exact += 1;
      } else if (outcome(p.home, p.away) === actual) {
        row.points += 5;
        row.correct += 1;
      }
    }

    // Rivalry deductions: when your favourite team did NOT win and a rival
    // (supporter of the opposing team) correctly predicted that result.
    const sides: [string, string, "H" | "A"][] = [
      [home, away, "H"],
      [away, home, "A"],
    ];
    for (const [favTeam, rivalTeam, favWin] of sides) {
      if (actual === favWin) continue; // fav won — rivals were wrong

      let penalty = 0;
      for (const p of preds) {
        if (supporters[p.name] !== rivalTeam) continue; // only rival supporters
        if (outcome(p.home, p.away) !== actual) continue; // rival must be right
        penalty = Math.max(penalty, p.home === aH && p.away === aA ? 5 : 3);
      }
      if (penalty === 0) continue;

      // Deduct from every supporter of the beaten favourite team.
      for (const [name, team] of Object.entries(supporters)) {
        if (team === favTeam && name.trim()) ensure(name.trim()).points -= penalty;
      }
    }
  }

  return [...rows.values()]
    .map((r) => ({ ...r, points: Math.max(0, r.points) })) // floor at 0
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
}
