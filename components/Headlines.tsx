"use client";
import { useEffect, useState } from "react";
import { Fixture } from "@/lib/types";

const KNOCKOUT_STAGES: Record<string, string> = {
  LAST_32: "Round of 32",
  LAST_16: "Round of 16",
  QUARTER_FINALS: "Quarter-Final",
  QUARTER_FINAL: "Quarter-Final",
  SEMI_FINALS: "Semi-Final",
  SEMI_FINAL: "Semi-Final",
  THIRD_PLACE: "Third-Place Playoff",
  PLAYOFF_FOR_THIRD_PLACE: "Third-Place Playoff",
  FINAL: "Final",
};

interface Headline {
  id: number;
  text: string;
  stage: string;
  date: string;
}

function shortName(t: { shortName: string; name: string }) {
  return t.shortName || t.name;
}

function buildHeadline(m: Fixture): Headline | null {
  const stage = KNOCKOUT_STAGES[m.stage];
  if (!stage || m.status !== "FINISHED") return null;

  const home = shortName(m.homeTeam);
  const away = shortName(m.awayTeam);
  const hf = m.score.fullTime.home ?? 0;
  const af = m.score.fullTime.away ?? 0;

  // Decide the winner; fall back to comparing goals if no explicit winner.
  let winner: string, loser: string, wg: number, lg: number;
  if (m.score.winner === "HOME_TEAM" || (!m.score.winner && hf > af)) {
    winner = home; loser = away; wg = hf; lg = af;
  } else if (m.score.winner === "AWAY_TEAM" || (!m.score.winner && af > hf)) {
    winner = away; loser = home; wg = af; lg = hf;
  } else {
    return null; // genuine draw with no decider — can't call a knockout
  }

  const score = `${wg}-${lg}`;
  const pens =
    hf === af && m.score.penalties
      ? ` (${m.score.penalties.home}-${m.score.penalties.away} on pens)`
      : "";

  let text: string;
  if (m.stage === "FINAL") {
    text = `🏆 CHAMPIONS! ${winner} beat ${loser} ${score}${pens} to lift the World Cup!`;
  } else {
    const templates = [
      `🎙️ FULL TIME! ${winner} KNOCK OUT ${loser} ${score}${pens} — ${loser} are heading home! 🧳`,
      `🚨 ${winner} END ${loser}'s dream! A ${score}${pens} ${stage} win sends them crashing out! 💔`,
      `🎙️ It's all over for ${loser}! ${winner} march on after a ${score}${pens} ${stage} triumph. ✈️`,
      `🚨 HEARTBREAK! ${winner} dump ${loser} out of the ${stage} with a ${score}${pens} win!`,
      `🎙️ ${winner} ${score} ${loser}${pens} — ${winner} book their place, ${loser} are OUT!`,
    ];
    text = templates[m.id % templates.length];
  }

  return {
    id: m.id,
    text,
    stage,
    date: new Date(m.utcDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
  };
}

export default function Headlines() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = () =>
      fetch("/api/fixtures", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setFixtures(d.matches ?? []))
        .catch(() => {})
        .finally(() => setLoaded(true));
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const headlines = fixtures
    .map(buildHeadline)
    .filter((h): h is Headline => h !== null)
    .sort((a, b) => b.id - a.id);

  if (!loaded) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-900 to-green-800 rounded-2xl shadow-sm overflow-hidden mb-6">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10">
        <span className="text-lg">🎙️</span>
        <span className="font-black text-white text-sm uppercase tracking-wider">
          Knockout Headlines
        </span>
        <span className="flex items-center gap-1 ml-auto text-[10px] font-bold text-white bg-red-500 rounded-full px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
        </span>
      </div>

      {headlines.length === 0 ? (
        <p className="px-4 py-4 text-sm text-emerald-100/90">
          Group stage is heating up — the first knockouts will be called right here.
          Eliminations get announced the moment they happen. Stay tuned! ⚽
        </p>
      ) : (
        <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
          {headlines.map((h) => (
            <div key={h.id} className="flex items-start gap-3 px-4 py-3">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider whitespace-nowrap mt-0.5 w-20 shrink-0">
                {h.stage}
              </span>
              <p className="text-sm text-white font-medium leading-snug flex-1">{h.text}</p>
              <span className="text-[10px] text-emerald-200/70 whitespace-nowrap mt-0.5">
                {h.date}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
