"use client";
import { useEffect, useState } from "react";
import Fixtures from "@/components/Fixtures";
import RaceTrack from "@/components/RaceTrack";
import TeamSelector from "@/components/TeamSelector";
import VotePanel from "@/components/VotePanel";
import TeamDetail from "@/components/TeamDetail";
import Headlines from "@/components/Headlines";
import Leaderboard from "@/components/Leaderboard";
import { TEAMS } from "@/lib/teams";
import { VoteData } from "@/lib/types";

type Tab = "fixtures" | "race" | "leaderboard";

export default function Home() {
  const [tab, setTab] = useState<Tab>("fixtures");
  const [supportedTeam, setSupportedTeam] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [voteData, setVoteData] = useState<VoteData>({ votes: {}, total: 0 });
  const [fanName, setFanName] = useState("");
  const [pendingTeam, setPendingTeam] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("wc2026_support");
    if (saved) setSupportedTeam(saved);
    const name = localStorage.getItem("wc2026_name");
    if (name) setFanName(name);
    fetch("/api/votes")
      .then((r) => r.json())
      .then((d) => setVoteData(d))
      .catch(() => {});
  }, []);

  function selectTeam(id: string) {
    setShowSelector(false);
    const name = localStorage.getItem("wc2026_name");
    if (!name) {
      // Need a display name before we can list this fan on the race track.
      setPendingTeam(id);
      return;
    }
    commitSupport(id, name);
  }

  function commitSupport(id: string, name: string) {
    setSupportedTeam(id);
    localStorage.setItem("wc2026_support", id);
    fetch("/api/supporters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, teamId: id }),
    }).catch(() => {});
  }

  function submitName() {
    const name = nameInput.trim().slice(0, 24);
    if (!name || !pendingTeam) return;
    localStorage.setItem("wc2026_name", name);
    setFanName(name);
    commitSupport(pendingTeam, name);
    setPendingTeam(null);
    setNameInput("");
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

          <div className="flex items-center gap-2">
            {fanName && (
              <span className="hidden sm:inline text-sm text-gray-500">
                Hi, <span className="font-semibold text-gray-700">{fanName}</span>
              </span>
            )}
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
        {/* Commentator headlines for knockout eliminations */}
        <Headlines />

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6 w-fit">
          {(["fixtures", "race", "leaderboard"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {t === "fixtures" ? "📅 Fixtures" : t === "race" ? "🏁 Race to the Final" : "🏆 Leaderboard"}
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

        {tab === "leaderboard" && (
          <div className="max-w-2xl">
            <Leaderboard />
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

      {/* Name prompt — lightweight identity, no login */}
      {pendingTeam && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setPendingTeam(null)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-3xl mb-2">
              {TEAMS.find((t) => t.id === pendingTeam)?.flag}
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              Back {TEAMS.find((t) => t.id === pendingTeam)?.name}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Add your name so other fans can see you supporting them on the race track.
            </p>
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitName()}
              placeholder="Your name"
              maxLength={24}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setPendingTeam(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={submitName}
                disabled={!nameInput.trim()}
                className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                Support team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
