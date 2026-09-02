# Personal Site Audit

Audit date: 3 September 2026

Repository: `C:\Users\isyra\Documents\coding_projects\my-website-portfolio`

Audited revision: `main` at `91f2f45` (`Refresh KerjaKit copy and add its origin story`)
Live site: <https://www.isyraf-afifi.com/>

## Audit basis

This audit is based on:

- the live homepage and every available window on desktop;
- responsive checks at 390 × 844 and 320 × 568;
- the current repository, including its content model, components, styling, metadata, sitemap, manifest, and generated social image;
- the repository history where it reveals material that existed before the Windows 98 rebuild;
- a clean production build and lint run.

No site code was changed. The build succeeds. Lint reports one non-blocking warning in `src/app/opengraph-image.tsx:152` about the raw `<img>` used inside the generated image.

## Executive diagnosis

The site already has a strong personal artifact: a hand-built Windows 98 desktop floating in space, complete with draggable windows, a Start menu, an opt-in soundtrack, and a deliberately odd sculpture. It is far more memorable than a standard portfolio template.

The problem is that the memorable shell currently wraps a recruiter-first information architecture. The five primary choices are **About Me**, **My Work**, **What I'm doing**, **Contact**, and **Hire Me!**. The page title, social preview, manifest, structured data, résumé CTA, and much of the About copy repeatedly position Isyraf as an early-career software engineer seeking a role. Meanwhile, the first screen does not actually say who Isyraf is or what he builds.

The result is a mismatch:

- Visually, it says “personal internet artifact.”
- Structurally and verbally, it says “job application with a theme.”
- The strongest builder evidence—KerjaKit's origin story, real users, distribution via Threads, Qalam, Baymax, Esportorium, and other experiments—is either buried or absent.

The redesign should preserve the desktop metaphor while changing what the desktop is *for*: from navigating a résumé to exploring an active workshop.

## Current site map and content model

There is only one public content route, `/`. `src/app/page.tsx` renders `Desktop`, and the five “sections” are client-side windows rather than pages or addressable URLs.

| Entry point | Window/component | What it currently contains |
| --- | --- | --- |
| About Me | `AboutWindow.tsx` | Six-paragraph career narrative, role/tagline, soundtrack credit, design inspiration |
| My Work | `WorkWindow.tsx` | One project: KerjaKit |
| What I'm doing | `NowWindow.tsx` | DevOps study, AI agents, Qalam, and KerjaKit growth |
| Contact | `ContactWindow.tsx` | Email, GitHub, LinkedIn, YouTube |
| Hire Me! | `HireWindow.tsx` | Interview pitch, résumé, proof points |

The Start menu mirrors the same five items. On desktop, icons require a double-click; the Start menu and keyboard provide single-action fallbacks. On touch devices, icons open with one tap and windows become full-screen dialogs.

---

## 1. Homepage and positioning

### 1.1 The first screen has atmosphere but no identity

- **Current state:** The live first screen shows a star field, a large back-facing sculpture, five desktop icons, and a taskbar. There is no visible name, role, sentence, or instruction. In the initial DOM there is no `<h1>` and the readable body text is essentially the icon labels and taskbar. See `src/components/desktop/Desktop.tsx:268-326`.
- **Why it works / doesn't work:** The restraint makes the reveal intriguing, but every audience has to infer both who owns the site and how to use it. A social visitor gets mood without identity; a recruiter gets no immediate credibility; a potential collaborator gets no idea what kind of work is possible. The strongest positioning is hidden behind an interaction.
- **Recommendation:** Keep the desktop, but add an always-visible orientation layer. The most native options are a small boot/welcome window opened by default, a pinned `README.txt`, or desktop wallpaper copy such as: “Isyraf Afifi — building useful software, AI experiments, and small internet businesses from Shah Alam.” Include a short “double-click an icon” cue on pointer devices. This should orient, not become a conventional full-width portfolio hero.
- **Priority:** **High**

### 1.2 “Hire Me!” makes the job search the site's loudest intent

- **Current state:** `Hire Me!` is one of five desktop icons and uses the brightest, most playful icon. Its window begins “Now interviewing for,” ends with a résumé CTA, and is duplicated in the Start menu. See `src/config/site.ts:58-71`, `src/config/site.ts:131-135`, and `src/components/window/HireWindow.tsx:6-36`.
- **Why it works / doesn't work:** It makes the employment path unmissable, which is useful for recruiters. But because it has equal status with About and Work, the entire site reads as a themed application. It also excludes clients and collaborators: “hire” implies employment rather than building together, advising, contracting, partnering, or simply talking.
- **Recommendation:** Remove `Hire Me!` from the primary desktop. Replace it with a broader **Work with me**, **Let's build**, or **Open to** window that explicitly serves three paths: roles, product/client collaboration, and project/community collaboration. Keep the résumé as a secondary link inside that window or Contact rather than as the site's primary emotional climax.
- **Priority:** **High**

### 1.3 The top-level nouns are generic portfolio nouns

