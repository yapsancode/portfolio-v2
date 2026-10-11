"use client";

import Image from "next/image";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import { site } from "@/config/site";

const TABS = [
  { id: "general", label: "General" },
  { id: "readme", label: "Read me" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** The "System Properties" card: photo on the left, a few facts on the right. */
function General() {
  return (
    <div className="win-scroll @container min-h-0 flex-1 overflow-auto p-4">
      <div className="flex flex-col gap-4 @sm:flex-row @sm:gap-5">
        <div className="bevel-in shrink-0 self-center bg-white p-0.5 @sm:self-start">
          <Image
            src={site.profile.photo.src}
            alt={site.profile.photo.alt}
            width={400}
            height={480}
            sizes="160px"
            className="h-48 w-40 object-cover"
          />
        </div>
        <dl className="min-w-0 flex-1 text-sm leading-snug">
          {site.profile.specs.map((spec) => (
            <div key={spec.label} className="mb-3">
              <dt>{spec.label}:</dt>
              {spec.lines.map((line) => (
                <dd key={line} className="pl-4">
                  {line}
                </dd>
              ))}
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/** The longer story, shown like a text file. */
function ReadMe() {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-2">
      <article className="bevel-in win-scroll min-h-0 flex-1 overflow-auto bg-white p-3 leading-relaxed">
        <p className="mb-3 text-sm text-neutral-600">
          {site.role} — {site.tagline}
        </p>
        {site.about.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className="mb-3">
            {paragraph}
          </p>
        ))}
        <p className="mt-2 text-xs text-neutral-500">music: {site.music}</p>
        <p className="mt-2 border-t border-win-shadow pt-2 text-xs text-neutral-600">
          {site.inspiration.label}{" "}
          <a
            href={site.inspiration.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-win-navy underline"
          >
            {site.inspiration.url.replace(/^https?:\/\//, "")}
          </a>
        </p>
      </article>
    </div>
  );
}

export default function AboutWindow() {
  const [tab, setTab] = useState<TabId>("general");

  // Left / Right arrows move between tabs, like a real property sheet.
  const onTabKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const step = e.key === "ArrowRight" ? 1 : TABS.length - 1;
    const index = TABS.findIndex((t) => t.id === tab);
    const next = TABS[(index + step) % TABS.length];
    setTab(next.id);
    document.getElementById(`about-tab-${next.id}`)?.focus();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-win-face p-2">
      <h1 className="sr-only">About {site.name}</h1>

      <div
        role="tablist"
        aria-label="About"
        className="win-tabs shrink-0"
        onKeyDown={onTabKeyDown}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`about-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls="about-panel"
            tabIndex={tab === t.id ? 0 : -1}
            className={`win-tab${tab === t.id ? " selected" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        id="about-panel"
        role="tabpanel"
        aria-labelledby={`about-tab-${tab}`}
        className="bevel-out flex min-h-0 flex-1 flex-col bg-win-face"
      >
        {tab === "general" ? <General /> : <ReadMe />}
      </div>
    </div>
  );
}
