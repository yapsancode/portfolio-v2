"use client";

import { Fragment, useEffect, useState } from "react";
import { leaderboardRequest } from "@/lib/olympus/client";
import type { ScoreEntry } from "@/lib/olympus/leaderboard";

const medals = ["Gold", "Silver", "Bronze"] as const;

export default function HighScores() {
  const [entries, setEntries] = useState<ScoreEntry[] | null>(null);
  const [season, setSeason] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    leaderboardRequest<{ entries: ScoreEntry[]; version: string }>("scores").then(
      (data) => { if (active) { setEntries(data.entries); setSeason(data.version.replace(/^olympus-/, "")); } },
      (reason) => { if (active) setError(reason.message); },
    );
    return () => { active = false; };
  }, [attempt]);

  return (
    <section className="olympus-scores" aria-label="Global top collectors">
      <h2>HALL OF OLYMPUS</h2>
      <p className="olympus-scores-note">{season && `Season ${season} · `}Global top 10 · best haul on each level, added up</p>
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
        <p role="status" className="olympus-scores-message">No collectors yet. Play a game and bring home the first haul.</p>
      ) : (
        <div className="olympus-scores-scroll" tabIndex={0} aria-label="Marble haul table">
          <table>
            <thead><tr><th scope="col">#</th><th scope="col">NAME</th><th scope="col">MARBLE</th><th scope="col">LEVEL</th></tr></thead>
            <tbody>{entries.map((entry) => { const medal = medals[entry.rank - 1]; return (<Fragment key={entry.id}>
              {entry.rank > 10 && <tr className="olympus-score-gap" aria-hidden="true"><td colSpan={4}>···</td></tr>}
              <tr className={[
                medal ? `olympus-score-${medal.toLowerCase()}` : "",
                entry.isYou ? "olympus-score-you" : "",
              ].filter(Boolean).join(" ")}>
                <td>
                  <span className="olympus-score-rank">
                    {medal && (
                      <svg className="olympus-score-medal" viewBox="0 0 16 20" role="img" aria-label={`${medal} medal`}>
                        <path d="M2 1h4l2 5 2-5h4l-4 8H6z" fill="currentColor" opacity=".65" />
                        <path d="M5 7h6v2h2v7h-2v2H5v-2H3V9h2z" fill="currentColor" />
                        <path d="M6 10h4v5H6z" fill="#000" opacity=".3" />
                      </svg>
                    )}
                    {String(entry.rank).padStart(2, "0")}
                  </span>
                </td>
                <td className="olympus-score-name" title={entry.name}>
                  <span className="olympus-score-player">
                    <span className="olympus-score-player-text">{entry.name}</span>
                    {entry.isYou && <span className="olympus-score-marker">YOU</span>}
                  </span>
                </td>
                <td>{entry.score.toLocaleString("en")}</td>
                <td>{entry.level}<span aria-label={entry.outcome === "won" ? " cleared" : " reached"}>{entry.outcome === "won" ? "★" : ""}</span></td>
              </tr>
            </Fragment>); })}</tbody>
          </table>
        </div>
      )}
      <p className="olympus-scores-note">LEVEL = furthest reached · ★ cleared · ties: higher level, faster time, then first · each season starts a fresh board when the rules change</p>
    </section>
  );
}