- **Current state:** The primary labels are “About Me,” “My Work,” “What I'm doing,” “Contact,” and “Hire Me!” (`src/config/site.ts:130-136`).
- **Why it works / doesn't work:** They are clear, but they reproduce the standard About/Projects/Contact portfolio skeleton. The Windows metaphor creates permission to use more ownable, builder-oriented labels, yet the information architecture does not take advantage of it.
- **Recommendation:** Recast the desktop as a working machine. A concrete set based on the existing content would be: `START_HERE.txt`, `SHIPPED/`, `LAB/`, `NOW.txt`, `LIFE/`, and `WORK_WITH_ME.txt`. Human-readable labels can remain beneath the icons, but the conceptual buckets should separate production work from experiments and personal life.
- **Priority:** **High**

### 1.4 The current tagline is memorable but not informative

- **Current state:** The tagline is “Open. Ship. Close. Repeat.” (`src/config/site.ts:29`) and only appears after opening About.
- **Why it works / doesn't work:** It has rhythm and matches the window metaphor. However, “close” can imply abandoning projects, and the line says nothing about products, AI/automation, business, Malaysia, or what Isyraf uniquely builds.
- **Recommendation:** Keep it as a secondary easter-egg or status line, not the main positioning. Pair it with a descriptive sentence that earns clarity first. For example: “I build small software products and AI experiments, then learn the systems needed to keep them alive.”
- **Priority:** **Medium**

### 1.5 The audience paths are not differentiated

- **Current state:** Recruiters, clients, collaborators, social followers, and curious visitors all enter the same empty desktop and must explore the same windows.
- **Why it works / doesn't work:** Open exploration suits a personal site, but high-intent visitors need fast answers. A recruiter wants proof and a résumé; a client wants capabilities and a way to scope work; a collaborator wants active projects and specific asks; a social visitor wants personality and recent activity.
- **Recommendation:** Put lightweight audience routes inside the default welcome window rather than adding corporate navigation. Suggested links: **See what I shipped**, **What I'm exploring**, **Build something together**, and **The non-software stuff**. Each should open the relevant window or deep link.
- **Priority:** **Medium**

## 2. About section and copywriting

### 2.1 The About voice is candid and specific—keep that

- **Current state:** The About copy mentions Shah Alam, the path from Flutter/web into AI, a production platform for Malaysia's largest carmaker, and the desire to understand the route from app to reliable deployment (`src/config/site.ts:40-47`).
- **Why it works / doesn't work:** This is much stronger than generic “passionate developer” copy. It sounds like a real person, establishes a technical arc, and contains concrete proof without inflating expertise. The phrases “getting them running for real people” and “the app to the deployment” are good foundations for a builder identity.
- **Recommendation:** Preserve the plain-spoken first-person voice and the Malaysia-specific details. Edit for compression and confidence rather than replacing it with polished brand language.
- **Priority:** **High**

### 2.2 The About section over-invests in disclaimers

- **Current state:** Two of six paragraphs dwell on not fully understanding deployment, being early in the career, not knowing where to fit, and not being an expert (`src/config/site.ts:44-46`). The Hire window repeats the same gap-aware framing (`src/config/site.ts:62-70`).
- **Why it works / doesn't work:** Honesty builds trust, but repeated self-qualification changes the reader's takeaway from “curious builder” to “candidate explaining weaknesses.” It also makes learning sound remedial when the actual evidence—shipping products, users, a demo-day win, production experience—supports a more active story.
- **Recommendation:** Keep one concise line of humility, then show the learning loop through action. For example: “I could deploy products before I could explain every layer, so I'm fixing that by rebuilding the fundamentals in public.” Follow it with what was built, measured, or learned. Remove “still figuring out where I fit” from the core identity; the breadth is the identity.
- **Priority:** **High**

### 2.3 The About section is a career chronology, not a portrait

- **Current state:** Nearly every paragraph is about software, infrastructure, skills, or career direction. Personal context is limited to Shah Alam and the soundtrack credit.
- **Why it works / doesn't work:** It establishes technical credibility, but it cannot fulfill the stated goal of representing interests outside software. The reader learns what Isyraf is studying but not what he notices, enjoys, values, or does away from a keyboard.
- **Recommendation:** Cut the career story to roughly half its current length and add a distinctly non-CV paragraph or separate `LIFE/` window. The repository history already contains source material: mosque stillness, waterfalls with friends, Shah Alam–Klang roads, motorcycling, an eclectic music taste, and a “Beyond the code” gallery. Reuse the truths, not necessarily the old gallery design or old copy.
- **Priority:** **High**

### 2.4 The most distinctive local threads are underused

- **Current state:** The current site mentions Shah Alam, Malaysia, Qalam/Jawi, a Malaysian carmaker, and a Malaysian esports product, but those details are scattered or absent from Work.
- **Why it works / doesn't work:** These are more memorable than another list of Next.js and FastAPI skills. Qalam, Mobile Legends communities, local clinic software, and products made for Malaysian users provide a coherent point of view: building technology from and for a specific place.
- **Recommendation:** Make the Malaysian context a recurring lens, not a location footnote. Surface Qalam and Esportorium, retain Shah Alam in the intro, and explain the local problem behind each product. This differentiates the site without forcing a narrow niche.
- **Priority:** **Medium**

