/** Bounded beam search uses the real attacks and hearts, not an invincible bot. */
export function solve(g, initial, width = 180) {
  let frontier = [{ state: initial, path: [] }];
  const seen = new Map();
  for (let depth = 0; depth < 65; depth++) {
    const next = [];
    for (const { state, path } of frontier) {
      for (const direction of g.DIRECTIONS) {
        const turn = g.move(state, direction);
        if (turn.game === state || turn.game.phase === "lost") continue;
        const route = [...path, direction];
        if (turn.game.phase === "won") return route;
        const s = turn.game;
        const key = [s.position, s.remaining.join("."), s.warning.join("."), s.random].join("/");
        if ((seen.get(key) ?? -1) >= s.hearts) continue;
        seen.set(key, s.hearts);
        next.push({ state: s, path: route });
      }
    }
    next.sort((a, b) => (a.state.remaining.length * 4 - a.state.hearts) - (b.state.remaining.length * 4 - b.state.hearts));
    frontier = next.slice(0, width);
    if (!frontier.length) break;
  }
  return null;
}

