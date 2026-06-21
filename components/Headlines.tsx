"use client";
import { useEffect, useState } from "react";
import { Fixture } from "@/lib/types";
import { TEAMS } from "@/lib/teams";

const KNOCKOUT_STAGES = new Set([
  "LAST_32", "LAST_16", "QUARTER_FINALS", "QUARTER_FINAL",
  "SEMI_FINALS", "SEMI_FINAL", "FINAL", "THIRD_PLACE",
  "PLAYOFF_FOR_THIRD_PLACE",
]);

interface RecentSupporter {
  name: string;
  teamId: string;
  ts: number;
}

type Result = "won" | "lost" | "out" | "champion" | null;

interface Headline {
  key: string;
  text: string;
  tone: "join" | "win" | "out" | "rivalry";
  ts: number;
}

function rep(names: string[]): string {
  if (names.length === 0) return "";
  return names.length === 1 ? names[0] : `${names[0]} & ${names.length - 1} more`;
}

// Head-to-head rivalry callouts for matches where both teams have fans.
function buildRivalries(matches: Fixture[], byTeam: Record<string, string[]>): Headline[] {
  const out: Headline[] = [];
  for (const m of matches) {
    const hFans = byTeam[m.homeTeam.tla] ?? [];
    const aFans = byTeam[m.awayTeam.tla] ?? [];
    if (hFans.length === 0 || aFans.length === 0) continue;

    const h = teamMeta(m.homeTeam.tla);
    const a = teamMeta(m.awayTeam.tla);
    const hTeam = `${h.flag} ${h.name}`.trim();
    const aTeam = `${a.flag} ${a.name}`.trim();
    const hRep = rep(hFans);
    const aRep = rep(aFans);
    const ts = new Date(m.utcDate).getTime();

    if (m.status === "FINISHED") {
      const hg = m.score.fullTime.home ?? 0;
      const ag = m.score.fullTime.away ?? 0;
      const score = `${hg}-${ag}`;
      let text: string;
      if (hg > ag) text = `🔥 ${hRep} earns bragging rights — ${hTeam} beat ${aRep}'s ${aTeam} ${score}!`;
      else if (ag > hg) text = `🔥 ${aRep} earns bragging rights — ${aTeam} beat ${hRep}'s ${hTeam} ${score}!`;
      else text = `🤝 Honours even! ${hRep}'s ${hTeam} and ${aRep}'s ${aTeam} draw ${score}.`;
      out.push({ key: `riv-${m.id}`, text, tone: "rivalry", ts });
    } else {
      out.push({
        key: `riv-${m.id}`,
        tone: "rivalry",
        ts,
        text: `🔥 RIVALRY! ${hRep}'s ${hTeam} take on ${aRep}'s ${aTeam} — bragging rights on the line!`,
      });
    }
  }
  return out.sort((a, b) => b.ts - a.ts);
}

function teamMeta(teamId: string) {
  const t = TEAMS.find((x) => x.id === teamId);
  return { name: t?.name ?? teamId, flag: t?.flag ?? "" };
}

// Latest finished result for a team, identified by its tla/id in the fixtures.
function latestResult(teamId: string, fixtures: Fixture[]): Result {
  const played = fixtures
    .filter(
      (m) =>
        m.status === "FINISHED" &&
        (m.homeTeam.tla === teamId || m.awayTeam.tla === teamId)
    )
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime());

  const m = played[0];
  if (!m) return null;

  const isHome = m.homeTeam.tla === teamId;
  const won =
    m.score.winner === (isHome ? "HOME_TEAM" : "AWAY_TEAM");
  const lost =
    m.score.winner === (isHome ? "AWAY_TEAM" : "HOME_TEAM");
  const knockout = KNOCKOUT_STAGES.has(m.stage);

  if (won && m.stage === "FINAL") return "champion";
  if (won) return "won";
  if (lost && knockout) return "out";
  if (lost) return "lost";
  return null;
}