### 2.5 “Currently exploring opportunities” is a disguised job-seeker line

- **Current state:** The Now window says it is “The honest version of ‘currently exploring opportunities’” (`src/components/window/NowWindow.tsx:6-10`).
- **Why it works / doesn't work:** The joke is self-aware, but it imports LinkedIn/recruiting language into one of the most personal sections. The actual list is good and deserves to stand on its own.
- **Recommendation:** Replace the subline with an update philosophy: “A dated snapshot so this site doesn't pretend I'm doing everything forever.” Retain the visible update date and make it easy to refresh.
- **Priority:** **Medium**

### 2.6 The soundtrack is personal, but the implementation deserves a content decision

- **Current state:** The taskbar offers opt-in playback of a 6.2 MB `Childish Gambino — L.E.S. (instrumental)` file. `preload="none"` means it does not burden the initial page load (`SoundToggle.tsx:5`, `SoundToggle.tsx:47-60`).
- **Why it works / doesn't work:** It is one of the few genuinely personal, surprising touches and fits the “internet home” goal. However, the track is mostly treated as aesthetic wallpaper, and distributing a commercial instrumental from the site's own `/public` directory may create rights concerns.
- **Recommendation:** Keep the music affordance, but use audio you own or have permission to host, or link/embed through an authorized source. Consider turning it into a small “currently in rotation” or listening-note window so it communicates taste rather than just ambience.
- **Priority:** **Medium**

## 3. Projects and technical credibility

### 3.1 One project cannot support the stated builder identity

- **Current state:** `projects` contains only KerjaKit (`src/config/site.ts:81-93`), so “Things I've shipped” shows one large text card.
- **Why it works / doesn't work:** KerjaKit is credible, but a single résumé tool makes the site look like a candidate who has one showcase project. It does not demonstrate products plural, AI experiments, automation, side businesses, client/production work, or range outside the current job-search theme.
- **Recommendation:** Build a deliberately edited portfolio of 4–6 items, not an exhaustive repository dump. Based on material already in this repository's history, the strongest mix is likely: **KerjaKit** (product/distribution), **Baymax** (AI agent + demo-day win), **Qalam** (research/data + collaboration ask), **Esportorium** (local niche/business), and one contrasting production or hardware project such as the clinic booking system or ESP32 speed monitor. Put smaller work in `LAB/` or an archive.
- **Priority:** **High**

### 3.2 The repository already contains the missing breadth—in history

- **Current state:** Before the Windows 98 rebuild, `src/config/site.ts` listed Baymax, KerjaKit, Esportorium, a clinic booking platform, The Sifu Path, a Claude Code/OpenCode bridge, an ESP32 speed monitor, and an AI poster pipeline. The prior site also had a photo gallery and Now Playing component. Commit `8be5387` deleted that material before `39e8998` rebuilt the site.
- **Why it works / doesn't work:** The current narrowness could be misread as a lack of work. In reality, the redesign discarded useful source material along with the old UI. This is encouraging: the next iteration needs curation and migration more than content invention.
- **Recommendation:** Treat the old config as a content inventory. Verify what is still accurate, choose a hierarchy, and rewrite the surviving entries in the newer, more honest voice. Do not restore eight equal “project cards”; distinguish flagship products, experiments, client/professional work, and archived learning.
- **Priority:** **High**

### 3.3 KerjaKit's origin story is the best existing proof of a product mindset

- **Current state:** The card explains the initial CLI constraint, the Threads post with 3,000 likes, demand for a web version, 28 real users, 34 GitHub stars, anti-fabrication checks, and the resulting product (`src/config/site.ts:83-91`).
- **Why it works / doesn't work:** This tells a full builder story: problem, first version, distribution signal, user demand, product adaptation, and trust constraint. It demonstrates more than code and should become the template for flagship work.
- **Recommendation:** Keep all of those ingredients, but restructure them for scanning: **Why it exists**, **What changed after users responded**, **Proof**, **What I owned**, and **What's next**. Let the technology stack be supporting evidence rather than the center of the card.
- **Priority:** **High**

### 3.4 The Work UI is text-heavy and visually interchangeable

- **Current state:** A project is rendered as a grey inset panel containing two paragraphs, seven small stack labels, and two text links (`src/components/window/WorkWindow.tsx:5-50`). There is no product screenshot, logo, interaction, status, or visual artifact.
- **Why it works / doesn't work:** The Win98 treatment is coherent and readable, but the product itself is not visible. The stack badges make the presentation resemble a standard engineering portfolio even though the copy is product-oriented.
- **Recommendation:** Keep the window chrome, but let each flagship project open its own “program” or folder with a screenshot, short demo/GIF, changelog, user signal, and links. On the list view, show one sentence, status, and one memorable metric. Move stack details into a collapsible “properties” panel or footer.
- **Priority:** **Medium**

