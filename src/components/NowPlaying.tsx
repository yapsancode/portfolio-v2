"use client";

/* ============================================================================
 *  NowPlaying — a small header pill showing what I'm listening to on Spotify.
 *
 *  Polls `/api/now-playing` (the server route that holds the Spotify secrets)
 *  every 30s and on tab refocus. Styled to match the hero's bordered buttons:
 *  charcoal ink, pill shape — no Spotify green (it clashes with the lime field;
 *  the charcoal Spotify glyph is a brand-allowed monochrome variant).
 *
 *  Click-to-listen: clicking the pill opens a dropdown with Spotify's official
 *  embed player (~30s preview for anyone, full track if the visitor is logged
 *  into Spotify). We use the embed because Spotify removed `preview_url` from
 *  the API in late 2024, so a custom audio element has nothing to play. The
 *  iframe is rendered lazily — only once a visitor actually opens the player.
 *
 *  Degrades quietly: renders nothing until configured, and on mobile only shows
 *  when something is actually playing (the desktop nav is hidden there).
 * ========================================================================== */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { site } from "@/config/site";

type NowPlayingData =
  | { configured: false }
  | { configured: true; isPlaying: false }
  | {
      configured: true;
      isPlaying: true;
      id: string | null;
      kind: "track" | "episode";
      title: string;
      artist: string;
      album: string;
      albumImageUrl: string | null;
      songUrl: string | null;
    };

const POLL_MS = 30_000;

/** Official Spotify glyph (monochrome), tinted with currentColor. */
function SpotifyGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.96-.539-.121-.421.18-.84.54-.96 4.561-1.021 8.52-.6 11.64 1.32.42.18.479.659.32 1.08zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.299z" />
    </svg>
  );
}

/** Three animated bars. Frozen automatically under prefers-reduced-motion. */
function Equalizer() {
  return (
    <span aria-hidden="true" className="flex h-3.5 items-end gap-[2px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="np-bar w-[3px] rounded-full bg-charcoal"
          style={{
            height: "100%",
            animationDelay: `${i * 0.18}s`,
            animationDuration: `${0.9 + i * 0.15}s`,
          }}
        />
      ))}
    </span>
  );
}

export default function NowPlaying() {
  const [data, setData] = useState<NowPlayingData | null>(null);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch("/api/now-playing", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) return;
        setData(await res.json());
      } catch {
        // aborted or offline — keep last known state
      }
    }

    load();
    const interval = setInterval(load, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      controller.abort();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Close the player on outside-click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Nothing yet, or Spotify not wired up: render nothing (no layout shift).
  if (!data || !data.configured) return null;

  const profileUrl = site.spotify?.profileUrl;

  // --- Not playing -----------------------------------------------------------
  // Quiet, muted pill. Hidden on mobile so the header isn't a lonely icon.
  if (!data.isPlaying) {
    const Inner = (
      <>
        <SpotifyGlyph className="h-4 w-4 shrink-0 text-charcoal/70" />
        <span className="text-charcoal/60">Not playing</span>
      </>
    );
    const base =
      "hidden items-center gap-2 rounded-full border-2 border-charcoal/30 px-3.5 py-1.5 text-xs font-bold sm:flex";
    return profileUrl ? (
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="My Spotify profile"
        className={`${base} cursor-pointer transition-colors hover:border-charcoal/60`}
      >
        {Inner}
      </a>
    ) : (
      <span className={base}>{Inner}</span>
    );
  }

  // --- Playing ---------------------------------------------------------------
  const label = `${data.title} by ${data.artist}`;
  const content = (
    <>
      <SpotifyGlyph className="h-4 w-4 shrink-0" />
      {data.albumImageUrl && (
        <Image
          src={data.albumImageUrl}
          alt=""
          width={28}
          height={28}
          unoptimized
          className="h-7 w-7 shrink-0 rounded-sm object-cover"
        />
      )}
      <span className="hidden min-w-0 max-w-[10rem] flex-col leading-tight sm:flex">
        <span className="truncate text-xs font-bold">{data.title}</span>
        <span className="truncate text-[11px] font-medium text-charcoal/60">
          {data.artist}
        </span>
      </span>
      <Equalizer />
    </>
  );

  const base =
    "flex items-center gap-2.5 rounded-full border-2 border-charcoal bg-charcoal/[0.04] px-3 py-1.5";

  const embedUrl = data.id
    ? `https://open.spotify.com/embed/${data.kind}/${data.id}?utm_source=generator`
    : null;

  // No track id (rare) — fall back to a plain link out to Spotify.
  if (!embedUrl) {
    return data.songUrl ? (
      <a
        href={data.songUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label} on Spotify`}
        title={label}
        className={`${base} cursor-pointer transition-transform duration-200 hover:-translate-y-0.5`}
      >
        {content}
      </a>
    ) : (
      <span className={base} aria-label={label}>
        {content}
      </span>
    );
  }

  // Click the pill → expand Spotify's embed player right under it.
  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={open ? "Close Spotify player" : `Play ${label} on Spotify`}
        title={label}
        className={`${base} cursor-pointer transition-transform duration-200 hover:-translate-y-0.5`}
      >
        {content}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={`Spotify player — ${label}`}
          className="absolute right-0 top-full z-40 mt-2 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border-2 border-charcoal bg-paper p-2 shadow-[0_10px_0_-2px_rgba(26,27,22,0.18)]"
        >
          <iframe
            title={`Spotify player: ${label}`}
            src={embedUrl}
            width="100%"
            height={80}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            style={{ border: 0, borderRadius: 12, display: "block" }}
          />
        </div>
      )}
    </div>
  );
}
