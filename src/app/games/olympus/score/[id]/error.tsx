"use client";

export default function ScoreError({ reset }: { reset: () => void }) {
  return <main className="olympus-challenge-page"><div className="olympus-challenge-wrap olympus-challenge-heading">
    <p>CONNECTION INTERRUPTED</p><h1>The haul couldn’t load.</h1>
    <p>Please try again in a moment.</p><button className="olympus-button olympus-button-primary" onClick={reset}>Try again</button>
    <a className="olympus-score-link" href="/games/olympus">Play Olympus</a>
  </div></main>;
}
