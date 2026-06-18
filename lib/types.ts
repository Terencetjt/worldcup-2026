export interface Team {
  id: string;
  name: string;
  flag: string;
  group: string;
  stage: TournamentStage;
  eliminated: boolean;
}

export type TournamentStage =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "final"
  | "champion";

export const STAGE_POSITION: Record<TournamentStage, number> = {
  group: 1,
  round_of_32: 2,
  round_of_16: 3,
  quarter_final: 4,
  semi_final: 5,
  final: 6,
  champion: 7,
};

export const STAGE_LABEL: Record<TournamentStage, string> = {
  group: "Group Stage",
  round_of_32: "Round of 32",
  round_of_16: "Round of 16",
  quarter_final: "Quarter Final",
  semi_final: "Semi Final",
  final: "Final",
  champion: "Champion",
};

export interface Fixture {
  id: number;
  utcDate: string;
  status:
    | "SCHEDULED"
    | "TIMED"
    | "LIVE"
    | "IN_PLAY"
    | "PAUSED"
    | "FINISHED"
    | "POSTPONED"
    | "SUSPENDED"
    | "CANCELLED";
  stage: string;
  group: string | null;
  homeTeam: { name: string; shortName: string; tla: string; crest: string };
  awayTeam: { name: string; shortName: string; tla: string; crest: string };
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
}

export interface VoteData {
  votes: Record<string, number>;
  total: number;
}
