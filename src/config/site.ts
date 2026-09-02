/**
 * site.ts — ALL editable content lives here.
 *
 * Edit this file to change copy, links, projects, icons, and window
 * defaults. Components read from this config; you should never need to
 * touch component logic to update content.
 */

export type WindowId =
  | "about"
  | "work"
  | "contact"
  | "now"
  | "photos"
  | "hire";

export type DesktopIconId = WindowId | "hire-me";

export type Project = {
  name: string;
  year: string;
  /** One-line impact description — lead with what it achieved, not the tech. */
  impact: string;
  /** Optional origin story — how the project started. */
  origin?: string;
  stack: string[];
  liveUrl?: string;
  codeUrl?: string;
};

export type Photo = {
  /** Casual filename shown in the Photos folder. */
  filename: string;
  /** Web-safe local copy under public/photos. */
  src: string;
  /** Factual description used by the image viewer. */
  alt: string;
  /** Optional one-line personal note shown only in the image viewer. */
  note?: string;
};

export const site = {
  name: "Isyraf Afifi",
  shortName: "Isyraf",
  role: "Software Engineer",
  tagline: "I like building things.",

  email: "muhammadisyrafafifi@gmail.com",
  resumeUrl: "/Muhammad-Isyraf-Resume.pdf",
  socials: [
    { label: "GitHub", url: "https://github.com/yapsancode" },
    { label: "LinkedIn", url: "https://linkedin.com/in/muhammad-isyraf-afifi" },
    { label: "YouTube", url: "https://www.youtube.com/@isyrafafifi" },
  ],

  /** Short, plain-language blurb for the About window. */
  about: [
    "Hey, I'm Isyraf — a software engineer from Shah Alam who likes building things. That includes software products, AI experiments, side projects, and occasionally things that have nothing to do with code.",
    "I started on the application side: Flutter and web development, with Laravel, Next.js, databases, and cloud along the way. That included a production Flutter Web platform for Malaysia's biggest carmaker, replacing some legacy screens people were glad to see go.",
    "Then I got pulled into AI and started building my own products outside of work — LLM APIs, RAG, agents, Python/FastAPI, Docker, PostgreSQL, Google Cloud. KerjaKit and a bunch of smaller experiments came out of that.",
    "Shipping those projects made me more curious about everything underneath them. Right now I'm going deeper on Linux, networking, Docker, cloud infrastructure, and CI/CD so I can understand the whole path from an idea to something reliable in production.",
    "Most of what I do comes back to the same thing: I like taking an idea, building it, and getting it in front of real people. Sometimes that's software, sometimes it's an experiment, and sometimes it's just something I wanted to try. This hand-built Windows 98 desktop is one of those things.",
  ],

  /** Music playing while you read this. */
  music: "Childish Gambino — L.E.S. (instrumental)",

  /** Design credit line shown at the bottom of the About window. */
  inspiration: {
    label: "OS-on-the-web inspiration: zach.dev",
    url: "https://www.zach.dev/",
  },

  /** Copy for the dedicated "Work with me" window. */
  hireMe: {
    role: "Work with me",
    pitch:
      "I spend most of my time building software, experimenting with ideas, and figuring out how to get them running for real people. If you're working on something interesting and think I could be useful, feel free to get in touch.",
    wins: [
      "Built a production Flutter Web platform for Malaysia's largest carmaker, replacing legacy screens",
      "Built and shipped KerjaKit end to end — from an open-source CLI to a live AI product used by real people",
      "Took 1st place at the Gamuda AI Academy demo day, where I owned the codebase architecture and Git workflows",
      "Currently going deeper on Linux, Docker, CI/CD, and cloud infrastructure so I can own more of the path to production",
    ],
    note:
      "I care about understanding the problem, building the thing properly, and getting it running for real people.",
    cta: "For roles, projects, or collaborations, email me. Recruiters can grab the résumé too.",
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
      "AI resume tailor that never invents: paste a job posting, get an honest match report and an ATS-safe one-page PDF, with in-production checks that block any fabricated skill or number. 28 real users, 34 GitHub stars.",
    origin:
      "Started as an open-source CLI that tailored résumés — great, but it needed git, Claude Code, and LaTeX, so only technical people could use it. A Threads post hit 3,000 likes and people kept asking for a web version, so I built one.",
    stack: ["Next.js 16", "React 19", "Supabase", "Tailwind v4", "Typst", "Cloud Run", "DeepSeek"],
    liveUrl: "https://kerjakit.com",
    codeUrl: "https://github.com/yapsancode/job-kit",
  },
];

