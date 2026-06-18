import { Team } from "./types";

export const TEAMS: Team[] = [
  // Group A
  { id: "USA", name: "United States", flag: "🇺🇸", group: "A", stage: "group", eliminated: false },
  { id: "PAN", name: "Panama", flag: "🇵🇦", group: "A", stage: "group", eliminated: false },
  { id: "BOL", name: "Bolivia", flag: "🇧🇴", group: "A", stage: "group", eliminated: false },
  { id: "MAR", name: "Morocco", flag: "🇲🇦", group: "A", stage: "group", eliminated: false },
  // Group B
  { id: "ARG", name: "Argentina", flag: "🇦🇷", group: "B", stage: "group", eliminated: false },
  { id: "CAN", name: "Canada", flag: "🇨🇦", group: "B", stage: "group", eliminated: false },
  { id: "CHI", name: "Chile", flag: "🇨🇱", group: "B", stage: "group", eliminated: false },
  { id: "ALB", name: "Albania", flag: "🇦🇱", group: "B", stage: "group", eliminated: false },
  // Group C
  { id: "MEX", name: "Mexico", flag: "🇲🇽", group: "C", stage: "group", eliminated: false },
  { id: "SEN", name: "Senegal", flag: "🇸🇳", group: "C", stage: "group", eliminated: false },
  { id: "ECU", name: "Ecuador", flag: "🇪🇨", group: "C", stage: "group", eliminated: false },
  { id: "NZL", name: "New Zealand", flag: "🇳🇿", group: "C", stage: "group", eliminated: false },
  // Group D
  { id: "ESP", name: "Spain", flag: "🇪🇸", group: "D", stage: "group", eliminated: false },
  { id: "BRA", name: "Brazil", flag: "🇧🇷", group: "D", stage: "group", eliminated: false },
  { id: "JPN", name: "Japan", flag: "🇯🇵", group: "D", stage: "group", eliminated: false },
  { id: "CMR", name: "Cameroon", flag: "🇨🇲", group: "D", stage: "group", eliminated: false },
  // Group E
  { id: "FRA", name: "France", flag: "🇫🇷", group: "E", stage: "group", eliminated: false },
  { id: "EGY", name: "Egypt", flag: "🇪🇬", group: "E", stage: "group", eliminated: false },
  { id: "COL", name: "Colombia", flag: "🇨🇴", group: "E", stage: "group", eliminated: false },
  { id: "MKD", name: "North Macedonia", flag: "🇲🇰", group: "E", stage: "group", eliminated: false },
  // Group F
  { id: "ENG", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "F", stage: "group", eliminated: false },
  { id: "NED", name: "Netherlands", flag: "🇳🇱", group: "F", stage: "group", eliminated: false },
  { id: "TUN", name: "Tunisia", flag: "🇹🇳", group: "F", stage: "group", eliminated: false },
  { id: "CHN", name: "China", flag: "🇨🇳", group: "F", stage: "group", eliminated: false },
  // Group G
  { id: "GER", name: "Germany", flag: "🇩🇪", group: "G", stage: "group", eliminated: false },
  { id: "POR", name: "Portugal", flag: "🇵🇹", group: "G", stage: "group", eliminated: false },
  { id: "CRC", name: "Costa Rica", flag: "🇨🇷", group: "G", stage: "group", eliminated: false },
  { id: "AUS", name: "Australia", flag: "🇦🇺", group: "G", stage: "group", eliminated: false },
  // Group H
  { id: "URU", name: "Uruguay", flag: "🇺🇾", group: "H", stage: "group", eliminated: false },
  { id: "KOR", name: "South Korea", flag: "🇰🇷", group: "H", stage: "group", eliminated: false },
  { id: "IRQ", name: "Iraq", flag: "🇮🇶", group: "H", stage: "group", eliminated: false },
  { id: "NGA", name: "Nigeria", flag: "🇳🇬", group: "H", stage: "group", eliminated: false },
  // Group I
  { id: "ITA", name: "Italy", flag: "🇮🇹", group: "I", stage: "group", eliminated: false },
  { id: "CRO", name: "Croatia", flag: "🇭🇷", group: "I", stage: "group", eliminated: false },
  { id: "VEN", name: "Venezuela", flag: "🇻🇪", group: "I", stage: "group", eliminated: false },
  { id: "SUI", name: "Switzerland", flag: "🇨🇭", group: "I", stage: "group", eliminated: false },
  // Group J
  { id: "BEL", name: "Belgium", flag: "🇧🇪", group: "J", stage: "group", eliminated: false },
  { id: "IRN", name: "Iran", flag: "🇮🇷", group: "J", stage: "group", eliminated: false },
  { id: "PAR", name: "Paraguay", flag: "🇵🇾", group: "J", stage: "group", eliminated: false },
  { id: "THA", name: "Thailand", flag: "🇹🇭", group: "J", stage: "group", eliminated: false },
  // Group K
  { id: "POR2", name: "Portugal (K)", flag: "🇵🇹", group: "K", stage: "group", eliminated: false },
  { id: "DEN", name: "Denmark", flag: "🇩🇰", group: "K", stage: "group", eliminated: false },
  { id: "SRB", name: "Serbia", flag: "🇷🇸", group: "K", stage: "group", eliminated: false },
  { id: "GHA", name: "Ghana", flag: "🇬🇭", group: "K", stage: "group", eliminated: false },
  // Group L
  { id: "TUR", name: "Turkey", flag: "🇹🇷", group: "L", stage: "group", eliminated: false },
  { id: "AUT", name: "Austria", flag: "🇦🇹", group: "L", stage: "group", eliminated: false },
  { id: "UKR", name: "Ukraine", flag: "🇺🇦", group: "L", stage: "group", eliminated: false },
  { id: "CIV", name: "Côte d'Ivoire", flag: "🇨🇮", group: "L", stage: "group", eliminated: false },
];

