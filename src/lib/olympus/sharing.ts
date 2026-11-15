export type SharedScore = {
  id: string;
  name: string;
  score: number;
  level: number;
  outcome: "won" | "lost";
  rank: number | null;
  sharedAt: string;
};

export function sharePath(id: string) { return `/olympus/score/${id}`; }
export function shareImagePath(id: string) { return `${sharePath(id)}/image`; }
export function shareDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}
export function challengeText(score: SharedScore) {
  return `${score.name} scored ${score.score.toLocaleString("en")} on level ${score.level} in Olympus. Think you can beat it?`;
}
