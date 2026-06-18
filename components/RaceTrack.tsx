"use client";
import { useEffect, useMemo, useState } from "react";
import { TEAMS, getTeamColor, getStarPlayer } from "@/lib/teams";
import { TournamentStage } from "@/lib/types";
import PlayerRacer from "./PlayerRacer";

interface Props {
  onTeamClick: (id: string) => void;
  supportedTeam: string | null;
}

const STAGES: { key: TournamentStage; label: string }[] = [
  { key: "group", label: "Start" },
  { key: "round_of_32", label: "R32" },
  { key: "round_of_16", label: "R16" },
  { key: "quarter_final", label: "QF" },
  { key: "semi_final", label: "SF" },
  { key: "final", label: "Final" },
  { key: "champion", label: "🏆" },
];

// Horizontal % position of each racer along the lane, per stage.
const STAGE_X: Record<TournamentStage, number> = {
  group: 6,
  round_of_32: 22,
  round_of_16: 38,
  quarter_final: 54,
  semi_final: 70,
  final: 84,
  champion: 94,
};

// Player figure width (px) scales between these bounds by vote count.
// Wide range so vote differences are clearly visible.
const MIN_SIZE = 24;
const MAX_SIZE = 92;

const laneBg =
  "repeating-linear-gradient(to right, transparent, transparent calc(22% - 1px), rgba(255,255,255,0.12) 22%, transparent calc(22% + 1px))";

export default function RaceTrack({ onTeamClick, supportedTeam }: Props) {
  const [supporters, setSupporters] = useState<Record<string, string[]>>({});
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = () => {
      fetch("/api/supporters", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setSupporters(d.supporters ?? {}))
        .catch(() => {});
      fetch("/api/votes", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setVotes(d.votes ?? {}))
        .catch(() => {});
    };
    load();
    // Keep the track in sync with everyone else's votes.
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, []);

  const voteCount = (id: string) => Number(votes[id]) || 0;

  // Only nations with at least one vote appear on the track.
  const votedTeams = useMemo(
    () => TEAMS.filter((t) => voteCount(t.id) > 0),
    [votes] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const maxVotes = useMemo(
    () => Math.max(1, ...votedTeams.map((t) => voteCount(t.id))),
    [votedTeams] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const sizeFor = (id: string) =>
    Math.round(MIN_SIZE + (voteCount(id) / maxVotes) * (MAX_SIZE - MIN_SIZE));

  const groups = useMemo(
    () => [...new Set(votedTeams.map((t) => t.group))].sort(),
    [votedTeams]
  );

  const q = search.trim().toLowerCase();
  const matches = (id: string) =>
    !q || TEAMS.find((t) => t.id === id)?.name.toLowerCase().includes(q);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Race to the Final</h2>
          <p className="text-sm text-gray-500">
            Each nation runs as its star player — bigger means more votes
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search a nation…"
          className="px-3 py-2 rounded-lg bg-gray-100 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 w-full sm:w-56"
        />
      </div>

      {/* Pitch */}
      <div className="overflow-x-auto" style={{ background: "#1f7a34" }}>
        <div style={{ minWidth: 760 }}>
          {/* Stage header */}
          <div className="flex sticky top-0 z-10" style={{ background: "#1a6b2d" }}>
            <div className="w-44 shrink-0 border-r border-white/10" />
            <div className="flex-1 relative h-9">
              {STAGES.map((s) => (
                <span
                  key={s.key}
                  className="absolute text-[11px] font-bold uppercase tracking-wider text-white/70 -translate-x-1/2"
                  style={{ left: `${STAGE_X[s.key]}%`, top: 10 }}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {votedTeams.length === 0 ? (
            <div className="py-16 text-center text-white/70 text-sm">
              No votes yet — nations appear here once fans start voting.
            </div>
          ) : (
            groups.map((g) => {
              const teamsInGroup = votedTeams
                .filter((t) => t.group === g)
                .sort((a, b) => voteCount(b.id) - voteCount(a.id));
              return (
                <div key={g}>
                  <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 bg-black/15">
                    Group {g}
                  </div>
                  {teamsInGroup.map((team) => {
                    const x = STAGE_X[team.stage];
                    const color = getTeamColor(team.id);
                    const isSupported = supportedTeam === team.id;
                    const fans = supporters[team.id] ?? [];
                    const dim = !matches(team.id);
                    const size = sizeFor(team.id);
                    const player = getStarPlayer(team.id);

                    return (
                      <div
                        key={team.id}
                        className="flex items-stretch border-b border-white/5 transition-opacity"
                        style={{ opacity: dim ? 0.25 : 1 }}
                      >
                        {/* Left card */}
                        <button
                          onClick={() => onTeamClick(team.id)}
                          className={`w-44 shrink-0 flex items-center gap-2 px-3 py-3 text-left border-r border-white/10 transition-colors ${
                            isSupported ? "bg-yellow-400/20" : "hover:bg-white/5"
                          }`}
                        >
                          <span className="text-lg leading-none">{team.flag}</span>
                          <span className="min-w-0">
                            <span
                              className={`block text-sm font-bold truncate ${
                                isSupported ? "text-yellow-300" : "text-white"
                              }`}
                            >
                              {team.name}
                            </span>
                            <span className="block text-[10px] text-white/50 truncate">
                              {player}
                            </span>
                          </span>
                          <span className="ml-auto text-[10px] font-bold text-white/70 whitespace-nowrap">
                            {voteCount(team.id)}
                          </span>
                        </button>

                        {/* Lane */}
                        <div
                          className="flex-1 relative min-h-[140px] cursor-pointer"
                          style={{ background: laneBg }}
                          onClick={() => onTeamClick(team.id)}
                        >
                          {/* Finish checker */}
                          <div
                            className="absolute top-0 bottom-0 w-2"
                            style={{
                              right: 0,
                              backgroundImage:
                                "repeating-conic-gradient(#fff 0% 25%, #000 0% 50%)",
                              backgroundSize: "8px 8px",
                              opacity: 0.6,
                            }}
                          />

                          {/* Progress trail */}
                          <div
                            className="absolute top-1/2 h-1.5 rounded-full -translate-y-1/2"
                            style={{
                              left: 4,
                              width: `calc(${x}% - 4px)`,
                              background: team.eliminated
                                ? "rgba(120,120,120,0.5)"
                                : `${color}aa`,
                            }}
                          />

                          {/* Racer = star player, sized by votes */}
                          <div
                            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                            style={{ left: `${x}%` }}
                          >
                            {/* Supporter header */}
                            {fans.length > 0 && (
                              <div className="mb-1 px-2 py-0.5 rounded-full bg-black/75 text-white text-[10px] font-semibold whitespace-nowrap max-w-[160px] truncate">
                                {fans.slice(0, 2).join(", ")}
                                {fans.length > 2 && ` +${fans.length - 2}`}
                              </div>
                            )}
                            <div
                              className="shrink-0"
                              title={`${player} · ${voteCount(team.id)} votes`}
                              style={{
                                filter: isSupported
                                  ? "drop-shadow(0 0 4px #FFD700)"
                                  : "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
                              }}
                            >
                              <PlayerRacer
                                teamId={team.id}
                                size={size}
                                eliminated={team.eliminated}
                                supported={isSupported}
                              />
                            </div>
                            <span className="mt-1 text-[10px] font-semibold text-white/90 whitespace-nowrap max-w-[140px] truncate">
                              {player}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500 ring-2 ring-yellow-400" />
          Your team
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-gray-400" /> Eliminated
        </div>
        <span>Bigger player = more votes · only voted nations shown · click for details</span>
      </div>
    </div>
  );
}