export const TEAM_COLORS: Record<string, string> = {
  USA: "#B22234", ARG: "#74ACDF", ESP: "#AA151B", BRA: "#009C3B",
  FRA: "#002395", ENG: "#CF091F", GER: "#000000", ITA: "#003082",
  POR: "#006600", NED: "#FF4F00", BEL: "#EF3340", URU: "#75AADB",
  MEX: "#006847", JPN: "#BC002D", KOR: "#CD2E3A", CRO: "#FF0000",
  SEN: "#00853F", MAR: "#C1272D", NGA: "#008751", GHA: "#006B3F",
  CMR: "#007A5E", EGY: "#CE1126", CIV: "#F77F00", TUN: "#E70013",
  CAN: "#FF0000", COL: "#FCD116", ECU: "#FFD100", CRC: "#002B7F",
  PAN: "#DB021D", BOL: "#D52B1E", CHI: "#D52B1E", SUI: "#FF0000",
  DEN: "#C60C30", AUT: "#ED2939", TUR: "#E30A17", SRB: "#C6363C",
  UKR: "#005BBB", IRN: "#239F40", IRQ: "#007A3D", PAR: "#D52B1E",
  VEN: "#CF142B", AUS: "#00843D", NZL: "#000000", CHN: "#DE2910",
  ALB: "#E41E20", MKD: "#D4AF37", THA: "#A51931", SEN2: "#00853F",
  default: "#4A90D9",
};

export function getTeamColor(id: string): string {
  return TEAM_COLORS[id] ?? TEAM_COLORS.default;
}

// Star player representing each nation on the race track.
export const STAR_PLAYERS: Record<string, string> = {
  USA: "Christian Pulisic", PAN: "Adalberto Carrasquilla", BOL: "Marcelo Martins",
  MAR: "Achraf Hakimi", ARG: "Lionel Messi", CAN: "Alphonso Davies",
  CHI: "Alexis Sánchez", ALB: "Armando Broja", MEX: "Santiago Giménez",
  SEN: "Sadio Mané", ECU: "Moisés Caicedo", NZL: "Chris Wood",
  ESP: "Lamine Yamal", BRA: "Vinícius Jr.", JPN: "Takefusa Kubo",
  CMR: "André Onana", FRA: "Kylian Mbappé", EGY: "Mohamed Salah",
  COL: "Luis Díaz", MKD: "Eljif Elmas", ENG: "Jude Bellingham",
  NED: "Virgil van Dijk", TUN: "Hannibal Mejbri", CHN: "Wu Lei",
  GER: "Jamal Musiala", POR: "Cristiano Ronaldo", CRC: "Keylor Navas",
  AUS: "Mathew Ryan", URU: "Federico Valverde", KOR: "Son Heung-min",
  IRQ: "Aymen Hussein", NGA: "Victor Osimhen", ITA: "Federico Chiesa",
  CRO: "Luka Modrić", VEN: "Salomón Rondón", SUI: "Granit Xhaka",
  BEL: "Kevin De Bruyne", IRN: "Mehdi Taremi", PAR: "Miguel Almirón",
  THA: "Chanathip Songkrasin", POR2: "Bruno Fernandes", DEN: "Christian Eriksen",
  SRB: "Dušan Vlahović", GHA: "Mohammed Kudus", TUR: "Hakan Çalhanoğlu",
  AUT: "David Alaba", UKR: "Mykhailo Mudryk", CIV: "Sébastien Haller",
};

export function getStarPlayer(id: string): string {
  return STAR_PLAYERS[id] ?? "—";
}

export function playerInitials(id: string): string {
  const name = STAR_PLAYERS[id];
  if (!name) return id.slice(0, 2);
  const parts = name.split(" ");
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
