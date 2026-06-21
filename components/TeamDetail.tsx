"use client";
import { useEffect, useState } from "react";
import { TEAMS, getTeamColor } from "@/lib/teams";
import { Fixture, STAGE_LABEL, VoteData } from "@/lib/types";
import PredictionRow from "./PredictionRow";

interface Props {
  teamId: string;
  onClose: () => void;
  voteData: VoteData;
}

function isPredictable(m: Fixture): boolean {
  return (m.status === "SCHEDULED" || m.status === "TIMED") &&
    new Date(m.utcDate).getTime() > Date.now();
}

export default function TeamDetail({ teamId, onClose, voteData }: Props) {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [fans, setFans] = useState<string[]>([]);
  const [fanName, setFanName] = useState<string | null>(null);
  const [myTeam, setMyTeam] = useState<string | null>(null);
  const [myPredictions, setMyPredictions] = useState<Record<string, string>>({});

  const team = TEAMS.find((t) => t.id === teamId);
  const color = getTeamColor(teamId);
  const voteCount = Number(voteData.votes[teamId]) || 0;
  const votePct = voteData.total > 0 ? (voteCount / voteData.total) * 100 : 0;

  useEffect(() => {
    fetch(`/api/fixtures?team=${teamId}`)
      .then((r) => r.json())
      .then((d) => setFixtures(d.matches ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/supporters")
      .then((r) => r.json())
      .then((d) => setFans(d.supporters?.[teamId] ?? []))
      .catch(() => {});

    const name = localStorage.getItem("wc2026_name");
    setFanName(name);
    setMyTeam(localStorage.getItem("wc2026_support"));
    if (name) {
      fetch(`/api/predictions?name=${encodeURIComponent(name)}`)
        .then((r) => r.json())
        .then((d) => setMyPredictions(d.predictions ?? {}))
        .catch(() => {});
    }
  }, [teamId]);

  if (!team) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-6 text-white rounded-t-3xl sm:rounded-t-2xl"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm opacity-80">Group {team.group}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-5xl">{team.flag}</span>
                <div>
                  <h2 className="text-2xl font-black">{team.name}</h2>
                  <span className="text-sm opacity-80">{STAGE_LABEL[team.stage]}</span>
                  {team.eliminated && (
                    <span className="ml-2 text-xs bg-red-500/30 rounded-full px-2 py-0.5">
                      Eliminated
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* Vote stat */}
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs opacity-70 mb-1">Fans backing them to survive</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${votePct}%` }}
                />
              </div>
              <span className="text-lg font-black">{votePct.toFixed(1)}%</span>
            </div>
            <p className="text-xs opacity-60 mt-1">
              {voteCount.toLocaleString()} fans don&apos;t want to see them eliminated
            </p>
          </div>
        </div>

        {/* Supporters */}
        <div className="px-6 pt-6">
          <h3 className="font-bold text-gray-800 mb-3">
            Supporters{fans.length > 0 && ` (${fans.length})`}
          </h3>
          {fans.length === 0 ? (
            <p className="text-sm text-gray-400">
              No one&apos;s backing them yet — pick this team to be the first.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {fans.map((name) => (
                <span
                  key={name}
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: `${color}1a`, color }}
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Fixtures */}
        <div className="p-6">
          <h3 className="font-bold text-gray-800 mb-4">Fixtures</h3>
          {loading ? (
            <div className="space-y-2 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : fixtures.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No fixtures found</p>
          ) : (
            <div className="space-y-2">
              {fixtures.map((m) => {
                const isHome = m.homeTeam.tla === teamId;
                const opponent = isHome ? m.awayTeam : m.homeTeam;
                const finished = m.status === "FINISHED";
                const myScore = isHome ? m.score.fullTime.home : m.score.fullTime.away;
                const oppScore = isHome ? m.score.fullTime.away : m.score.fullTime.home;
                const won = finished && myScore !== null && oppScore !== null && myScore > oppScore;
                const lost = finished && myScore !== null && oppScore !== null && myScore < oppScore;

                return (
                  <div
                    key={m.id}
                    className={`rounded-xl border p-3 ${
                      won
                        ? "border-green-200 bg-green-50"
                        : lost
                        ? "border-red-100 bg-red-50"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={opponent.crest}
                          alt={opponent.name}
                          className="w-7 h-7 object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            vs {opponent.shortName || opponent.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(m.utcDate).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                            {" · "}
                            {m.group
                              ? `Group ${m.group.replace("GROUP_", "")}`
                              : m.stage.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {finished ? (
                          <span
                            className={`text-lg font-black ${
                              won ? "text-green-600" : lost ? "text-red-500" : "text-gray-700"
                            }`}
                          >
                            {myScore} – {oppScore}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
                            {m.status === "SCHEDULED" || m.status === "TIMED"
                              ? new Date(m.utcDate).toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "LIVE"}
                          </span>
                        )}
                      </div>
                    </div>

                    {isPredictable(m) &&
                      myTeam != null &&
                      (m.homeTeam.tla === myTeam || m.awayTeam.tla === myTeam) && (
                        <>
                          <p className="text-[11px] text-gray-400 mt-2 text-center">
                            {teamId === myTeam
                              ? "Vote for your team — pick a winning scoreline 💪"
                              : "Vote against this rival — back your team's scoreline 🔥"}
                          </p>
                          <PredictionRow
                            matchId={m.id}
                            fanName={fanName}
                            initial={myPredictions[String(m.id)]}
                            homeName={m.homeTeam.shortName || m.homeTeam.name}
                            awayName={m.awayTeam.shortName || m.awayTeam.name}
                          />
                        </>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
