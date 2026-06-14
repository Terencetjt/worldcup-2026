"use client";
import { TEAMS } from "@/lib/teams";
import { Team } from "@/lib/types";

interface Props {
  supportedTeam: string | null;
  onSelect: (id: string) => void;
}

export default function TeamSelector({ supportedTeam, onSelect }: Props) {
  const groups = [...new Set(TEAMS.map((t) => t.group))].sort();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-1">Your Team</h2>
      <p className="text-sm text-gray-500 mb-4">Select the team you&apos;re supporting</p>
      <div className="space-y-3">
        {groups.map((g) => (
          <div key={g}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Group {g}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {TEAMS.filter((t) => t.group === g).map((team: Team) => (
                <button
                  key={team.id}
                  onClick={() => onSelect(team.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    supportedTeam === team.id
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg leading-none">{team.flag}</span>
                  <span className="truncate">{team.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
