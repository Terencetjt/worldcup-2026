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

function teamFlag(teamId: string | null) {
  if (!teamId) return "";
  return TEAMS.find((t) => t.id === teamId)?.flag ?? "";
}

const MEDAL = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    setMe(localStorage.getItem("wc2026_name"));
    const load = () =>
      fetch("/api/leaderboard", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setRows(d.leaderboard ?? []))
        .catch(() => {})
        .finally(() => setLoaded(true));
    load();
    const id = setInterval(load, 10000);
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