### 3.5 Project metrics will become stale silently

- **Current state:** User and GitHub-star counts are hard-coded into prose (`src/config/site.ts:85-88`). The Now date is also hard-coded in the component rather than in the content config (`src/components/window/NowWindow.tsx:8`).
- **Why it works / doesn't work:** Real numbers are excellent proof, but stale numbers make an active builder site feel abandoned. Embedding them inside sentences makes maintenance easy to forget.
- **Recommendation:** Store metrics and `lastUpdated` as structured fields. Either update them manually on a visible cadence or fetch non-critical public metrics at build time with a safe fallback. Do not make live API availability a requirement for rendering.
- **Priority:** **Medium**

### 3.6 Professional work is asserted but not presented as work

- **Current state:** The About and Hire copy mention a production Flutter Web platform for Malaysia's largest carmaker, but Work contains only KerjaKit. There is no NDA-safe professional case entry.
- **Why it works / doesn't work:** Recruiters and clients see the claim, but cannot assess scope, constraints, ownership, or impact. Conversely, putting it only in Hire makes it feel like a résumé bullet rather than part of the builder's body of work.
- **Recommendation:** Add an anonymized “selected professional work” file with context that is safe to share: the legacy problem, users/stakeholders, what Isyraf owned, migration/production constraints, and outcome. Clearly label unavailable screenshots or metrics rather than omitting the work entirely.
- **Priority:** **Medium**

## 4. Navigation, interaction, mobile UX, and accessibility

### 4.1 Desktop double-click is thematic but undiscoverable

- **Current state:** On fine-pointer devices, a single click only selects an icon; the second click within 350 ms opens it (`src/components/desktop/DesktopIcon.tsx:101-125`). There is no on-screen instruction. Keyboard activation and the Start menu open with one action.
- **Why it works / doesn't work:** It faithfully evokes a desktop and rewards exploration. But web users expect single-click activation, and the lack of feedback beyond a dotted selection border can look like a broken link—especially to a rushed recruiter or a younger mobile-first visitor.
- **Recommendation:** Preserve double-click as an easter-egg behavior only if a visible cue explains it. A better compromise is single-click to open and double-click to trigger a small flourish, or single-click labels/buttons with optional desktop selection behavior elsewhere.
- **Priority:** **High**

### 4.2 The Start menu is a useful fallback worth keeping

- **Current state:** The Start button exposes all five windows with conventional single-click buttons (`src/components/desktop/Taskbar.tsx:66-109`). Open windows also appear in the taskbar and can be focused/minimized.
- **Why it works / doesn't work:** This makes the playful shell functional rather than decorative. It gives repeat visitors a fast path and supports the operating-system metaphor.
- **Recommendation:** Keep the Start menu and taskbar. When the information architecture changes, use Start as the complete directory while the desktop shows only the most important 5–6 items. Consider adding one-line descriptions or grouping for `Projects`, `Lab`, `Life`, and `Connect`.
- **Priority:** **Medium**

### 4.3 The mobile fallback is thoughtful and mostly successful

- **Current state:** Mobile/coarse-pointer detection changes icons to single tap and opens one full-screen, non-draggable window at a time (`src/components/desktop/Desktop.tsx:189-225`; `src/components/window/Window.tsx:124-136`). At 390 × 844 and 320 × 568, the home icons and taskbar fit, and About/Work content remains readable and scrollable.
- **Why it works / doesn't work:** This avoids trying to force tiny draggable desktop windows onto touch screens. It is one of the strongest implementation decisions in the current site.
- **Recommendation:** Preserve the one-window-at-a-time mobile model. Redesign mobile as a deliberate “file viewer” experience rather than a shrunken desktop, especially once more sections and project media are added.
- **Priority:** **High**

### 4.4 Mobile close controls are far too small

- **Current state:** `.win-titlebtn` is 18 × 16 px (`src/app/globals.css:101-115`). On mobile it is the only visible way to exit the full-screen dialog (`src/components/window/Window.tsx:77-114`, `124-136`).
- **Why it works / doesn't work:** It is visually authentic to Windows 98, but a 16 px-high touch target is easy to miss and fails modern touch ergonomics. The cost is higher on mobile because closing is required to reach any other section.
- **Recommendation:** Keep the 18 × 16 visual glyph but place it inside an invisible or matching 44 × 44 touch target on coarse pointers. Also support a clear back gesture/button in the mobile title bar.
- **Priority:** **High**

### 4.5 The mobile “modal” does not manage focus as a modal

