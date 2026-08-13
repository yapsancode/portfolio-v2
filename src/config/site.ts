/**
 * site.ts — ALL editable content lives here.
 *
 * Edit this file to change copy, links, projects, icons, and window
 * defaults. Components read from this config; you should never need to
 * touch component logic to update content.
 */

export type WindowId = "about" | "work" | "contact" | "now";

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
    "I'm Isyraf — a fullstack developer in Shah Alam, Malaysia. I ship production software end-to-end: from architecture decisions to deployment and user impact.",
    "I recently completed Gamuda AI Academy (Yayasan Gamuda x Google Cloud), where I led codebase architecture and Git workflows for an AI-powered capstone team. Our project, Baymax, won 1st place at Capstone Demo Day.",
    "Before that I worked on a production Flutter Web platform for Malaysia's largest automotive manufacturer, replacing legacy SAP workflows, and I've independently shipped consumer products — an esports tournament platform and a clinic booking system — on Next.js, FastAPI, and Google Cloud.",
    "Right now I'm going deep on AI systems engineering and DevOps: building AI agents, learning Go, and completing a 12-week upskilling block to earn my GCP Associate Cloud Engineer certification.",
    "This site is a love letter to the computers I grew up with. Double-click around — everything here is hand-built, from the window chrome to the icons.",
  ],

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
  {
    name: "Baymax",
    year: "2026",
    impact:
      "AI GCP deployment assistant: a Chrome extension that guides developers through deployments by highlighting the exact Console button to click. 1st place, Gamuda AI Academy Capstone Demo Day.",
    stack: ["React 19", "FastAPI", "LangChain", "Gemini API", "Supabase", "Chrome Extension MV3", "Cloud Run"],
    codeUrl: "https://github.com/yapsancode/baymax",
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
    label: "AI agents + Go",
    detail:
      "Deepening LLM-systems engineering: agent evaluation, retrieval, and tool use, with Go for backend fundamentals.",
  },
  {
    label: "Qalam — Jawi handwriting ML",
    detail:
      "Building the first Jawi handwriting dataset and a tutor app that verifies your writing. Looking for a Jawi-literate collaborator.",
  },
  {
    label: "KerjaKit + Baymax",
    detail:
      "Shipping and growing my AI products: the job-tailor web app and the GCP deployment assistant.",
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
  { id: "hire-me", label: "Hire Me!", opens: "contact", icon: "smiley" },
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
};
