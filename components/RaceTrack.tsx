"use client";
import { TEAMS, getTeamColor } from "@/lib/teams";
import { STAGE_POSITION, TournamentStage } from "@/lib/types";

interface Props {
  onTeamClick: (id: string) => void;
  supportedTeam: string | null;
}

const STAGES: { key: TournamentStage; label: string; x: number }[] = [
  { key: "group", label: "Group Stage", x: 8 },
  { key: "round_of_32", label: "R32", x: 22 },
  { key: "round_of_16", label: "R16", x: 38 },
  { key: "quarter_final", label: "QF", x: 54 },
  { key: "semi_final", label: "SF", x: 70 },
  { key: "final", label: "Final", x: 84 },
  { key: "champion", label: "🏆", x: 95 },
];

const TEAM_ROWS = 48;
const SVG_HEIGHT = TEAM_ROWS * 20 + 80;

export default function RaceTrack({ onTeamClick, supportedTeam }: Props) {
  const sorted = [...TEAMS].sort((a, b) => {
    const diff = STAGE_POSITION[b.stage] - STAGE_POSITION[a.stage];
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Race to the Final</h2>
        <p className="text-sm text-gray-500">Teams progress as they advance through the tournament</p>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 100 ${SVG_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: "100%", minWidth: 600, height: SVG_HEIGHT }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Pitch background */}
          <rect x="0" y="0" width="100" height={SVG_HEIGHT} fill="#2d7a3a" />

          {/* Pitch markings */}
          <rect x="0.5" y="0.5" width="99" height={SVG_HEIGHT - 1} fill="none" stroke="#4a9e58" strokeWidth="0.3" />
          <line x1="50" y1="0" x2="50" y2={SVG_HEIGHT} stroke="#4a9e58" strokeWidth="0.3" />
          {/* Center circle */}
          <circle cx="50" cy={SVG_HEIGHT / 2} r="8" fill="none" stroke="#4a9e58" strokeWidth="0.3" />
          {/* Penalty areas */}
          <rect x="0.5" y={SVG_HEIGHT / 2 - 12} width="12" height="24" fill="none" stroke="#4a9e58" strokeWidth="0.3" />
          <rect x="87.5" y={SVG_HEIGHT / 2 - 12} width="12" height="24" fill="none" stroke="#4a9e58" strokeWidth="0.3" />

          {/* Stage markers */}
          {STAGES.map((s) => (
            <g key={s.key}>
              <line x1={s.x} y1="5" x2={s.x} y2={SVG_HEIGHT - 5} stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" strokeDasharray="1,1" />
              <text x={s.x} y="4" textAnchor="middle" fontSize="2.5" fill="rgba(255,255,255,0.7)" fontWeight="bold">
                {s.label}
              </text>
            </g>
          ))}

          {/* Teams */}
          {sorted.map((team, i) => {
            const stageData = STAGES.find((s) => s.key === team.stage) ?? STAGES[0];
            const y = 12 + i * 20;
            const color = getTeamColor(team.id);
            const isSupported = supportedTeam === team.id;

            return (
              <g
                key={team.id}
                onClick={() => onTeamClick(team.id)}
                style={{ cursor: "pointer" }}
              >
                {/* Track lane */}
                <rect
                  x="1"
                  y={y - 7}
                  width="98"
                  height="14"
                  rx="2"
                  fill={isSupported ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}
                />

                {/* Progress bar */}
                <rect
                  x="1"
                  y={y - 7}
                  width={stageData.x - 1}
                  height="14"
                  rx="2"
                  fill={team.eliminated ? "rgba(100,100,100,0.4)" : `${color}99`}
                />

                {/* Team racer */}
                <circle
                  cx={stageData.x}
                  cy={y}
                  r={isSupported ? 7 : 5.5}
                  fill={team.eliminated ? "#666" : color}
                  stroke={isSupported ? "#FFD700" : "rgba(255,255,255,0.6)"}
                  strokeWidth={isSupported ? 1.2 : 0.6}
                />

                {/* Flag emoji */}
                <text x={stageData.x} y={y + 2} textAnchor="middle" fontSize={isSupported ? 6 : 5} dominantBaseline="middle">
                  {team.flag}
                </text>

                {/* Team name label */}
                <text
                  x={stageData.x + 8}
                  y={y + 1}
                  fontSize="3"
                  fill={isSupported ? "#FFD700" : "rgba(255,255,255,0.85)"}
                  fontWeight={isSupported ? "bold" : "normal"}
                  dominantBaseline="middle"
                >
                  {team.name}
                </text>

                {/* Eliminated X */}
                {team.eliminated && (
                  <text x={stageData.x} y={y + 1} textAnchor="middle" fontSize="4" fill="rgba(255,80,80,0.9)" dominantBaseline="middle">
                    ✕
                  </text>
                )}
              </g>
            );
          })}

          {/* Goal post (finish line) */}
          <rect x="95" y="0" width="0.5" height={SVG_HEIGHT} fill="rgba(255,255,255,0.5)" />
          <text x="97" y={SVG_HEIGHT / 2} textAnchor="middle" fontSize="5" fill="rgba(255,255,255,0.6)" transform={`rotate(-90, 97, ${SVG_HEIGHT / 2})`}>
            FINISH
          </text>
        </svg>
      </div>

      <div className="p-4 border-t border-gray-100 flex items-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-yellow-400" />
          <span>Your team</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span>Eliminated</span>
        </div>
        <span>Click any team for details</span>
      </div>
    </div>
  );
}