- **Current state:** The mobile window has `role="dialog"` and `aria-modal="true"`, but there is no focus transfer, focus trap, background `inert`, or focus return logic. The underlying desktop navigation and taskbar remain in the DOM and focusable (`src/components/window/Window.tsx:124-136`; `src/components/desktop/Desktop.tsx:289-326`).
- **Why it works / doesn't work:** Sighted touch use is fine, but keyboard and screen-reader users can move into controls visually hidden behind the full-screen dialog. The semantics promise modal behavior that the interaction does not fully provide.
- **Recommendation:** Move focus to the window heading or close button when opened, make the background inert while a mobile window is active, trap focus inside, and return focus to the launching icon on close. Alternatively, make mobile sections route-based screens rather than dialogs.
- **Priority:** **Medium**

### 4.6 Motion and keyboard support are better than the visual gimmick suggests

- **Current state:** Icons can open with Enter/Space, Escape closes the focused desktop window, windows have labelled controls, and `prefers-reduced-motion` disables star, shooting-star, and window animations (`src/app/globals.css:403-412`).
- **Why it works / doesn't work:** These details make the concept more robust and should not be lost during redesign. The reduced-motion handling is especially important because the background otherwise animates continuously.
- **Recommendation:** Preserve these behaviors and extend them to any new window/app. Add visible focus styles to title-bar controls and test reading/order when multiple desktop windows overlap.
- **Priority:** **Medium**

## 5. Visual tone and UI

### 5.1 The Windows 98 system is distinctive and internally coherent

- **Current state:** The site implements custom four-tone bevels, title bars, pixel icons, scrollbars, Start menu, clock, window state, dragging/resizing, minimize/maximize behavior, and a taskbar. It is not a superficial background treatment.
- **Why it works / doesn't work:** The level of implementation itself demonstrates technical credibility. It feels built, not templated, and gives people something to remember and talk about.
- **Recommendation:** Keep the operating-system metaphor as the site's core interaction language. The repositioning does not require replacing it with a conventional editorial layout; it requires more useful “files and programs” and a clearer boot state.
- **Priority:** **High**

### 5.2 The statue is visually dominant but personally unexplained

- **Current state:** A back-facing Greek male sculpture occupies most of the wallpaper on desktop and mobile (`src/config/site.ts:74-78`; `src/components/desktop/Desktop.tsx:274-287`). It is decorative with an empty alt attribute.
- **Why it works / doesn't work:** It creates drama and pairs well with the space background, but it could belong to many AI, fitness, crypto, or “stoic developer” brands. Because there is no story connecting it to Isyraf, the most prominent visual says less about him than the tiny icons do.
- **Recommendation:** Either give the statue meaning inside the site's lore or replace it with a more ownable artifact: a personal photo treated as desktop wallpaper, a collage of project/product screens, a photographed desk or motorcycle, or a rotating wallpaper built from real life and project images. The goal is not “more professional”; it is more unmistakably Isyraf.
- **Priority:** **Medium**

### 5.3 The space/Win98/statue combination is memorable but not yet a system for content

- **Current state:** The wallpaper is expressive, while opened windows revert to dense white documents and grey cards. Project content and personal content receive the same visual treatment.
- **Why it works / doesn't work:** The contrast helps readability, but the shell carries nearly all the personality. Once a window opens, the site feels closer to a plain résumé document.
- **Recommendation:** Use different native “applications” for different content: Explorer for projects, Notepad for Now/notes, Media Player for music/life, Properties dialogs for stacks, and a terminal/log for experiments. This adds character through information design rather than extra decoration.
- **Priority:** **Medium**

### 5.4 The site needs a content hierarchy before more polish

- **Current state:** Every desktop icon has similar visual weight, every project is intended to use the same card, and the default state gives the decorative wallpaper the greatest prominence.
- **Why it works / doesn't work:** The interface is polished enough to be convincing, but it does not tell the reader which work matters most or where to start.
- **Recommendation:** Prioritize hierarchy over visual refinement: one welcome state, 2–3 flagship projects, a separate lab/archive, a dated Now file, and one personal-life surface. Only then refine wallpapers, icons, and micro-interactions.
- **Priority:** **High**

## 6. SEO, metadata, crawlability, and social preview

### 6.1 The important content is absent from the initial document state

- **Current state:** Windows begin as an empty client-side array (`src/components/desktop/Desktop.tsx:49`, `206-208`). About and project content is only mounted after an icon interaction. Live inspection found no initial `<h1>` and only navigation/taskbar text in the body.
- **Why it works / doesn't work:** Search engines can execute JavaScript, but they will not reliably explore a simulated desktop by double-clicking icons. Answer engines, link unfurlers, no-JS users, and accessibility tools receive little of the site's substantive content. This also means KerjaKit's copy is not naturally discoverable from the homepage document.
- **Recommendation:** Render meaningful intro and selected-project content in the initial HTML. It can be visually presented inside a default open window or duplicated in a semantically available, non-cloaked content layer. Better still, add real routes for flagship projects and notes while keeping the OS shell as navigation.
- **Priority:** **High**

### 6.2 There are no deep links to windows or projects