function buildHeadline(s: RecentSupporter, fixtures: Fixture[]): Headline {
  const { name, flag } = teamMeta(s.teamId);
  const team = `${flag} ${name}`.trim();
  const result = latestResult(s.teamId, fixtures);

  const pick = (arr: string[]) => arr[hash(s.name + s.teamId) % arr.length];

  if (result === "champion") {
    return {
      key: s.name, ts: s.ts, tone: "win",
      text: pick([
        `🏆 ${s.name} called it! ${team} are WORLD CHAMPIONS!`,
        `🏆 Dreams come true for ${s.name} — ${team} lift the trophy!`,
      ]),
    };
  }
  if (result === "won") {
    return {
      key: s.name, ts: s.ts, tone: "win",
      text: pick([
        `🎉 ${s.name}'s ${team} are flying — they WON their latest match!`,
        `🔥 Great call ${s.name}! ${team} march on with a win!`,
        `🎉 ${s.name} is celebrating — ${team} get the job done!`,
      ]),
    };
  }
  if (result === "out") {
    return {
      key: s.name, ts: s.ts, tone: "out",
      text: pick([
        `💔 Heartbreak for ${s.name} — ${team} have been KNOCKED OUT!`,
        `💔 ${s.name}'s World Cup ends here: ${team} are eliminated!`,
        `😞 Tough day for ${s.name} — ${team} crash out of the tournament!`,
      ]),
    };
  }
  if (result === "lost") {
    return {
      key: s.name, ts: s.ts, tone: "out",
      text: pick([
        `😬 ${s.name}'s ${team} slipped up — a defeat in their latest match.`,
        `😬 Not ideal for ${s.name}: ${team} lost their last game, but they fight on.`,
      ]),
    };
  }
  return {
    key: s.name, ts: s.ts, tone: "join",
    text: pick([
      `🎙️ ${s.name} has joined the action, backing ${team}!`,
      `🙌 Welcome ${s.name} — throwing their weight behind ${team}!`,
      `🎙️ ${s.name} is all in for ${team}. Let's see how they fare!`,
    ]),
  };
}

// Stable small hash so a given supporter always gets the same template.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const TONE_COLOR: Record<Headline["tone"], string> = {
  join: "text-emerald-300",
  win: "text-yellow-300",
  out: "text-red-300",
  rivalry: "text-orange-300",
};

export default function Headlines() {
  const [recent, setRecent] = useState<RecentSupporter[]>([]);
  const [byTeam, setByTeam] = useState<Record<string, string[]>>({});
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = () => {
      Promise.all([
        fetch("/api/supporters", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/fixtures", { cache: "no-store" }).then((r) => r.json()),
      ])
        .then(([sup, fix]) => {
          setRecent(sup.recent ?? []);
          setByTeam(sup.supporters ?? {});
          setFixtures(fix.matches ?? []);
        })
        .catch(() => {})
        .finally(() => setLoaded(true));
    };
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  const fanHeadlines = recent.map((s) => buildHeadline(s, fixtures));
  const rivalries = buildRivalries(fixtures, byTeam);
  const headlines = [...rivalries, ...fanHeadlines].slice(0, 25);

  if (!loaded) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-900 to-green-800 rounded-2xl shadow-sm overflow-hidden mb-6">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10">
        <span className="text-lg">🎙️</span>
        <span className="font-black text-white text-sm uppercase tracking-wider">
          From the Stands
        </span>
        <span className="flex items-center gap-1 ml-auto text-[10px] font-bold text-white bg-red-500 rounded-full px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
        </span>
      </div>

      {headlines.length === 0 ? (
        <p className="px-4 py-4 text-sm text-emerald-100/90">
          No fans yet — pick your team and you&apos;ll be the first headline!
          We&apos;ll call out every fan who joins, and when their team wins or crashes out. ⚽
        </p>
      ) : (
        <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
          {headlines.map((h) => (
            <div key={h.key} className="flex items-center gap-3 px-4 py-3">
              <p className={`text-sm font-medium leading-snug flex-1 ${TONE_COLOR[h.tone]}`}>
                {h.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
