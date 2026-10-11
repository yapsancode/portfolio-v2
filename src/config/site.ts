/**
 * site.ts — ALL editable content lives here.
 *
 * Edit this file to change copy, links, projects, icons, and window
 * defaults. Components read from this config; you should never need to
 * touch component logic to update content.
 */

import type { PixelIconName } from "@/components/desktop/PixelIcon";

export type WindowId =
  | "about"
  | "work"
  | "contact"
  | "now"
  | "photos"
  | "hire"
  | "music";

export type DesktopIconId = WindowId | "hire-me";

export type Project = {
  /** Short id — the "file name" in the Work folder and its address bar. */
  slug: string;
  name: string;
  year: string;
  /** One short line shown in the Work folder list. */
  summary: string;
  /** Impact description — lead with what it achieved, not the tech. */
  impact: string;
  /** Optional second paragraph — how it started, or my part in it. */
  story?: string;
  stack: string[];
  /** Screenshot under public/work (16:10). */
  image?: { src: string; alt: string };
  /** For projects with no screen to show: a few plain facts, drawn as a console. */
  console?: string[];
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
  /**
   * The site's main address, used for the canonical link, share tags, and
   * sitemap. Keep the "www": the hosting redirects isyraf-afifi.com to
   * www.isyraf-afifi.com, and this must match where visitors end up.
   */
  url: "https://www.isyraf-afifi.com",
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

  /** The "System Properties" card on the General tab of the About window. */
  profile: {
    photo: {
      src: "/images/about-portrait.webp",
      alt: "Isyraf sitting in a cafe, looking at his phone with a drink in his hand.",
    },
    specs: [
      { label: "System", lines: ["Isyraf 98", "Inspired by Windows 98"] },
      {
        label: "Registered to",
        lines: ["Isyraf Afifi", "Software Engineer", "Shah Alam, Malaysia"],
      },
      {
        label: "Running",
        lines: [
          "Next.js, React, TypeScript",
          "Python, FastAPI, PostgreSQL",
          "Docker, Google Cloud",
        ],
      },
    ],
  },

  /** Music playing while you read this — the track in the music player. */
  music: "Childish Gambino — L.E.S. (instrumental)",
  musicSrc: "/sounds/les-instrumental.mp3",

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

  /** The desktop wallpaper sculpture (decorative, bottom-right). */
  wallpaperImage: {
    src: "/images/greek-male-sculpture.png",
    alt: "",
  },
} as const;

