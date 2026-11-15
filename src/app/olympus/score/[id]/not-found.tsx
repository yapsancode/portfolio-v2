import Link from "next/link";

export default function ScoreNotFound() {
  return <main className="olympus-challenge-page"><div className="olympus-challenge-wrap olympus-challenge-heading">
    <p>TRANSMISSION LOST</p><h1>This haul isn’t available.</h1>
    <p>The link may be incomplete, or the result is no longer public.</p>
    <Link className="olympus-button olympus-button-primary" href="/olympus">Play Olympus →</Link>
  </div></main>;
}