- **Current state:** `/` is the only content page in `src/app`; the sitemap contains one URL (`src/app/sitemap.ts:3-12`). Opening Work, About, or KerjaKit does not change the URL.
- **Why it works / doesn't work:** Visitors cannot share “Isyraf's KerjaKit case study” or return directly to Qalam/Now. Search results can only rank the homepage, and every social preview must be generic.
- **Recommendation:** Add addressable routes such as `/projects/kerjakit`, `/projects/baymax`, `/lab/qalam`, and `/now`, or at minimum stable URL state such as `/desktop?open=work` plus crawlable project routes. Route pages can still render as windows within the desktop on wide screens.
- **Priority:** **High**

### 6.3 The primary metadata contains a grammatical identity bug

- **Current state:** `site.name` is `"Isyraf's Website"`, and the description interpolates it into `"Isyraf's Website is a software engineer..."` (`src/config/site.ts:25-29`; `src/app/layout.tsx:17-22`). The live title is “Isyraf's Website — Software Engineer.”
- **Why it works / doesn't work:** The description is grammatically wrong and weakens exact-name discovery. “Isyraf's Website” is a site label, not the person's name or a useful brand phrase.
- **Recommendation:** Separate `personName`, `siteName`, and `positioningLine` in the content model. Use “Isyraf Afifi” in the title and description, and write metadata around the builder identity rather than only the job title.
- **Priority:** **High**

### 6.4 Structured data identifies the person as “Isyraf's Website”

- **Current state:** The `Person` JSON-LD sets `name: site.name`, so the person's structured name is `"Isyraf's Website"` (`src/app/layout.tsx:57-63`). It lists KerjaKit and Esportorium in `sameAs` alongside actual profile URLs (`src/app/layout.tsx:86-91`).
- **Why it works / doesn't work:** This is machine-readable identity data and should be precise. Projects are works/products owned or created by the person, not necessarily identity-equivalent profiles.
- **Recommendation:** Set the Person name to “Muhammad Isyraf Afifi” or the consistently used public name. Keep true identity profiles in `sameAs`; model flagship products with `SoftwareApplication`, `Product`, or `CreativeWork` entities connected via `creator`/`author`/`founder`, as appropriate and truthful.
- **Priority:** **High**

### 6.5 Canonical and sitemap URLs point to a redirecting hostname

- **Current state:** Metadata and the sitemap use `https://isyraf-afifi.com`, while production redirects that hostname to `https://www.isyraf-afifi.com/`. The live canonical therefore points to a URL that redirects (`src/app/layout.tsx:13-16`, `35-45`; `src/app/sitemap.ts:4-8`).
- **Why it works / doesn't work:** Search engines can usually consolidate this, but the canonical should normally be the final 200 URL. Inconsistent hostnames create avoidable ambiguity across canonical, Open Graph, sitemap, and runtime URLs.
- **Recommendation:** Choose the production `www` URL as the single base everywhere, or change hosting so the chosen non-`www` canonical is the final URL. Do not mix them.
- **Priority:** **Medium**

### 6.6 `robots.txt` is missing even though meta robots is present

- **Current state:** The live `/robots.txt` returns 404. `layout.tsx` does emit `index, follow`, and `/sitemap.xml` is available.
- **Why it works / doesn't work:** The site remains indexable, so this is not an emergency. But a real robots file is the conventional place to advertise the sitemap and define crawl policy, and the previous version had `src/app/robots.ts` before it was deleted in commit `8be5387`.
- **Recommendation:** Restore a simple `robots.ts` that allows normal crawling and points to the final-hostname sitemap.
- **Priority:** **Low**

### 6.7 The social preview reinforces the old positioning and has a weak crop

- **Current state:** The generated card says “Isyraf Afifi / Software Engineer / code → cloud → production” (`src/app/opengraph-image.tsx:179-232`). Live inspection showed the sculpture reduced to a small, partially visible head near the lower edge rather than the intended upper-body hero. The alt is “Isyraf Afifi — Software Engineer” (`src/app/opengraph-image.tsx:7`).
- **Why it works / doesn't work:** The card is clean and consistent with the wallpaper, but it is more formal and generic than the live interface, and it narrows Isyraf to a role. The weak sculpture crop wastes half of the composition and does not preview the memorable Windows 98 interaction.
- **Recommendation:** Make the share card feel like a boot screen or open desktop window. Lead with the builder line, show 2–3 small project/lab signals, and fix the image crop. Once project routes exist, give each flagship its own outcome-led preview.
- **Priority:** **High**

### 6.8 The manifest also hard-codes the employment identity

- **Current state:** The installable app name is “Isyraf Afifi — Software Engineer” (`src/app/manifest.json:2`).
- **Why it works / doesn't work:** This is consistent with the current site, but it continues the same narrow identity in saved-home-screen and install surfaces.
- **Recommendation:** Rename it to the chosen personal-home concept, for example “Isyraf's Desktop” or “Isyraf Afifi — Builder's Log,” while keeping the short name “Isyraf.”
- **Priority:** **Low**

## 7. Code and content structure where it affects the redesign

### 7.1 Centralized content is a strong foundation

