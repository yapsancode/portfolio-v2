import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sharedScore } from "@/lib/olympus/server";
import { challengeText, shareImagePath, sharePath } from "@/lib/olympus/sharing";
import { site } from "@/config/site";
import ShareActions from "@/components/game/ShareActions";

export const dynamic = "force-dynamic";
const getScore = cache(sharedScore);
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const score = await getScore((await params).id);
  if (!score) return { title: "Score unavailable", robots: { index: false, follow: false } };
  const origin = process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : site.url;
  const title = `${score.name} scored ${score.score.toLocaleString("en")} · Olympus`;
  const description = challengeText(score);
  const url = new URL(sharePath(score.id), origin).href;
  const image = { url: new URL(shareImagePath(score.id), origin).href, width: 1200, height: 630, alt: description };
  return {
    title: { absolute: title }, description, alternates: { canonical: url }, robots: { index: false, follow: true },
    openGraph: { title, description, type: "website", url, siteName: "Olympus", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ScorePage({ params }: Props) {
  const score = await getScore((await params).id);
  if (!score) notFound();
  return (
    <main className="olympus-challenge-page">
      <div className="olympus-challenge-wrap">
        <nav aria-label="Olympus"><Link href="/olympus">← OLYMPUS</Link><span>CHALLENGE INCOMING</span></nav>
        <header className="olympus-challenge-heading">
          <p>THE HALL OF OLYMPUS</p>
          <h1>Think you can beat <span>{score.name}</span>?</h1>
          <p>{score.score.toLocaleString("en")} points. Level {score.level} {score.outcome === "won" ? "cleared" : "reached"}. Your turn at the controls.</p>
        </header>
        <section className="olympus-challenge-frame" aria-label="Shared score card">
          <div className="olympus-transmission-bar"><span>OLYMPUS / SCORE TRANSMISSION</span><span aria-hidden="true">■ ■ ■</span></div>
          <ShareActions score={score} />
        </section>
        <div className="olympus-challenge-play"><Link className="olympus-button olympus-button-primary" href="/olympus">Beat this score →</Link><p>Six levels. One marble guardian. Make your name.</p></div>
      </div>
    </main>
  );
}
