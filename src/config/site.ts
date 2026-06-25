/* ============================================================================
 *  ✏️  EDIT ME — this is the single source of truth for your portfolio.
 *  Everything user-facing (name, tagline, projects, links) lives here.
 *  Change values below; you should not need to touch the components.
 * ========================================================================== */

export const site = {
  /** Your full name. Used for the giant ghosted hero name + <title>. */
  fullName: "Isyraf Afifi",

  /** Initials (kept for the dormant 3D hero variant + the generated icons). */
  initials: "IA",

  /**
   * Production URL — the single source of truth for canonical links, Open
   * Graph/Twitter tags, the sitemap, robots, and JSON-LD structured data.
   *
   * ⚠️ CHANGE THIS to your real domain before launch. On Vercel you can set
   * `NEXT_PUBLIC_SITE_URL` in the project's env vars and it wins automatically
   * (e.g. a custom domain) without editing code. No trailing slash.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://my-website-portfolio.vercel.app",

  /** BCP-47-ish locale for <html lang> stays "en"; this is the OG/HTML locale. */
  locale: "en_US",

  /** Where you're based — fuels Person structured data + local relevance. */
  location: "Malaysia",

  /**
   * SEO keywords. Also feed `Person.knowsAbout` in the JSON-LD, so keep them
   * accurate to what you actually do (search/answer engines cross-check).
   */
  keywords: [
    "Isyraf Afifi",
    "Muhammad Isyraf Afifi",
    "Software Engineer",
    "Fullstack Developer",
    "Frontend Developer",
    "Web Developer Malaysia",
    "Next.js",
    "React",
    "TypeScript",
    "Three.js",
    "FastAPI",
  ],

  /**
   * Centered hero avatar. Drop a transparent-background PNG into /public and
   * point `src` at it (e.g. "/avatar.png"); the SVG below is a placeholder.
   * `alt` is real, meaningful alt text (the avatar is content, not decoration).
   */
  avatar: {
    src: "/avatar.svg",
    alt: "Illustrated portrait of Isyraf Afifi wearing headphones and a hoodie",
  },

  /**
   * Collage revealed by the scroll "slide-up" section after the hero
   * (src/components/ScrollReveal.tsx). Drop images in /public/images and list
   * them here; the grid lays them out automatically (2×2 on mobile, a 4-wide
   * strip on desktop). Add/remove freely — the layout adapts.
   */
  reveal: {
    images: [
      { src: "/images/isyraf-afifi.jpg", alt: "Portrait of Isyraf Afifi" },
      {
        src: "/images/work.jpeg",
        alt: "Coding on a laptop at a café, screens showing a code editor",
      },
      {
        src: "/images/tech-gear.jpeg",
        alt: "A backpack with a laptop and over-ear headphones",
      },
      {
        src: "/images/signboard.jpeg",
        alt: "Road sign for Shah Alam and Klang against a sunset sky in Malaysia",
      },
    ],
  },

  /** Short role label shown in the header / meta row. */
  role: "Software Engineer",

  /** Hero tagline: a light intro line + a heavy statement line. */
  tagline: {
    intro: "I'm a software engineer",
    statement: "building fast, thoughtful interfaces for the web.",
  },

  /** About section copy. Each string is a paragraph. */
  about: [
    "I design and build web applications end to end — from data models and APIs to the pixels people actually touch. I care about systems that stay simple as they grow.",
    "Lately I've been working at the intersection of performant front-end engineering and 3D on the web, where craft and constraints meet.",
  ],

  /** Résumé link (PDF in /public, or an external URL). */
  resumeUrl: "/resume.pdf",

  /** Contact email. */
  email: "muhammadisyrafafifi@gmail.com",

  /**
   * Spotify "now playing" header pill. The live track is fetched server-side
   * via env vars (SPOTIFY_CLIENT_ID / _SECRET / _REFRESH_TOKEN — see
   * .env.example); nothing secret lives here. `profileUrl` is just where the
   * pill links when nothing is playing. Leave it null to skip that link.
   */
  spotify: {
    profileUrl: null as string | null,
  },

  /** Social / meta-row links. Edit, reorder, or remove freely. */
  socials: [
    { label: "GitHub", href: "https://github.com/yapsancode" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/muhammad-isyraf-afifi" },
    { label: "Email", href: "mailto:muhammadisyrafafifi@gmail.com" },
  ],

  /** Projects — a clean, scannable list. `live`/`code` are optional. */
  projects: [
    {
      title: "Esportorium",
      year: "2026",
      description:
        "Full-stack MLBB esports tournament platform — bracket management, team registration, and live match tracking for competitive play.",
      stack: ["Next.js", "FastAPI", "PostgreSQL", "Cloud Run"],
      live: null,
      code: null,
    },
    {
      title: "Baymax",
      year: "2026",
      description:
        "Chrome extension that automates AI model deployment to GCP. RAG pipeline + Gemini integration cuts deploy friction from hours to minutes.",
      stack: ["Chrome Extension", "RAG", "Gemini", "GCP"],
      live: null,
      code: null,
    },
    {
      title: "Medical Clinic Booking Platform",
      year: "2025",
      description:
        "Production booking system serving real patients — appointment scheduling, practitioner management, and clinic ops in one platform.",
      stack: ["Flutter Web", "FastAPI", "PostgreSQL"],
      live: null,
      code: null,
    },
  ],
} as const;

export type Project = (typeof site.projects)[number];
