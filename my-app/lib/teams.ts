export const TEAMS = ["Wiestlinge", "Pfadis", "Achern +", "Freunde"] as const;
export type Team = (typeof TEAMS)[number];

export const TEAM_COLORS: Record<Team, { bg: string; fg: string }> = {
  "Wiestlinge": { bg: "#e2231a", fg: "#fff" },
  "Pfadis": { bg: "#2563d9", fg: "#fff" },
  "Achern +": { bg: "#f4a800", fg: "#18140d" },
  "Freunde": { bg: "#169b62", fg: "#fff" },
};

export function isTeam(value: unknown): value is Team {
  return typeof value === "string" && (TEAMS as readonly string[]).includes(value);
}