- **Current state:** Most editable copy, links, project data, Now items, icon labels, and window defaults live in `src/config/site.ts`. Window content is split into small focused components and selected through `windowRegistry.ts`.
- **Why it works / doesn't work:** This makes content iteration safer and supports a redesign without rewriting the window manager. The reducer cleanly handles open, focus, minimize, maximize, move, resize, and close behavior.
- **Recommendation:** Keep the central content model and window registry. Expand the data types for project category, status, metrics, origin, update date, media, role, and CTA rather than baking new content directly into components.
- **Priority:** **High**

### 7.2 The content is not actually all centralized

- **Current state:** `site.ts` says “ALL editable content lives here” (`src/config/site.ts:1-6`), but SEO descriptions, JSON-LD skills/organizations, Open Graph text, the Now update date, manifest name, and social-card copy are hard-coded in other files (`layout.tsx`, `opengraph-image.tsx`, `NowWindow.tsx`, `manifest.json`).
- **Why it works / doesn't work:** The drift is already visible: the visible name, metadata grammar, JSON-LD person name, old role positioning, and update date do not share a clean source of truth.
- **Recommendation:** Create a typed identity/content model that separates person, site, positioning, projects, and update timestamps. Derive metadata, JSON-LD, manifest, and social cards from it where practical. Keep layout-specific strings local.
- **Priority:** **Medium**

### 7.3 The window architecture can support the new site, but routes need to coexist with it

- **Current state:** Adding a content window requires extending the `WindowId` union, icon configuration, defaults, registry, and component. The shell is entirely client-managed and route-agnostic.
- **Why it works / doesn't work:** This is reasonable for five windows, but an internet home with project details, notes, an archive, and personal pages will become cumbersome if every item is another reducer-managed modal.
- **Recommendation:** Keep reducer-managed windows for top-level desktop apps. Use real nested routes/data for the items inside them. On desktop, selecting a routed item can open a window; on mobile and for direct visits, the same route can render a focused page. Do not model every note or project as another `WindowId`.
- **Priority:** **High**

### 7.4 The codebase is healthy enough to redesign incrementally

- **Current state:** The current production build completes successfully and all app routes are statically generated. Lint has no errors. The only warning is the intentional raw image in the Open Graph generator.
- **Why it works / doesn't work:** There is no technical reason to throw away the shell or start a third redesign from scratch. The highest-value changes are content model, routing, default state, and information hierarchy.
- **Recommendation:** Evolve the current repository in phases. Preserve the window system, mobile fallback, reduced-motion behavior, and existing content config while adding the new positioning and routes.
- **Priority:** **Medium**

## What is worth keeping

| Element | Why it is valuable | Recommendation | Priority |
| --- | --- | --- | --- |
| Full Windows 98 window manager | Demonstrates craft and is genuinely memorable | Keep as the main interaction language | **High** |
| Start menu and taskbar | Makes the concept usable, not just decorative | Keep and turn into the complete directory | **Medium** |
| KerjaKit origin + proof | Best evidence of product judgment, distribution, and trust design | Use as the flagship case-study template | **High** |
| Dated Now page | Signals an active person rather than a static résumé | Keep, remove job-search joke, update visibly | **High** |
| Plain-spoken tone | Feels human and credible | Preserve, but remove repeated self-disqualification | **High** |
| Shah Alam/Malaysia context | Distinctive source of problems, communities, and perspective | Weave through intro and project stories | **Medium** |
| Opt-in music | Personal and surprising | Keep with rights-safe audio and more context | **Medium** |
| Mobile full-screen windows | A strong adaptation of the desktop idea | Keep and improve touch/focus behavior | **High** |
| Reduced-motion and keyboard support | Shows care beneath the visual concept | Preserve and extend | **Medium** |
| Generated metadata/OG infrastructure | Good foundation despite the current message | Keep the machinery; replace the content/crop | **Medium** |

## Missing content that would create a “builder / personal internet home”

### A. `START_HERE.txt`

- **Current state:** No visible introduction exists before interaction.
- **Why it works / doesn't work:** This is the orientation gap affecting every audience.
- **Recommendation:** A default-open 80–120 word welcome with the builder line, location, what is being built now, and four audience shortcuts.
- **Priority:** **High**

### B. `SHIPPED/`

- **Current state:** Work contains only KerjaKit.
- **Why it works / doesn't work:** It hides the evidence needed to support products plural and technical range.
- **Recommendation:** Three flagship case files plus a smaller archive. Lead with outcomes/origin/ownership; make stack secondary.
- **Priority:** **High**

### C. `LAB/` or `EXPERIMENTS/`

- **Current state:** AI agents and Qalam appear only as Now bullet points; smaller tools from repository history have disappeared.
- **Why it works / doesn't work:** Experiments are central to the desired identity but currently look like study topics rather than things being made.
- **Recommendation:** Show active experiments with status labels such as `testing`, `needs collaborator`, `paused`, and `tiny but useful`. Qalam should have a clear collaboration ask; the Claude/OpenCode bridge and AI poster pipeline are natural lab entries if still current.
- **Priority:** **High**

