export type SharedScore = {
  id: string;
  name: string;
  score: number;
  level: number;
  outcome: "won" | "lost";
  rank: number | null;
  sharedAt: string;
};

export function sharePath(id: string) { return `/games/olympus/score/${id}`; }
export function shareImagePath(id: string) { return `${sharePath(id)}/image`; }
export function shareDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}
export function challengeText(score: SharedScore) {
  return `${score.name} collected ${score.score.toLocaleString("en")} marble on level ${score.level} in Olympus. Think you can beat it?`;
}
