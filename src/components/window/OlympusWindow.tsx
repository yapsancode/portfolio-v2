"use client";
import Link from "next/link";
import { site } from "@/config/site";
import { useGame } from "@/components/game/GameContext";
import PixelIcon from "@/components/desktop/PixelIcon";
import "@/components/game/olympus.css";

export default function OlympusWindow() {
  const { start } = useGame();
  return <div className="olympus-title">
    <p className="olympus-title-dim">ISYRAF 98 PRESENTS</p>
    <h1 className="olympus-logo">OLYMPUS</h1>
    <p>{site.olympus.title.tagline}</p>
    <div className="olympus-preview" aria-hidden="true"><span>↖</span><span>→</span><PixelIcon name="folder" size={32} /><PixelIcon name="terminal" size={32} /><span>✦</span></div>
    <p className="olympus-title-dim">One thumb. Zero rush. Your progress saves.</p>
    <button type="button" className="swipe-primary" onClick={start} autoFocus>LET’S BREAK THINGS →</button>
    <Link className="swipe-secondary" href="/olympus">Open direct game link ↗</Link>
  </div>;
}