### D. `SHIP_LOG.txt` or field notes

- **Current state:** There is a dated Now file but no record of recent launches, decisions, failures, or lessons.
- **Why it works / doesn't work:** Without ongoing entries, the “internet home” still behaves like a finished brochure.
- **Recommendation:** Add short, low-pressure posts: what changed in KerjaKit, what an agent evaluation exposed, why a product was paused, or a deployment lesson. A changelog cadence is more authentic to this site than a formal “Blog.”
- **Priority:** **Medium**

### E. `LIFE/` or “Away from keyboard”

- **Current state:** The only non-software signal is music and the unexplained sculpture.
- **Why it works / doesn't work:** Visitors cannot form a picture of the person behind the work.
- **Recommendation:** Use 4–6 specific, real fragments from the prior repository material: Malaysian roads, motorcycling, mosque stillness, waterfalls/friends, music, or other current interests. Keep captions concrete and avoid turning hobbies into personal-brand lessons.
- **Priority:** **High**

### F. `WORK_WITH_ME.txt`

- **Current state:** The site has an interview pitch and a generic Contact list.
- **Why it works / doesn't work:** It does not explain what kinds of collaboration are welcome or how to approach Isyraf.
- **Recommendation:** State current availability and three concrete reasons to reach out: software/product roles, small product/automation work, and collaboration on Qalam or other experiments. Keep the résumé one click away for recruiters.
- **Priority:** **Medium**

### G. Project status and archive

- **Current state:** KerjaKit has a year but no explicit status; old projects simply vanished during the redesign.
- **Why it works / doesn't work:** A builder's site benefits from showing unfinished and retired work honestly. Deletion makes the body of work appear smaller and erases learning.
- **Recommendation:** Use statuses such as `live`, `growing`, `prototype`, `paused`, and `archived`. Archive older work with one sentence about what it taught or why it stopped.
- **Priority:** **Medium**

## Recommended order of change

1. **Change the first impression and information architecture:** add `START_HERE`, remove `Hire Me!` from the main desktop, and rewrite the positioning line.
2. **Restore the true breadth:** curate flagship projects, create `LAB/`, and add one personal-life surface using material already present in repository history.
3. **Make the content addressable and crawlable:** add project/Now routes, initial semantic content, corrected metadata/JSON-LD, hostname consistency, and project previews.
4. **Refine the experience:** improve mobile close/focus behavior, explain or replace the statue, and give different content types distinct native “apps.”

## Positioning directions

### Direction 1 — The Builder's Desktop

**Positioning:** “I build useful software products, AI experiments, and small internet businesses from Shah Alam.”

The desktop becomes an active workshop rather than a résumé. `START_HERE.txt` opens by default; Explorer contains Shipped and Lab; Notepad contains Now and Ship Log; Media Player/Life contains music and personal fragments; Work With Me serves recruiters, clients, and collaborators without dominating the experience.

**Why it fits what exists:** It preserves the strongest asset—the OS interaction—while giving KerjaKit, Qalam, Baymax, Esportorium, and personal interests clear homes. This is the best overall fit.

**Risk:** If too many apps are added without hierarchy, exploration becomes a scavenger hunt. The default welcome and real routes are essential.

### Direction 2 — Product Engineer in Public

**Positioning:** “I turn rough ideas into working products—and share what happens after shipping.”

The site centers 2–3 flagship products, a live ship log, user/distribution signals, and practical build notes. Technical credibility comes from architecture and production decisions inside case files. Recruiting remains supported through an unobtrusive résumé and professional-work file; client/collaboration opportunities use a clear Work With Me screen.

**Why it fits what exists:** KerjaKit already has the ideal product narrative: CLI origin, distribution on Threads, user demand, safety constraint, and a web product. The Now list also shows that Isyraf is learning marketing and infrastructure, not only code.

**Risk:** This direction can underrepresent life outside work unless `LIFE/` remains a first-class part of the desktop.

### Direction 3 — A Malaysian Technologist's Internet Home

**Positioning:** “Software, AI experiments, and side quests from Shah Alam.”

This direction uses place and curiosity as the organizing idea. Qalam/Jawi, Malaysian esports, local clinic software, car-industry work, roads, music, and personal photos sit alongside global software tools. The tone can be looser and more editorial, with projects presented as things made in response to communities and observations.

**Why it fits what exists:** The most differentiated material in the repository is already Malaysian and culturally specific. It makes the site more memorable without weakening technical credibility.

**Risk:** It needs real, current personal material and careful writing; superficial local decoration would feel less authentic than the current neutral design.

## Final recommendation

Use **Direction 1 as the structure** and **Direction 3 as the personality**. In practical terms: keep Isyraf 98, make it boot into a clear builder introduction, organize the desktop around Shipped/Lab/Now/Life, and let Malaysia, product distribution, music, and real side quests supply the details that no generic software-engineer portfolio can copy.
