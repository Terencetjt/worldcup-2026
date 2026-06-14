"use client";
import { useEffect, useState } from "react";
import { TEAMS } from "@/lib/teams";
import { VoteData } from "@/lib/types";

interface Props {
  onTeamClick: (id: string) => void;
}

export default function VotePanel({ onTeamClick }: Props) {
  const [voteData, setVoteData] = useState<VoteData>({ votes: {}, total: 0 });
  const [myVote, setMyVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wc2026_vote");
    if (saved) setMyVote(saved);
    fetchVotes();
  }, []);

  async function fetchVotes() {
    const res = await fetch("/api/votes");
    if (res.ok) setVoteData(await res.json());
  }

  async function vote(teamId: string) {
    if (myVote || loading) return;
    setLoading(true);
    const res = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId }),
    });
    if (res.ok) {
      const data = await res.json();
      setVoteData(data);
      setMyVote(teamId);
      localStorage.setItem("wc2026_vote", teamId);
    }
    setLoading(false);
  }

  const sorted = [...TEAMS].sort(
    (a, b) => (Number(voteData.votes[b.id]) || 0) - (Number(voteData.votes[a.id]) || 0)
  );
  const top = sorted.slice(0, 10);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-1">Who will win?</h2>
      <p className="text-sm text-gray-500 mb-4">
        {myVote ? "You voted — see how others voted below" : "Cast your vote for the 2026 champion"}
      </p>

      {!myVote ? (
        <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1">
          {TEAMS.map((team) => (
            <button
              key={team.id}
              onClick={() => vote(team.id)}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-50 hover:bg-green-50 hover:text-green-700 transition-all text-gray-700 disabled:opacity-50"
            >
              <span className="text-lg leading-none">{team.flag}</span>
              <span className="truncate">{team.name}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {top.map((team, i) => {
            const count = Number(voteData.votes[team.id]) || 0;
            const pct = voteData.total > 0 ? (count / voteData.total) * 100 : 0;
            return (
              <button
                key={team.id}
                onClick={() => onTeamClick(team.id)}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <span className="text-base">{team.flag}</span>
                    <span
                      className={`text-sm font-medium ${
                        myVote === team.id ? "text-green-600" : "text-gray-700"
                      }`}
                    >
                      {team.name}
                    </span>
                    {myVote === team.id && (
                      <span className="text-xs bg-green-100 text-green-700 rounded px-1.5">
                        your vote
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{pct.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
          <p className="text-xs text-gray-400 text-center pt-1">
            {voteData.total.toLocaleString()} total votes
          </p>
        </div>
      )}
    </div>
  );
}
