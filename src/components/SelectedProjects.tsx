"use client";

/**
 * SelectedProjects — adapts the site.ts projects config to the hover-reveal
 * project list primitive (components/ui/selected-projects). Content lives in
 * site.ts; this file maps it to the component's shape and lazy-loads the
 * (framer-motion-heavy) list so it stays out of the initial JS bundle.
 */

import dynamic from "next/dynamic";
import { site } from "@/config/site";

const SelectedProjectsList = dynamic(
  () => import("@/components/ui/selected-projects"),
  {
    ssr: false,
    // Reserve height so the list loading in doesn't shift the page.
    loading: () => <div className="min-h-[32rem]" aria-hidden />,
  },
);

const projects = site.projects.map((project) => ({
  heading: project.title,
  subheading: project.tagline, // the component wants the short one-liner
  year: project.year,
  stack: project.stack,
  badge: project.badge,
  imgSrc: project.image,
  imgFallbackSrc: project.imageFallback ?? undefined,
  href: project.live,
  isLive: Boolean(project.live),
}));

export default function SelectedProjects() {
  return <SelectedProjectsList projects={projects} />;
}
