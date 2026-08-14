/**
 * site.ts — ALL editable content lives here.
 *
 * Edit this file to change copy, links, projects, icons, and window
 * defaults. Components read from this config; you should never need to
 * touch component logic to update content.
 */

export type WindowId = "about" | "work" | "contact" | "now" | "hire";

export type DesktopIconId = WindowId | "hire-me";

export type Project = {
  name: string;
  year: string;
  /** One-line impact description — lead with what it achieved, not the tech. */
  impact: string;
  stack: string[];
  liveUrl?: string;
  codeUrl?: string;
};

export const site = {
  name: "Isyraf's Website",
  shortName: "Isyraf",
  role: "Software Engineer",
  tagline: "Open. Ship. Close. Repeat.",

  email: "muhammadisyrafafifi@gmail.com",
  resumeUrl: "/Muhammad-Isyraf-Resume.pdf",
  socials: [
    { label: "GitHub", url: "https://github.com/yapsancode" },
    { label: "LinkedIn", url: "https://linkedin.com/in/muhammad-isyraf-afifi" },
    { label: "YouTube", url: "https://www.youtube.com/@isyrafafifi" },
  ],

  /** Short, plain-language blurb for the About window. */
  about: [
    "I'm Isyraf — a software engineer in Shah Alam, Malaysia. I like building things and getting them running for real people. That's the short version.",
    "I started on the application side: Flutter and web development, with Laravel, Next.js, databases, and cloud along the way. That included a production Flutter Web platform for Malaysia's biggest carmaker, replacing some legacy screens people were glad to see go.",
    "Then I got pulled into AI. I started building my own AI products outside of work — LLM APIs, RAG, agents, Python/FastAPI, Docker, PostgreSQL, Google Cloud. KerjaKit and the other side projects came out of that.",
    "I've deployed some of those myself, but I'll be honest: I could ship something without fully understanding what was happening underneath. So now I'm going back to learn Linux, networking, Docker, cloud infrastructure, and CI/CD properly — not from tutorials or copy-pasted AI instructions.",
    "I'm early in my career and still figuring out where I fit: AI engineering, full-stack, DevOps/MLOps, and eventually the place where they meet. I don't call myself an expert in any of it yet. Most of my time right now is trying things, finding gaps, and filling them on purpose.",
    "The thing I'm most confident about is that I like building. I want to be the kind of engineer who doesn't just write the app, but understands how to get it running, deployed, and reliable in the real world. This site — a hand-built Windows 98 desktop — is part of that practice.",
  ],

  /** Music playing while you read this. */
  music: "Childish Gambino — L.E.S. (instrumental)",

  /** Design credit line shown at the bottom of the About window. */
  inspiration: {
    label: "OS-on-the-web inspiration: zach.dev",
    url: "https://www.zach.dev/",
  },

  /** Pitch for the dedicated "Hire Me" window (job-ad style). */
  hireMe: {
    role: "Software Engineer",
    pitch:
      "I'm an early-career software engineer who likes building things and wants to own the whole path to production — from the app to the deployment. I won't pretend I know everything. Here's what I actually bring:",
    wins: [
      "Built a production Flutter Web platform for Malaysia's largest carmaker, replacing legacy screens",
      "Took 1st place at the Gamuda AI Academy (Google Cloud) demo day — I owned the codebase architecture and Git workflows",
      "Shipped my own AI products end-to-end — KerjaKit, an AI résumé tailor, and more — using LLM APIs, RAG, FastAPI, and Google Cloud",
      "Going back to fundamentals right now — Linux, Docker, CI/CD, cloud — so I understand deployment, not just how to run the commands",
    ],
    note:
      "No rockstar talk. I'm early in my career, I know exactly where my gaps are, and I'm filling them on purpose. I like building, and I own my work.",
    cta: "Still reading? Email me or grab the résumé below.",
  },

  /** The centered desktop image (decorative). */
  centerImage: {
    src: "/images/greek-male-sculpture.png",
    alt: "",
  },
} as const;

export const projects: Project[] = [
  {
    name: "KerjaKit",
    year: "2026",
    impact:
      "AI resume tailor: paste a job posting, get an honest match report and an ATS-safe one-page PDF. 31 GitHub stars, 10 registered users, every gap shown.",
    stack: ["Next.js 16", "React 19", "Supabase", "Tailwind v4", "Typst", "Cloud Run", "DeepSeek"],
    liveUrl: "https://kerjakit.com",
    codeUrl: "https://github.com/yapsancode/job-kit",
  },
];

/** Current-focus items for the "What I'm doing" window. */
export const now: { label: string; detail: string }[] = [
  {
    label: "DevOps upskilling (12 weeks)",
    detail:
      "Linux, Docker, Kubernetes, Terraform, Prometheus/Grafana — targeting the GCP Associate Cloud Engineer cert around Nov 2026.",
  },
  {
    label: "AI agents",
    detail:
      "Deepening LLM-systems engineering: agent evaluation, retrieval, and tool use.",
  },
  {
    label: "Qalam — Jawi handwriting ML",
    detail:
      "Building the first Jawi handwriting dataset and a tutor app that verifies your writing. Looking for a Jawi-literate collaborator.",
  },
  {
    label: "KerjaKit",
    detail: "Shipping and growing my AI job-tailor web app.",
  },
];

/* ------------------------------------------------------------------ */
/* Desktop icons (left column, top to bottom)                          */
/* ------------------------------------------------------------------ */

export const desktopIcons: {
  id: DesktopIconId;
  label: string;
  /** Which window this icon opens. "hire-me" is a shortcut to contact. */
  opens: WindowId;
  /** Key into the pixel-icon set in DesktopIcon.tsx */
  icon: "person" | "briefcase" | "envelope" | "smiley" | "terminal";
}[] = [
  { id: "about", label: "About Me", opens: "about", icon: "person" },
  { id: "work", label: "My Work", opens: "work", icon: "briefcase" },
  { id: "now", label: "What I'm doing", opens: "now", icon: "terminal" },
  { id: "contact", label: "Contact", opens: "contact", icon: "envelope" },
  { id: "hire-me", label: "Hire Me!", opens: "hire", icon: "smiley" },
];

/* ------------------------------------------------------------------ */
/* Window registry defaults (title, opening size/position)             */
/* ------------------------------------------------------------------ */

export const windowDefaults: Record<
  WindowId,
  { title: string; width: number; height: number; x: number; y: number }
> = {
  about: {
    title: "C:\\isyraf\\about.txt",
    width: 500,
    height: 380,
    x: 140,
    y: 60,
  },
  work: {
    title: "C:\\isyraf\\work.txt",
    width: 580,
    height: 440,
    x: 200,
    y: 90,
  },
  contact: {
    title: "C:\\isyraf\\contact.txt",
    width: 460,
    height: 340,
    x: 260,
    y: 130,
  },
  now: {
    title: "C:\\isyraf\\now.txt",
    width: 520,
    height: 420,
    x: 170,
    y: 80,
  },
  hire: {
    title: "C:\\isyraf\\hire-me.txt",
    width: 520,
    height: 440,
    x: 230,
    y: 120,
  },
};
