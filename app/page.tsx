"use client";
import { useEffect, useState } from "react";
import Fixtures from "@/components/Fixtures";
import RaceTrack from "@/components/RaceTrack";
import TeamSelector from "@/components/TeamSelector";
import VotePanel from "@/components/VotePanel";
import TeamDetail from "@/components/TeamDetail";
import { TEAMS } from "@/lib/teams";
import { VoteData } from "@/lib/types";

type Tab = "fixtures" | "race";

export default function Home() {
  const [tab, setTab] = useState<Tab>("fixtures");
  const [supportedTeam, setSupportedTeam] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [voteData, setVoteData] = useState<VoteData>({ votes: {}, total: 0 });

  useEffect(() => {
    const saved = localStorage.getItem("wc2026_support");
    if (saved) setSupportedTeam(saved);
    fetch("/api/votes")
      .then((r) => r.json())
      .then((d) => setVoteData(d))
      .catch(() => {});
  }, []);

  function selectTeam(id: string) {
    setSupportedTeam(id);
    localStorage.setItem("wc2026_support", id);
    setShowSelector(false);
  }

  const supported = TEAMS.find((t) => t.id === supportedTeam);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            <div>
              <h1 className="font-black text-gray-900 leading-tight text-lg">World Cup 2026</h1>
              <p className="text-xs text-gray-500 leading-tight">USA · Canada · Mexico</p>
            </div>
          </div>

          <button
            onClick={() => setShowSelector(!showSelector)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              supported
                ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {supported ? (
              <>
                <span className="text-base">{supported.flag}</span>
                <span>{supported.name}</span>
              </>
            ) : (
              "Pick your team"
            )}
          </button>
        </div>
      </header>

      {/* Team selector dropdown */}
      {showSelector && (
        <div className="fixed inset-0 z-40 flex" onClick={() => setShowSelector(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative ml-auto bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Choose your team</h2>
              <button onClick={() => setShowSelector(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <TeamSelector supportedTeam={supportedTeam} onSelect={selectTeam} />
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6 w-fit">
          {(["fixtures", "race"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {t === "fixtures" ? "📅 Fixtures" : "🏁 Race to the Final"}
            </button>
          ))}
        </div>

        {tab === "fixtures" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Fixtures onTeamClick={setSelectedTeam} />
            </div>
            <div className="space-y-4">
              <VotePanel onTeamClick={setSelectedTeam} />
            </div>
          </div>
        )}

        {tab === "race" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RaceTrack onTeamClick={setSelectedTeam} supportedTeam={supportedTeam} />
            </div>
            <div className="space-y-4">
              <VotePanel onTeamClick={setSelectedTeam} />
            </div>
          </div>
        )}
      </main>

      {/* Team detail modal */}
      {selectedTeam && (
        <TeamDetail
          teamId={selectedTeam}
          onClose={() => setSelectedTeam(null)}
          voteData={voteData}
        />
      )}
    </div>
  );
}