/** Projects in the Work folder, in the order they are listed. */
export const projects: Project[] = [
  {
    slug: "kerjakit",
    name: "KerjaKit",
    year: "2026",
    summary: "AI resume tailor that never invents. A live product with real users.",
    impact:
      "AI resume tailor that never invents: paste a job posting, get an honest match report and an ATS-safe one-page PDF, with in-production checks that block any fabricated skill or number. 28 real users, 36 GitHub stars.",
    story:
      "Started as an open-source CLI that tailored résumés — great, but it needed git, Claude Code, and LaTeX, so only technical people could use it. A Threads post hit 3,000 likes and people kept asking for a web version, so I built one.",
    stack: ["Next.js 16", "React 19", "Supabase", "Tailwind v4", "Typst", "Cloud Run", "DeepSeek"],
    image: {
      src: "/work/kerjakit.webp",
      alt: "KerjaKit's Job Radar page: a list of job matches, each with a fit score, shown with sample data.",
    },
    liveUrl: "https://kerjakit.com",
    codeUrl: "https://github.com/yapsancode/job-kit",
  },
  {
    slug: "baymax",
    name: "Baymax",
    year: "2026",
    summary: "AI guide for Google Cloud deployments. 1st place at Gamuda AI Academy.",
    impact:
      "Chrome extension that walks developers through Google Cloud deployments by highlighting the exact button to click on the live Console. Won 1st place at the Gamuda AI Academy Capstone Demo Day.",
    story:
      "Built with a six-person team. I led the monorepo structure, tooling, and Git workflows, and coached my teammates on pull requests.",
    stack: ["React 19", "FastAPI", "LangChain", "Gemini API", "Supabase", "Chrome Extension (MV3)", "Cloud Run"],
    image: {
      src: "/work/baymax.webp",
      alt: "Title slide of the Baymax presentation: Building a Chrome Extension for Real-Time Website Guidance, by Team Penta.",
    },
    codeUrl: "https://github.com/yapsancode/baymax",
  },
  {
    slug: "klinik-mekar",
    name: "Klinik Mekar",
    year: "2025 – now",
    summary: "Clinic website with online booking, for a paying client.",
    impact:
      "Live website for a 24-hour clinic, built and maintained for a paying client. Patients can book an appointment online, read articles, see the clinic's Google Reviews, and reach it on WhatsApp.",
    story:
      "Work began in October 2025 and I still maintain it. That includes the SEO work: sitemap, structured data, and page titles.",
    stack: ["Next.js 15", "React 19", "Tailwind v4", "Framer Motion", "Vercel"],
    image: {
      src: "/work/klinik-mekar.webp",
      alt: "Klinik Mekar home page, with Book Appointment, Find Doctors, and Emergency buttons.",
    },
    liveUrl: "https://klinikmekar.com",
  },
  {
    slug: "job-radar",
    name: "job-radar",
    year: "2026",
    summary: "Finds tech jobs, scores them with AI, and sends the best to Telegram.",
    impact:
      "Personal automation that finds Malaysian tech jobs, scores each one against my résumé with an LLM, and sends the best ones to my Telegram three times a day.",
    story:
      "It reads more than one job board and removes duplicates. Jobs with a borderline score get a second, full read of the posting before they are kept or dropped.",
    stack: ["Python", "DeepSeek", "Telegram Bot API", "Pydantic", "pytest"],
    console: [
      "53 jobs found",
      "30 kept by location",
      "3 scored 60 or more",
      "digest sent at 09:00, 13:00, 19:00",
    ],
  },
  {
    slug: "mirror-bot",
    name: "Tokyo Paradise Mirror Bot",
    year: "2026",
    summary: "Copies WhatsApp posts into a Telegram group. In testing.",
    impact:
      "Bot that listens to a team's posts in a WhatsApp Community and re-posts them into the matching topics of a Telegram group of about 1,800 members, so the team only has to post in one place. Currently in testing.",
    story:
      "It only listens on WhatsApp and never sends. Direct messages, statuses, and groups that are not on the route list are dropped before anything is saved.",
    stack: ["Node.js 22", "TypeScript", "Baileys", "grammY", "SQLite", "Vitest"],
    console: [
      "WhatsApp Community (listen only)",
      "-> SQLite queue, one job at a time",
      "-> Telegram topics, ~1,800 members",
      "status: in testing",
    ],
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
  /** Key into the pixel-icon set in PixelIcon.tsx */
  icon: PixelIconName;
}[] = [
  { id: "about", label: "About Me", opens: "about", icon: "person" },
  { id: "work", label: "My Work", opens: "work", icon: "briefcase" },
  { id: "now", label: "What I'm doing", opens: "now", icon: "terminal" },
  { id: "photos", label: "Photos", opens: "photos", icon: "folder" },
  { id: "contact", label: "Contact", opens: "contact", icon: "envelope" },
  { id: "hire-me", label: "Work with me", opens: "hire", icon: "smiley" },
];

/* ------------------------------------------------------------------ */
/* Window registry defaults (title, icon, opening size/position)       */
/* ------------------------------------------------------------------ */

export const windowDefaults: Record<
  WindowId,
  {
    title: string;
    /** Small icon in the title bar and on the taskbar button. */
    icon: PixelIconName;
    width: number;
    height: number;
    x: number;
    y: number;
  }
> = {
  about: {
    title: "C:\\isyraf\\about.txt",
    icon: "person",
    // Narrow and to the left, so it opens beside the sculpture's head.
    width: 460,
    height: 370,
    x: 110,
    y: 50,
  },
  work: {
    title: "C:\\isyraf\\work",
    icon: "briefcase",
    width: 620,
    height: 540,
    x: 200,
    y: 60,
  },
  contact: {
    title: "C:\\isyraf\\contact.txt",
    icon: "envelope",
    width: 480,
    height: 420,
    x: 260,
    y: 110,
  },
  now: {
    title: "C:\\isyraf\\now.txt",
    icon: "terminal",
    width: 520,
    height: 420,
    x: 170,
    y: 80,
  },
  photos: {
    title: "C:\\isyraf\\photos",
    icon: "folder",
    width: 620,
    height: 460,
    x: 220,
    y: 70,
  },
  hire: {
    title: "C:\\isyraf\\work-with-me.txt",
    icon: "smiley",
    width: 520,
    height: 440,
    x: 230,
    y: 120,
  },
  // Opened from the taskbar tray and the Start menu; it has no desktop icon.
  music: {
    title: "C:\\isyraf\\player.exe",
    icon: "cd",
    width: 340,
    height: 240,
    x: 900,
    y: 400,
  },
};
