"use client";
import { useEffect, useState } from "react";
import { Fixture } from "@/lib/types";
import PredictionRow from "./PredictionRow";

interface Props {
  onTeamClick: (tla: string) => void;
}

function isPredictable(m: Fixture): boolean {
  return (m.status === "SCHEDULED" || m.status === "TIMED") &&
    new Date(m.utcDate).getTime() > Date.now();
}

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Upcoming",
  TIMED: "Upcoming",
  LIVE: "LIVE",
  IN_PLAY: "LIVE",
  PAUSED: "HT",
  FINISHED: "FT",
  POSTPONED: "Postponed",
  SUSPENDED: "Suspended",
  CANCELLED: "Cancelled",
};

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: "bg-gray-100 text-gray-600",
  TIMED: "bg-gray-100 text-gray-600",
  LIVE: "bg-red-500 text-white animate-pulse",
  IN_PLAY: "bg-red-500 text-white animate-pulse",
  PAUSED: "bg-amber-400 text-white",
  FINISHED: "bg-gray-200 text-gray-600",
  POSTPONED: "bg-amber-100 text-amber-700",
  SUSPENDED: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-gray-200 text-gray-400",
};

const UPCOMING = new Set(["SCHEDULED", "TIMED"]);

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function Fixtures({ onTeamClick }: Props) {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "live" | "finished">("all");
  const [fanName, setFanName] = useState<string | null>(null);
  const [myPredictions, setMyPredictions] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/fixtures")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setFixtures(d.matches ?? []);
      })
      .catch(() => setError("Failed to load fixtures"))
      .finally(() => setLoading(false));

    const name = localStorage.getItem("wc2026_name");
    setFanName(name);
    if (name) {
      fetch(`/api/predictions?name=${encodeURIComponent(name)}`)
        .then((r) => r.json())
        .then((d) => setMyPredictions(d.predictions ?? {}))
        .catch(() => {});
    }
  }, []);

  const now = Date.now();
  const filtered = fixtures
    .filter((f) => {
      const isFuture = new Date(f.utcDate).getTime() >= now;
      if (filter === "upcoming") return UPCOMING.has(f.status) && isFuture;
      if (filter === "live") return f.status === "LIVE" || f.status === "IN_PLAY" || f.status === "PAUSED";
      if (filter === "finished") return f.status === "FINISHED";
      return true;
    })
    .sort((a, b) => {
      const ta = new Date(a.utcDate).getTime();
      const tb = new Date(b.utcDate).getTime();
      // Finished matches read best most-recent-first; everything else soonest-first.
      return filter === "finished" ? tb - ta : ta - tb;
    });

  const grouped = filtered.reduce<Record<string, Fixture[]>>((acc, f) => {
    const key = formatDate(f.utcDate);
    (acc[key] ??= []).push(f);
    return acc;
  }, {});

  if (loading) return <FixturesSkeleton />;
  if (error)
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-3">⚽</p>
        <p className="font-medium">{error}</p>
        <p className="text-sm mt-1">Check your FOOTBALL_DATA_TOKEN environment variable</p>
      </div>
    );

  return (
    <div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(["all", "live", "upcoming", "finished"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === f
                ? "bg-green-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "all" ? "All" : f === "live" ? "🔴 Live" : f === "upcoming" ? "Upcoming" : "Finished"}
          </button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="text-center text-gray-400 py-12">No matches found</p>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, matches]) => (
          <div key={date}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 sticky top-0 bg-gray-50 py-1">
              {date}
            </h3>
            <div className="space-y-2">
              {matches.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">
                      {m.group ? `Group ${m.group.replace("GROUP_", "")}` : m.stage.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        STATUS_COLOR[m.status] ?? STATUS_COLOR.SCHEDULED
                      }`}
                    >
                      {STATUS_LABEL[m.status] ?? m.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => onTeamClick(m.homeTeam.tla)}
                      className="flex-1 flex flex-col items-center gap-1 group"
                    >
                      <img
                        src={m.homeTeam.crest}
                        alt={m.homeTeam.name}
                        className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <span className="text-sm font-semibold text-gray-800 text-center leading-tight">
                        {m.homeTeam.shortName || m.homeTeam.name}
                      </span>
                    </button>

                    <div className="flex flex-col items-center min-w-[70px]">
                      {m.status === "FINISHED" || m.status === "IN_PLAY" || m.status === "PAUSED" ? (
                        <span className="text-2xl font-black text-gray-800">
                          {m.score.fullTime.home ?? 0} – {m.score.fullTime.away ?? 0}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-gray-400">
                          {formatTime(m.utcDate)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onTeamClick(m.awayTeam.tla)}
                      className="flex-1 flex flex-col items-center gap-1 group"
                    >
                      <img
                        src={m.awayTeam.crest}
                        alt={m.awayTeam.name}
                        className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <span className="text-sm font-semibold text-gray-800 text-center leading-tight">
                        {m.awayTeam.shortName || m.awayTeam.name}
                      </span>
                    </button>
                  </div>

                  {isPredictable(m) && (
                    <PredictionRow
                      matchId={m.id}
                      fanName={fanName}
                      initial={myPredictions[String(m.id)]}
                      homeName={m.homeTeam.shortName || m.homeTeam.name}
                      awayName={m.awayTeam.shortName || m.awayTeam.name}
                    />
                  )}

                  {m.status === "FINISHED" && myPredictions[String(m.id)] && (
                    <PredictionResult pred={myPredictions[String(m.id)]} match={m} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PredictionResult({ pred, match }: { pred: string; match: Fixture }) {
  const [ph, pa] = pred.split("-").map(Number);
  const aH = match.score.fullTime.home ?? 0;
  const aA = match.score.fullTime.away ?? 0;
  const out = (h: number, a: number) => (h > a ? "H" : h < a ? "A" : "D");
  const exact = ph === aH && pa === aA;
  const winner = out(ph, pa) === out(aH, aA);
  const points = exact ? 10 : winner ? 5 : 0;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-xs">
      <span className="text-gray-400">Your pick</span>
      <span className="font-bold text-gray-700">{ph}–{pa}</span>
      <span
        className={`font-bold px-2 py-0.5 rounded-full ${
          points > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
        }`}
      >
        {points > 0 ? `+${points} ${exact ? "exact!" : "winner"}` : "no points"}
      </span>
    </div>
  );
}

function FixturesSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 h-24" />
      ))}
    </div>
  );
}
