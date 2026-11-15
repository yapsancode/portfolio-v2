"use client";

import { useEffect, useState } from "react";
import { leaderboardRequest } from "@/lib/olympus/client";
import type { ScoreEntry } from "@/lib/olympus/leaderboard";

const medals = ["Gold", "Silver", "Bronze"] as const;

export default function HighScores() {
  const [entries, setEntries] = useState<ScoreEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    leaderboardRequest<{ entries: ScoreEntry[] }>("scores").then(
      (data) => { if (active) setEntries(data.entries); },
      (reason) => { if (active) setError(reason.message); },
    );
    return () => { active = false; };
  }, [attempt]);

  return (
    <section className="olympus-scores" aria-label="Global high scores">
      <h2>HALL OF OLYMPUS</h2>
      <p className="olympus-scores-note">Global top 10 · one best score per player</p>
      {error ? (
        <div role="status" className="olympus-scores-message">
          <p>{error}</p>
          <button type="button" className="olympus-button" onClick={() => {
            setError(null); setEntries(null); setAttempt((value) => value + 1);
          }}>Try again</button>
        </div>
      ) : entries === null ? (
        <p role="status" className="olympus-scores-message">Connecting to Olympus...</p>
      ) : entries.length === 0 ? (
        <p role="status" className="olympus-scores-message">No legends yet. Play a game and set the first score.</p>
      ) : (
        <div className="olympus-scores-scroll" tabIndex={0} aria-label="High score table">
          <table>
            <thead><tr><th scope="col">#</th><th scope="col">NAME</th><th scope="col">SCORE</th><th scope="col">RUN</th></tr></thead>
            <tbody>{entries.map((entry, index) => (
              <tr key={entry.id} className={[
                index < 3 ? `olympus-score-${medals[index].toLowerCase()}` : "",
                entry.isYou ? "olympus-score-you" : "",
              ].filter(Boolean).join(" ")}>
                <td>
                  <span className="olympus-score-rank">
                    {index < 3 && (
                      <svg className="olympus-score-medal" viewBox="0 0 16 20" role="img" aria-label={`${medals[index]} medal`}>
                        <path d="M2 1h4l2 5 2-5h4l-4 8H6z" fill="currentColor" opacity=".65" />
                        <path d="M5 7h6v2h2v7h-2v2H5v-2H3V9h2z" fill="currentColor" />
                        <path d="M6 10h4v5H6z" fill="#000" opacity=".3" />
                      </svg>
                    )}
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </td>
                <td className="olympus-score-name" title={entry.name}>
                  <span className="olympus-score-player">
                    <span className="olympus-score-player-text">{entry.name}</span>
                    {entry.isYou && <span className="olympus-score-marker">YOU</span>}
                  </span>
                </td>
                <td>{entry.score.toLocaleString("en")}</td>
                <td>{entry.run}<span aria-label={entry.outcome === "won" ? " cleared" : " reached"}>{entry.outcome === "won" ? "★" : ""}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <p className="olympus-scores-note">★ Run cleared · ties: higher run, then first posted</p>
    </section>
  );
}
