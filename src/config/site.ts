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
  name: "Muhammad Isyraf Afifi bin Ismail",
  shortName: "Isyraf",
  role: "Fullstack Developer",
  tagline: "I build things for the web — and I ship them.",

  email: "muhammadisyrafafifi@gmail.com",
  resumeUrl: "/Muhammad-Isyraf-Resume.pdf",
  socials: [
    { label: "GitHub", url: "https://github.com/yapsancode" },
    { label: "LinkedIn", url: "https://linkedin.com/in/muhammad-isyraf-afifi" },
  ],

  /** Short, plain-language blurb for the About window. */
  about: [
    "I'm Isyraf — a fullstack developer in Shah Alam, Malaysia. My thing is shipping: taking an idea from \"hmm, that could work\" to \"it's live and people actually use it.\"",
    "Fresh out of Gamuda AI Academy (Yayasan Gamuda x Google Cloud), where I owned the codebase architecture and Git workflows for an AI capstone team — and we took 1st place at Demo Day. The certificate is around here somewhere. Probably in a drawer.",
    "Before that I worked on a production Flutter Web platform for Malaysia's biggest carmaker — replacing legacy SAP screens that made everyone a little sad — and shipped my own stuff too: an esports tournament platform and a clinic booking system, because clearly one side project was never going to be enough.",
    "Right now I'm going deep on AI systems and DevOps: building agents, grinding a 12-week upskilling block, and coming for the GCP Associate Cloud Engineer cert. I commit in full sentences with far too much personality.",
    "And this site? It's a love letter to the computers I grew up with. Every pixel — the windows, the icons, the bevels — is hand-built. Double-click around, open everything. If something looks broken, it's probably intentional.",
  ],

  /** Design credit line shown at the bottom of the About window. */
  inspiration: {
    label: "OS-on-the-web inspiration: zach.dev",
    url: "https://www.zach.dev/",
  },

  /** Pitch for the dedicated "Hire Me" window (job-ad style). */
  hireMe: {
    role: "Fullstack Developer — AI & Cloud",
    pitch:
      "You want someone who takes a product from idea to deployed and cares about the details. That's me. Here's what hiring me gets you:",
    wins: [
      "Built a production platform for Malaysia's largest carmaker, replacing legacy SAP screens",
      "1st place at Gamuda AI Academy capstone demo day — ran the codebase architecture and Git workflows",
      "Independently shipped consumer products end-to-end: an esports tournament platform and a clinic booking system",
      "Comfortable across the whole stack — Next.js, React, FastAPI, Google Cloud",
    ],
    note:
      "No generic \"team player\" fluff. I ship things and I own the outcome.",
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
    title: "C:\\isyraf\\work",
    width: 580,
    height: 440,
    x: 200,
    y: 90,
  },
  contact: {
    title: "C:\\isyraf\\contact",
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