/** Current-focus items for the "What I'm doing" window. */
export const now: { label: string; detail: string }[] = [
  {
    label: "Infrastructure fundamentals",
    detail:
      "Going deeper on Linux, networking, Docker, cloud infrastructure, and CI/CD so I understand more of the path from development to production.",
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
    detail:
      "Growing KerjaKit beyond the build itself — getting it in front of real users, writing content, and learning the marketing side.",
  },
];

/** A small, manually ordered folder of personal photos. */
export const photos: Photo[] = [
  {
    filename: "coffee_break.jpg",
    src: "/photos/coffee_break.jpg",
    alt: "Isyraf sitting by a cafe window, looking at his phone with two drinks on the table.",
    note: "Somewhere between the first drink and the second one.",
  },
  {
    filename: "work_setup.jpg",
    src: "/photos/work_setup.jpg",
    alt: "Two laptops with code open on their screens during a shared work session.",
    note: "A normal amount of tabs and terminals.",
  },
  {
    filename: "waterfall_hike.jpg",
    src: "/photos/waterfall_hike.jpg",
    alt: "Three friends standing in a rocky pool below a forest waterfall.",
    note: "The pose made sense at the time.",
  },
  {
    filename: "late_night_7e_japan.jpg",
    src: "/photos/late_night_7e_japan.jpg",
    alt: "Two people outside a brightly lit 7-Eleven in Japan at night.",
    note: "A very serious late-night 7-Eleven stop.",
  },
  {
    filename: "currently_here.jpg",
    src: "/photos/currently_here.jpg",
    alt: "A Shah Alam and Klang road sign beside traffic lights at sunset.",
    note: "Somewhere between Shah Alam and Klang.",
  },
  {
    filename: "masjid_tnb_bangsar.jpg",
    src: "/photos/masjid_tnb_bangsar.jpg",
    alt: "Worshippers seated inside Masjid TNB in Bangsar beneath an illuminated geometric ceiling.",
    note: "A quiet pause in Bangsar.",
  },
  {
    filename: "helmet_on.jpg",
    src: "/photos/helmet_on.jpg",
    alt: "Isyraf wearing a full-face motorcycle helmet beside a roadside parking area.",
    note: "Helmet on, brain off.",
  },
  {
    filename: "bike_at_night.jpg",
    src: "/photos/bike_at_night.jpg",
    alt: "A black-and-green Kawasaki motorcycle parked on a residential street at night.",
    note: "Clean bike photo, finally.",
  },
  {
    filename: "favourite_food.jpg",
    src: "/photos/favourite_food.jpg",
    alt: "Two servings of blue herb rice with grilled meat and vegetables on brown paper.",
    note: "No utensils required.",
  },
];

/* ------------------------------------------------------------------ */
/* Desktop icons (left column, top to bottom)                          */
/* ------------------------------------------------------------------ */

export const desktopIcons: {
  id: DesktopIconId;
  label: string;
  /** Which window this icon opens. */
  opens: WindowId;
  /** Key into the pixel-icon set in DesktopIcon.tsx */
  icon:
    | "person"
    | "briefcase"
    | "envelope"
    | "smiley"
    | "terminal"
    | "folder";
}[] = [
  { id: "about", label: "About Me", opens: "about", icon: "person" },
  { id: "work", label: "My Work", opens: "work", icon: "briefcase" },
  { id: "now", label: "What I'm doing", opens: "now", icon: "terminal" },
  { id: "photos", label: "Photos", opens: "photos", icon: "folder" },
  { id: "contact", label: "Contact", opens: "contact", icon: "envelope" },
  { id: "hire-me", label: "Work with me", opens: "hire", icon: "smiley" },
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
  photos: {
    title: "C:\\isyraf\\photos",
    width: 620,
    height: 460,
    x: 220,
    y: 70,
  },
  hire: {
    title: "C:\\isyraf\\work-with-me.txt",
    width: 520,
    height: 440,
    x: 230,
    y: 120,
  },
};
