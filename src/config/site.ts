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
  | "music"
  | "olympus";

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
  tagline: "I build things.",

  email: "muhammadisyrafafifi@gmail.com",
  resumeUrl: "/Muhammad-Isyraf-Resume.pdf",
  socials: [
    { label: "GitHub", url: "https://github.com/yapsancode" },
    { label: "LinkedIn", url: "https://linkedin.com/in/muhammad-isyraf-afifi" },
    { label: "YouTube", url: "https://www.youtube.com/@isyrafafifi" },
  ],

  /** Short, plain-language blurb for the About window. */
  about: [
    "I'm Isyraf. I build things.",
    "Software, mostly. A logistics platform for a major carmaker, built with a team. KerjaKit, which helps people decide which jobs are worth their time.",
    "I run a small studio with a partner. We build websites for businesses that need to be found.",
    "Some weeks I'm in Tokyo, finding things people here can't get.",
    "Lately I've been learning what sits underneath the code. I don't trust what I don't understand.",
    "This desktop wasn't necessary. I built it anyway.",
    "If you have something worth building, you know where to find me.",
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
          "TypeScript, Next.js, Flutter",
          "Python, FastAPI, LangChain",
          "GCP, Docker, Terraform",
          "MCP servers, Cloudflare Workers",
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
      "I find the real problem, build the thing properly, and see it through to real users. If that's what you need, let's talk.",
    wins: [
      "Helped build a production Flutter Web logistics platform for a major carmaker, replacing its legacy SAP screens.",
      "Built KerjaKit end to end: from an open-source résumé CLI to a paid AI product in English and Malay, with job matching and FPX payments.",
      "Co-founded IIDev Studio. Delivered websites and SEO for Malaysian businesses, including a completed engagement for a 24-hour clinic. Now also building interactive 3D product sites and automation tools.",
      "1st place, Gamuda AI Academy × Google Cloud demo day, with Baymax: an AI Chrome extension that guides people through Google Cloud. I owned the architecture and the Git workflow.",
    ],
    note: "Working toward the Google Cloud Associate Cloud Engineer cert, and going deeper into Linux, Docker and CI/CD.",
    cta: "Roles, projects, collaborations: email me. The résumé is here if you need it.",
  },

  /** Copy for Olympus, the desktop asteroids game (olympus.exe). Drafts: rewrite freely. */
  olympus: {
    /** The title screen inside the olympus.exe window. */
    title: {
      presents: "Isyraf 98 presents",
      tagline: "Collect marble. Supply Earth. Survive Olympus.",
      start: "Press Enter to start",
      startTouch: "Tap to start",
      warning: "Windows may crash. Icons may not survive. Everything comes back when you quit.",
    },
    guide: {
      label: "Story & how to play",
      title: "Welcome to Olympus",
      storyTitle: "The desktop has a guardian",
      story: "Earth needs resources to rebuild its cities and orbital stations. Inside Isyraf 98, your pointer becomes a tiny salvage battleship, sent to Olympus to gather its precious marble. Shatter drifting fragments to collect resources for home. But the marble belongs to an ancient guardian with an enormous ego. Every piece you take wakes its anger, and each encounter reveals another power. Fill Earth's supply ships, survive the guardian, and bank your marble. Every ten cleared levels unlocks a chance to spend it on a ship upgrade.",
      missionTitle: "Your mission",
      steps: [
        { title: "Gather resources for Earth", text: "Shoot marble fragments to collect marble automatically. Desktop icons and windows grant salvage bonuses converted to marble and provoke the guardian. Watch the ANGER meter rise." },
        { title: "Take on the guardian", text: "When the statue wakes, shoot the marble still attached to it to drain its health. Each level brings a different power: watch its warning and use the gaps. Orange marble is too hot to break; pale fragments with blue edges can be shot." },
        { title: "Bring Olympus down", text: "Start with three lives and destroy the statue before you lose them all. Finish an attempt to bank your marble, even if you lose. Wins save your next level. Leaving early does not bank that attempt." },
      ],
      resourceTip: "Bank marble for ship refits after levels 10, 20, 30 and beyond. Each milestone unlocks one upgrade choice: an extra life, faster firing, or longer protection after a hit. Only levels 1–6 are playable today; save up for the level 10 expansion. Start Over keeps your bank and upgrades.",
      controlsTitle: "Your controls",
      touch: [
        { title: "Steer", text: "Drag the left joystick toward the direction you want to go. Push farther to move faster; release to brake." },
        { title: "Fire", text: "Hold FIRE with your other thumb to keep shooting. Shots follow the direction your pointer faces." },
        { title: "Pause or leave", text: "Tap Pause, then Resume or Exit to desktop. Rotate your phone or tablet to landscape to play." },
      ],
      keyboard: [
        { title: "Steer", text: "Use ← and → to turn. Hold ↑ to move in the direction you face. Release ↑ to stop immediately." },
        { title: "Fire", text: "Hold Space to keep shooting in the direction your pointer faces. You can turn, thrust, and fire together." },
        { title: "Pause or leave", text: "Press P or Esc to open the pause menu, then choose Resume or Exit to desktop." },
      ],
      tip: "A blinking pointer is briefly protected after a hit. Keep moving when the blinking stops!",
      reassurance: "Everything on the desktop comes back when you exit the game.",
      back: "Back",
      play: "Play Olympus",
    },
    hint: "← → turn · ↑ thrust · Space fire · P pause · Esc menu",
    crash: "{name} has performed an illegal operation and will be shut down.",
    win: {
      title: "It is now safe to turn off your statue.",
      lines: ["The guardian crumbled. Your desktop will be restored."],
    },
    bsod: [
      "A fatal exception 0E has occurred at 0028:C0DE1998 in VXD STATUE(01).",
      "The statue won. Your mouse pointer has been terminated.",
    ],
  },

  /** Tooltip shown when a visitor clicks the shooting star. `{n}` = how many they've caught. */
  shootingStar: {
    milestones: [
      { count: 1, text: "You caught a shooting star. Make a wish." },
      { count: 3, text: "Three. You're getting good at this." },
      { count: 10, text: "Ten stars. Okay, that's enough." },
    ],
    other: "Shooting star caught. That's {n}.",
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
    summary:
      "AI resume tailor that never invents. A live product with real users.",
    impact:
      "Paste a job posting, compare it with your experience, and generate a tailored résumé and cover letter. KerjaKit checks AI output against your profile to catch unsupported claims. Job Radar finds and scores openings, an application tracker keeps the search organised, and FPX payments support the paid product. Available in English and Bahasa Melayu.",
    story:
      "Started as an open-source CLI that tailored résumés — great, but it needed git, Claude Code, and LaTeX, so only technical people could use it. A Threads post hit 3,000 likes and people kept asking for a web version, so I built one.",
    stack: [
      "Next.js 16",
      "React 19",
      "Supabase",
      "Tailwind v4",
      "Typst",
      "Cloud Run",
      "DeepSeek",
      "Gemini",
      "OpenRouter",
      "CHIP (FPX)",
    ],
    image: {
      src: "/work/kerjakit.webp",
      alt: "KerjaKit's Job Radar page: a list of job matches, each with a fit score, shown with sample data.",
    },
    liveUrl: "https://kerjakit.com",
    codeUrl: "https://github.com/yapsancode/job-kit",
  },
  {
    slug: "iidev-studio",
    name: "IIDev Studio",
    year: "2026 – now",
    summary:
      "My studio's website, plus a sales system that Claude can work in.",
    impact:
      "The website and sales system for IIDev Studio, the web studio I co-founded. Enquiries and prospects live in one system on Cloudflare, with instant Telegram alerts, reply-rate tracking, and a rule check on every outreach draft. A Claude connector (an MCP server with 12 tools) lets Claude read enquiries, audit prospects, and save drafts. A person still sends every message.",
    story:
      "I moved the sales pipeline here from Notion. The founder area is locked behind Cloudflare Access, every change made through Claude is marked \"via Claude\" in the record's timeline, and about 178 tests cover it.",
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind v4",
      "Cloudflare Workers",
      "Cloudflare D1",
      "Cloudflare Access",
      "MCP",
      "Vitest",
    ],
    image: {
      src: "/work/iidev-studio.webp",
      alt: "IIDev Studio home page, with the headline \"They search. They find you.\" next to a search box.",
    },
    liveUrl: "https://iidevstudio.com",
  },
  {
    slug: "baymax",
    name: "Baymax",
    year: "2026",
    summary:
      "AI guide for Google Cloud deployments. 1st place at Gamuda AI Academy.",
    impact:
      "Chrome extension that walks developers through Google Cloud deployments by highlighting the exact button to click on the live Console. Won 1st place at the Gamuda AI Academy Capstone Demo Day.",
    story:
      "Built with a six-person team. I was the top committer (183 of 438 commits), led the monorepo structure, tooling, and Git workflows, and coached my teammates on pull requests.",
    stack: [
      "React 19",
      "FastAPI",
      "LangChain",
      "Gemini API",
      "Supabase",
      "Chrome Extension (MV3)",
      "Cloud Run",
    ],
    image: {
      src: "/work/baymax.webp",
      alt: "Title slide of the Baymax presentation: Building a Chrome Extension for Real-Time Website Guidance, by Team Penta.",
    },
    codeUrl: "https://github.com/yapsancode/baymax",
  },
  {
    slug: "rahsia",
    name: "Rahsia",
    year: "2026",
    summary: "Private startup–investor matching with local AI. Hack-day prototype.",
    impact:
      "A prototype that checks whether a startup and investor fit before they share their full profiles. Local AI helps turn notes into structured profiles, and private set intersection compares their criteria. Both sides must agree before the shared overlap is revealed.",
    story:
      "Built for Hacktoberfest Hack Day Kuala Lumpur. The match engine works between two app copies on one laptop; testing between separate laptops and parts of the profile and receipt flow are still unfinished.",
    stack: ["Python", "Ollama", "Gemma", "OpenMined PSI"],
    console: [
      "notes -> reviewed profile",
      "private match -> mutual consent",
      "share the overlap",
      "status: hack-day prototype",
    ],
  },
  {
    slug: "klinik-mekar",
    name: "Klinik Mekar",
    year: "2025 – 2026",
    summary: "Clinic website with online booking. Completed client engagement.",
    impact:
      "Built a website for a 24-hour clinic with online appointment booking, articles, Google Reviews, and WhatsApp contact. Delivered for a paying client; the engagement has ended.",
    story:
      "Work began in October 2025 and included booking flows and SEO: the sitemap, structured data, and page titles. Kept here as a completed example of client work.",
    stack: ["Next.js 15", "React 19", "Tailwind v4", "Framer Motion", "Vercel"],
    image: {
      src: "/work/klinik-mekar.webp",
      alt: "Klinik Mekar home page, with Book Appointment, Find Doctors, and Emergency buttons.",
    },
  },
  {
    slug: "risk-checker",
    name: "Hidden Risk Checker",
    year: "2026",
    summary:
      "MCP server that shows traders when their open trades are the same bet.",
    impact:
      "A read-only MCP server for Claude Desktop that shows retail forex and CFD traders when their open trades are secretly the same bet. It groups trades whose daily moves are closely linked, adjusted for long and short positions, and explains each group in plain words.",
    story:
      "Built in two days as a working demo of MCP for trading. It also checks what one bad day would do, falls back to saved sample data when offline, and ends every risk reply with a \"not financial advice\" line.",
    stack: ["Python 3.11", "MCP SDK", "httpx", "Yahoo Finance", "pytest"],
    console: [
      "4 read-only tools for Claude",
      "forex, gold, oil, indices, crypto",
      "correlation >= 0.5 over ~90 days",
      "sample-data fallback when offline",
    ],
  },
  {
    slug: "devops-coach",
    name: "DevOps Coach",
    year: "2026",
    summary: "An open-source DevOps coach that asks for proof of what you learned.",
    impact:
      "A 12-week, self-paced DevOps program run by an AI coach, open-sourced as a GitHub template. Each morning it sets 3–4 hands-on tasks with a clear \"done when\" check. Each evening it reads your terminal output as proof and asks you to explain what you learned.",
    story:
      "It is built against passive learning: review questions from earlier days, a Friday rebuild from scratch, and honest tracking where a skipped day moves the end date. It covers Linux, networking, Docker, Kubernetes, Terraform, monitoring and CI/CD, then cloud cert prep. One skill file works in Claude Code, Codex and OpenCode.",
    stack: ["Claude Code skills", "Codex", "OpenCode", "Markdown"],
    console: [
      "/coach -> today's tasks",
      "/coach done -> proof check",
      "weeks 1-12: Linux to cloud cert",
      "spaced review + weekly rebuilds",
    ],
    codeUrl: "https://github.com/yapsancode/devops-coach",
  },
  {
    slug: "wedding-invitation",
    name: "Wedding Invitation",
    year: "2026",
    summary: "A 3D envelope, a stationery invitation, and a shared wall of wishes.",
    impact:
      "A custom digital wedding invitation, built under IIDev Studio. A 3D envelope opens into a stationery collage with the event details and directions. Guests can leave wishes, with a shared photo gallery scheduled to open on the wedding day.",
    story:
      "Designed for guests opening a WhatsApp link on their phones. The 3D cover loads only when needed, with an HTML fallback. Wishes sync to a Google Sheet so the family can manage them without a separate admin app.",
    stack: [
      "Astro",
      "TypeScript",
      "Three.js",
      "GSAP",
      "Vercel Functions",
      "Upstash Redis",
      "Vercel Blob",
    ],
    image: {
      src: "/work/wedding-invitation.webp",
      alt: "Wedding invitation card for Hana and Afzan, Saturday 26.12.2026, beside a green envelope and a \"Buka Jemputan\" (open the invitation) button.",
    },
    liveUrl: "https://hanaafzan.iidevstudio.com",
  },
  {
    slug: "halus",
    name: "Halus",
    year: "2026",
    summary: "A 3D knife showroom for an invented brand. Studio concept.",
    impact:
      "A product website for an invented kitchen knife brand. Visitors can turn the knife in 3D, preview a name etched on the blade, and prepare a WhatsApp order or bulk enquiry. A studio concept, not a client commission.",
    story:
      "The knives and product renders were made in Blender. The web pipeline compresses and validates the models, with poster images for the viewer's first frame.",
    stack: ["Vite", "JavaScript", "Blender", "model-viewer", "Three.js", "glTF Transform"],
    console: ["Blender models -> web-ready GLB", "rotate + preview engraving", "WhatsApp order / bulk enquiry", "status: studio concept"],
    liveUrl: "https://www.iidevstudio.com/concept/halus",
  },
  {
    slug: "senja-dental",
    name: "Senja Dental",
    year: "2026",
    summary: "A bilingual dental website built around WhatsApp booking. Concept.",
    impact:
      "A website concept for an invented Malaysian dental clinic, in English and Bahasa Melayu. Opening hours, treatment prices, and WhatsApp booking are easy to find. The clinic is fictional; this demonstrates the kind of site IIDev Studio builds.",
    story:
      "Built with plain HTML and small JavaScript enhancements, including an open-now indicator and a booking message builder.",
    stack: ["HTML", "Tailwind CSS", "JavaScript"],
    console: ["English + Bahasa Melayu", "hours, prices, booking", "WhatsApp message builder", "status: studio concept"],
    liveUrl: "https://www.iidevstudio.com/concept/senjadental",
  },
  {
    slug: "tarik-lagi",
    name: "Tarik Lagi",
    year: "2026",
    summary: "An animated teh tarik website with WhatsApp ordering. Concept.",
    impact:
      "A one-page website for an invented teh tarik stall. Illustrated drinks, prices, and a WhatsApp order builder turn the menu into something visitors can act on. A studio concept, not a real stall or client.",
    story:
      "The tea-pulling illustration moves as you scroll. Built with HTML, CSS, GSAP, and Lenis, without a framework or build step.",
    stack: ["HTML", "CSS", "JavaScript", "GSAP", "Lenis"],
    console: ["illustrated drinks menu", "scroll-driven tea-pulling motion", "menu -> WhatsApp order", "status: studio concept"],
    liveUrl: "https://www.iidevstudio.com/concept/tariklagi",
  },
  {
    slug: "iidev-3d-pipeline",
    name: "IIDev 3D Pipeline",
    year: "2026",
    summary: "Turns 3D source files into web-ready models and preview renders.",
    impact:
      "A command-line pipeline for preparing 3D assets for product websites. It imports a source model, cleans it up, prepares materials, exports a GLB, renders preview images, and checks the result with a glTF validator.",
    story:
      "Built for IIDev Studio's 3D web work. Blender runs in the background; an optional FreeCAD step converts STEP files before they enter the pipeline.",
    stack: ["Python", "Blender", "Node.js", "glTF Validator", "FreeCAD"],
    console: ["source model -> clean up", "materials -> GLB", "preview renders -> validation", "status: internal studio tool"],
  },
  {
    slug: "the-sifu-path",
    name: "The Sifu Path",
    year: "2026",
    summary: "A hands-on software engineering course with quizzes and progress.",
    impact:
      "A shareable learning app with five levels and fourteen modules. Each module combines a lesson, practical tasks, a quiz, and a challenge. XP, streaks, and badges make progress visible, with an optional leaderboard for friends.",
    story:
      "Progress stays in the browser and can be exported or imported. The course works without an account; Supabase is used only for the optional leaderboard.",
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Supabase"],
    console: ["learn -> do -> quiz -> challenge", "5 levels / 14 modules", "local progress + backup", "optional shared leaderboard"],
  },
  {
    slug: "mirror-bot",
    name: "Tokyo Paradise Mirror Bot",
    year: "2026",
    summary: "Copies WhatsApp posts into a Telegram group. In testing.",
    impact:
      "Bot that listens to a team's posts in a WhatsApp Community and re-posts them into the matching topics of a Telegram group of about 1,800 members, so the team only has to post in one place. Currently in testing.",
    story:
      "It only listens on WhatsApp and never sends. Direct messages, statuses, and groups that are not on the route list are dropped before anything is saved. 221 unit tests cover it.",
    stack: [
      "Node.js 22",
      "TypeScript",
      "Baileys",
      "grammY",
      "SQLite",
      "Vitest",
    ],
    console: [
      "WhatsApp Community (listen only)",
      "-> SQLite queue, one job at a time",
      "-> Telegram topics, ~1,800 members",
      "status: in testing",
    ],
  },
  {
    slug: "job-radar",
    name: "job-radar",
    year: "2026",
    summary:
      "Found tech jobs, scored them with AI. Now part of KerjaKit.",
    impact:
      "Personal automation that found Malaysian tech jobs, scored each one against my résumé with an LLM, and sent the best ones to my Telegram three times a day. Paused since September 2026: the idea grew into Job Radar inside KerjaKit.",
    story:
      "It read five job boards and removed duplicates. Jobs with a borderline score got a second, full read of the posting before they were kept or dropped. 249 tests covered it.",
    stack: ["Python", "DeepSeek", "Telegram Bot API", "Pydantic", "pytest"],
    console: [
      "53 jobs found",
      "30 kept by location",
      "3 scored 60 or more",
      "status: paused, now in KerjaKit",
    ],
  },
  {
    slug: "ezbiz-buddy",
    name: "EzBiz Buddy",
    year: "2026",
    summary: "AI guide for registering a business with SSM. Discontinued.",
    impact:
      "A Chrome extension side panel that helped Malaysians register a business on SSM's ezbiz portal. It answered questions from official SSM documents and highlighted the right button or field on the live portal. A working prototype, built in three days. Discontinued.",
    story:
      "Answers came from 1,036 chunks of official SSM guides and web pages, searched with Gemini embeddings and MongoDB Atlas Vector Search. It had its own sign-in, a free tier of 5 questions a day, and 17 tests.",
    stack: [
      "Chrome Extension (MV3)",
      "React 19",
      "FastAPI",
      "LangChain",
      "DeepSeek",
      "Gemini embeddings",
      "MongoDB Atlas",
    ],
    console: [
      "1,036 chunks of official SSM docs",
      "vector search -> DeepSeek answer",
      "free tier: 5 questions a day",
      "status: discontinued",
    ],
  },
  {
    slug: "esportorium",
    name: "Esportorium",
    year: "2025 – 2026",
    summary: "Mobile Legends tournament finder for Malaysia. Discontinued.",
    impact:
      "A site where players in Malaysia found Mobile Legends esports tournaments. Organisers submitted events, and an admin approved them before they went live. Discontinued.",
    story:
      "Each organiser could only ever see their own data, and a test in CI proved it against a real PostgreSQL database. An AI step turned messy tournament details into a draft listing, with an accuracy check in CI that had to pass before a change could ship.",
    stack: [
      "Next.js 16",
      "TypeScript",
      "FastAPI",
      "PostgreSQL (Supabase)",
      "Docker",
      "Cloud Run",
      "GitHub Actions",
      "OpenTelemetry",
    ],
    console: [
      "organiser data isolated, tested in CI",
      "AI draft listings, eval gate in CI",
      "62 pytest tests",
      "status: discontinued",
    ],
    codeUrl: "https://github.com/yapsancode/esportorium",
  },
  {
    slug: "opencode-bridge",
    name: "OpenCode Bridge",
    year: "2026",
    summary: "Ran Claude Code on open models via OpenCode Go. Not in use now.",
    impact:
      "A small API bridge so Claude Code could run open models through OpenCode Go. It translates the Anthropic message format to the OpenAI format and back, including streaming and tool calls.",
    story:
      "A FastAPI proxy translates Claude's message format to the OpenAI format and back, including streaming and tool calls, and LiteLLM routes the calls. I don't use it now, but I may come back to it.",
    stack: ["Python", "FastAPI", "LiteLLM"],
    console: [
      "Claude Code -> bridge -> OpenCode Go",
      "Anthropic <-> OpenAI format",
      "streaming + tool calls",
      "status: not in use",
    ],
    codeUrl: "https://github.com/yapsancode/claudecode-X-opencode",
  },
  {
    slug: "socialos",
    name: "SocialOS",
    year: "2026 – now",
    summary: "A social content workspace for multiple brands. In development.",
    impact:
      "Building a workspace for managing several brands' social content. The current foundation handles authenticated workspaces, brands, and brand facts. Research, drafting, approval, and publishing integrations are still ahead.",
    story:
      "The intended workflow keeps a person in charge of every public post. Built on Cloudflare Workers and D1, with a React interface. This is an early build, not a finished publishing platform.",
    stack: ["React", "TypeScript", "Vite", "Hono", "Cloudflare Workers", "Cloudflare D1", "Vitest"],
    console: ["workspaces + brands + brand facts", "research and publishing: planned", "human approval before posting", "status: in development"],
  },
  {
    slug: "radar-distill",
    name: "radar-distill",
    year: "2026 – now",
    summary: "Exploring a smaller model for job-fit scoring. Research in progress.",
    impact:
      "A research project asking whether a small specialist model can judge job requirements like the larger model used in KerjaKit's Radar. The aim is to reduce inference cost without hiding good matches.",
    story:
      "The current work documents the problem and evaluation plan. Training and measured results are still ahead. The planned dataset pairs synthetic résumés with real job ads and teacher-model labels.",
    stack: ["Python", "LLM evaluation", "Model distillation research"],
    console: ["job ad + synthetic resume", "teacher labels -> student model", "measure missed matches + cost", "status: research; training ahead"],
  },
  {
    slug: "qalam",
    name: "Qalam",
    year: "2026 – now",
    summary: "Jawi handwriting research, starting with an OCR diagnostic.",
    impact:
      "An early research project toward a Jawi handwriting dataset and tutor. The proposed tutor checks writing against a known letter or word, collecting labelled strokes that could later support handwriting recognition.",
    story:
      "The repository contains planning materials and a diagnostic notebook for comparing OCR models against human-checked Jawi text. The dataset and tutor are not built yet; reliable ground truth comes first.",
    stack: ["Python", "Jupyter", "OCR evaluation", "Google Colab"],
    console: ["Jawi samples + human transcription", "compare OCR character error rates", "dataset + tutor: planned", "status: early research"],
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
    label: "SocialOS",
    detail:
      "Building the foundations of a workspace for multiple brands: accounts, brand facts, and a future content workflow with human approval before publishing.",
  },
  {
    label: "AI agents",
    detail:
      "Deepening LLM-systems engineering: agent evaluation, retrieval, and tool use.",
  },
  {
    label: "Qalam — Jawi handwriting ML",
    detail:
      "Preparing a diagnostic to compare OCR models against human-checked Jawi text. The dataset and tutor are still planned; getting reliable labels comes first.",
  },
  {
    label: "radar-distill",
    detail:
      "Exploring whether a smaller model can learn KerjaKit's job-fit judgements. Documenting the problem and evaluation plan before training.",
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
  { id: "olympus", label: "Olympus", opens: "olympus", icon: "olympus" },
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
  // A Win98 warning dialog; Start runs the game over the whole desktop.
  olympus: {
    title: "C:\\isyraf\\games\\olympus.exe",
    icon: "olympus",
    width: 480,
    height: 600,
    x: 300,
    y: 140,
  },
};
