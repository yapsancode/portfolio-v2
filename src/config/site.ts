/**
 * site.ts — ALL editable content lives here.
 *
 * Edit this file to change copy, links, projects, icons, and window
 * defaults. Components read from this config; you should never need to
 * touch component logic to update content.
 */

export type WindowId = "about" | "work" | "contact";

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

  // TODO: replace with real contact details before deploying.
  email: "hello@example.com",
  resumeUrl: "#",
  socials: [
    { label: "GitHub", url: "https://github.com/yapsancode" },
    // { label: "LinkedIn", url: "https://www.linkedin.com/in/..." },
  ],

  /** Short, plain-language blurb for the About window. */
  about: [
    "I'm Isyraf — a fullstack developer based in Malaysia. I'm early in my career, but I've already shipped real production code that real people use.",
    "I care about the details: fast load times, interfaces that feel considered, and code the next person can actually read.",
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
    year: "2025",
    impact:
      "AI career assistant that helps Malaysians find jobs — CV analysis, job matching, and interview prep in one place.",
    stack: ["Next.js", "TypeScript", "AI SDK", "PostgreSQL"],
    liveUrl: "https://kerjakit.com",
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
  icon: "person" | "briefcase" | "envelope" | "smiley";
}[] = [
  { id: "about", label: "About Me", opens: "about", icon: "person" },
  { id: "work", label: "My Work", opens: "work", icon: "briefcase" },
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
};
