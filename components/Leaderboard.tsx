"use client";
import { useEffect, useState } from "react";
import { TEAMS } from "@/lib/teams";

interface Row {
  name: string;
  teamId: string | null;
  points: number;
  correct: number;
  exact: number;
}

interface Pick {
  name: string;
  teamId: string | null;
  home: string;
  away: string;
  ph: number;
  pa: number;
  status: string;
}

function teamFlag(teamId: string | null) {
  if (!teamId) return "";
  return TEAMS.find((t) => t.id === teamId)?.flag ?? "";
}

function flagByTla(tla: string) {
  return TEAMS.find((t) => t.id === tla)?.flag ?? "";
}

const MEDAL = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    setMe(localStorage.getItem("wc2026_name"));
    const load = () =>
      fetch("/api/leaderboard", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          setRows(d.leaderboard ?? []);
          setPicks(d.picks ?? []);
        })
        .catch(() => {})
        .finally(() => setLoaded(true));
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-1">🏆 Prediction Leaderboard</h2>
        <p className="text-sm text-gray-500">Who has the best World Cup knowledge?</p>

        {!loaded ? (
          <div className="space-y-2 mt-4 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No predictions scored yet — predict some match scores in the Fixtures tab!
          </p>
        ) : (
          <div className="mt-4 space-y-1.5">
            {rows.map((r, i) => {
              const isMe = me === r.name;
              return (
                <div
                  key={r.name}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                    isMe ? "bg-green-50 ring-1 ring-green-200" : i < 3 ? "bg-amber-50" : "bg-gray-50"
                  }`}
                >
                  <span className="w-7 text-center font-bold text-gray-500 text-sm">
                    {MEDAL[i] ?? i + 1}
                  </span>
                  <span className="text-lg">{teamFlag(r.teamId)}</span>
                  <span className={`font-semibold text-sm flex-1 truncate ${isMe ? "text-green-700" : "text-gray-800"}`}>
                    {r.name}
                    {isMe && <span className="ml-1.5 text-xs text-green-600">(you)</span>}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {r.exact}× exact · {r.correct}× winner
                  </span>
                  <span className="font-black text-gray-900 text-lg w-12 text-right">{r.points}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Score picks callout */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 mb-1 text-sm">🎙️ The calls fans are making</h3>
        <p className="text-xs text-gray-400 mb-3">Every scoreline picked, for or against their rivals</p>
        {picks.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No picks yet — click your team on the Race tab to vote a scoreline.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {picks.map((p, i) => {
              const backsHome = p.teamId === p.home;
              const myGoals = backsHome ? p.ph : p.pa;
              const oppGoals = backsHome ? p.pa : p.ph;
              const stance =
                p.teamId && (p.teamId === p.home || p.teamId === p.away)
                  ? myGoals > oppGoals
                    ? { label: "FOR", cls: "bg-green-100 text-green-700" }
                    : myGoals < oppGoals
                    ? { label: "AGAINST", cls: "bg-red-100 text-red-600" }
                    : { label: "DRAW", cls: "bg-gray-100 text-gray-500" }
                  : null;
              return (
                <div
                  key={`${p.name}-${p.home}-${p.away}-${i}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                    me === p.name ? "bg-green-50" : "bg-gray-50"
                  }`}
                >
                  <span className="font-semibold text-gray-800 truncate max-w-[90px]">{p.name}</span>
                  <span className="text-gray-400 text-xs">picks</span>
                  <span className="font-bold text-gray-700 whitespace-nowrap">
                    {flagByTla(p.home)} {p.ph}–{p.pa} {flagByTla(p.away)}
                  </span>
                  {stance && (
                    <span className={`ml-auto text-[10px] font-bold rounded-full px-2 py-0.5 ${stance.cls}`}>
                      {stance.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scoring rules */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 mb-3 text-sm">How scoring works</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex justify-between"><span>Correct winner (wrong score)</span><span className="font-bold text-green-600">+5</span></li>
          <li className="flex justify-between"><span>Exact score</span><span className="font-bold text-green-600">+10</span></li>
          <li className="flex justify-between"><span>Rival calls your team&apos;s defeat (winner)</span><span className="font-bold text-red-500">−3</span></li>
          <li className="flex justify-between"><span>Rival calls your team&apos;s defeat (exact)</span><span className="font-bold text-red-500">−5</span></li>
        </ul>
        <p className="text-xs text-gray-400 mt-3">
          Rivals are fans of the opposing team. Your total never drops below 0.
        </p>
      </div>
    </div>
  );
}
