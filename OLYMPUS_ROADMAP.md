# Olympus — Level Progression Roadmap

Updated: 15 November 2026.

**Status: levels 1–6 and resumable player progress implemented; automated verification completed for this release.** Based on the latest scoreboard/Neon changes through `2b258aa`. Real-device and human balance playtests remain open.

This is the active plan. It supersedes the previous harder-replay design, its rising-difficulty targets, and its pre-launch merge restrictions. The original plan and historical simulation results are preserved in [the 14 November archive](docs/archive/OLYMPUS_ROADMAP_2026-11-14.md). Historical numbers are not acceptance targets for the new levels.

## Decisions from the user

- Call progression **levels**, not runs, in the game and its instructions.
- Level 1 keeps the original statue encounter. Level 2 onward introduces different statue powers.
- Higher levels must **not become progressively harder**. The level number selects a different power or pattern, not a difficulty multiplier.
- Returning players can continue at their saved level.
- Players can choose Start Over and return to level 1.
- A possible 100-level journey is a later expansion. Design and validate the initial levels first.
- Documentation was updated first. The subsequent implementation reuses the new scoreboard identity and database, as requested.

## Existing features retained

- `/olympus` opens the game's start screen directly.
- Arcade Gold start/end buttons, pause/resume, and exit controls.
- Fixed joystick and separate Fire control on phones/tablets; arrows and Space on computers.
- Phone movement is slower, the pointer and its collision radius are smaller, and releasing the joystick brakes quickly.
- Landscape play on touch devices; fullscreen requests where supported, full-viewport fallback, and protection against long-press selection.
- Olympus Home Screen icons, installation guidance, and edge-to-edge layout with safe areas.
- A story and device-specific instructions.
- Reserved player names, signed browser identity cookies, Neon score storage, and the global top ten with retro medals.
- The original encounter remains level 1. Levels 2–6 use new powers, with no level-based speed or health increase. Loss and exit keep the checkpoint.

## Experience and terminology

Each level is another encounter with the same marble guardian, who changes powers to protect the desktop. Keep the Windows 98 and marble visual identity, pointer fighter, destruction/anger introduction, awakening, and restored desktop on exit.

A **level** is a numbered encounter with its own attack profile. A **phase** is a section of that encounter. An **attempt** is one try at a level. A component remount identifier is only an implementation detail, never player progress.

Use these labels throughout the HUD, title screen, pause screen, endings, guide, and accessibility announcements:

| Situation | Player-facing wording |
| --- | --- |
| First visit | Play — Level 1 |
| Saved unfinished campaign | Continue — Level N |
| HUD / pause | LEVEL N · Power name |
| Victory with another shipped level available | Level N complete / Next level |
| Loss | Retry level N / Exit to desktop |
| Restart campaign | Start Over |
| Last shipped level cleared | All available levels complete / Replay level N / Start Over |

Remove active copy such as `RUN`, `Next run`, `Best run`, and `harder difficulty`. Rewrite the guide's ending to explain that the next level brings a different power. Keep historical language only in the archived plan or explicitly documented legacy storage references.

## Initial level catalogue

These six profiles are implemented. Complete level 1 to unlock level 2, and so on. The catalogue is the source of available content; there is no level 7 yet.

| Level | Statue power | Warning and attack | Player response |
| --- | --- | --- | --- |
| 1 | Marble Guardian | Existing throws, spread, and aimed laser with fixed baseline timing and health-based phases. | Dodge hot marble; move away when the eye beam locks. |
| 2 | Marble Swarm | A marked marble formation point and swirling rings announce two waves of small destructible marble asteroids. | Shoot an opening or steer between fragments. |
| 3 | Shattered Halo | A visible ring marks an expanding circle of fragments with a clear safe gap. | Move through the gap; keep an escape route available. |
| 4 | Meteor Rain | Mark selected lanes before marble falls through them. | Move into an unmarked lane; always leave a reachable safe lane. |
| 5 | Orbiting Armour | Breakable marble shields orbit the statue with visible openings and recovery windows. | Break a shield or fire through a gap to hit the statue. |
| 6 | Sweeping Gaze | A warning arc shows the direction of a slow laser sweep before it becomes damaging. | Move around the sweep into the advertised safe space. |

Each profile **replaces** the appropriate part of the previous attack schedule. It does not inherit every earlier power. In particular, level 2 does not add a swarm on top of level 1's simultaneous spreads and laser. The same rule applies to later levels: one major attack at a time, followed by a readable recovery opportunity.

### Level 2: Marble Swarm specification

- Use marble fragments, not unrelated space assets. Destructible swarm fragments must look distinct from hot, indestructible thrown marble.
- Use a 1.2-second visual warning and matching rumble. Audio is supplementary; the warning must work with sound muted.
- Two waves, 0.55 seconds apart: up to six total fragments on phones/tablets and eight on desktop. Spawns too close to the player are omitted.
- Spawn from visibly marked positions near the statue. Never materialize damaging fragments on the player or inside the joystick/Fire area.
- Swarm fragments can be destroyed and do not split into extra fragments.
- No concurrent laser or spread during the swarm. Leave a navigable escape route and enough warning for the slower phone pointer.
- Give the player 1.5 seconds of recovery/attack opportunity afterward; tune against the baseline encounter.
- Apply a shared active-hazard budget, including existing fragments, before scheduling another wave. Despawn expired fragments and clear all attack state on retry, exit, and level transition.
- The boss remains beatable through both shooting and movement. Reject a pattern that forces unavoidable damage or rewards only standing still and holding Fire.

### Equal difficulty across levels

The target is comparable challenge and encounter duration across levels, evaluated separately for touch and keyboard. Equal numerical settings alone do not prove equal difficulty.

- Remove the current level-dependent speed multiplier and earlier-laser progression (`runSpeedUp`, `laserAtPerRun`, and their derived calculations). The old formula must not survive under a new variable name.
- Do not increase projectile speed, statue health, damage, hazard counts, or attack frequency simply because the level number rises.
- Do not shorten warning times, reduce lives, reduce safe space, or extend fights as a reward for progressing.
- Start each level with three lives. Keep phone movement/braking and existing platform accommodations.
- Level 1's fixed health phases may remain. Higher level IDs must not automatically accelerate those phases or activate more attacks together.
- Give each power its own readable cues and counterplay. Balance shield uptime, gaps, recovery windows, and effective damage opportunities so defensive powers do not turn into longer endurance fights.
- If human playtests show a later power is consistently harder, adjust its pattern and timing until it matches the baseline; do not accept the difference as intentional progression.
- Use a shared cap for all damaging hazards. The existing ordinary-rock spawn cap is not sufficient to constrain boss attacks by itself.

## Continue and Start Over

### Checkpoint behavior

Continue resumes **at the beginning of the saved level**, with fresh lives, zero attempt score, and a clean world. It does not restore mid-fight coordinates, projectiles, or remaining health. Pause/Resume preserves a live attempt only while that game session remains open.

| Event | Saved progress | What happens next |
| --- | --- | --- |
| First play | Resume level 1; no completed levels | Start level 1. |
| Exit, reload, close the browser, or lose during level N | Keep level N | Continue or Retry starts level N again. |
| Clear level N with a next shipped level | Record N completed and save N + 1 immediately | Next level starts N + 1; leaving on the victory screen still preserves it. |
| Clear the last shipped level | Record campaign complete and keep the final valid level | Offer Replay final level or Start Over; never load a missing level. |
| Cancel Start Over | No change | Keep the saved campaign. |
| Confirm Start Over | Reset campaign completion and resume level to 1 | Start level 1 with fresh lives. Keep the independent best-score record. |

Start Over must explain what it resets before erasing a real save: **“Start again at level 1? Your saved level progress will reset. Your best score will stay.”** Offer Start Over and Cancel. This is an in-game player action, not an implementation approval gate.

### Storage contract

The scoreboard now supplies the identity and Neon connection. Named players use **server checkpoints**, not a local best-score or legacy streak value.

- `olympus_progress` is keyed by signed-cookie player ID and environment (`production`, `preview`, `development`). It stores `highest_completed`, a campaign `epoch`, and `updated_at`.
- The API exposes a version-1 snapshot: `highestCompletedLevel`, `resumeLevel`, `completed`, and `epoch`. Resume is the next uncleared shipped level, clamped to the last available level.
- Loading a recognized player creates a level-1 checkpoint when none exists. Name reservation alone is not authentication: only the signed HTTP-only ownership cookie can access that player's progress. Names cannot be typed to recover someone else's save.
- Gameplay waits for the score-session response before starting its clock, so a slow connection cannot make a valid attempt exceed the server elapsed-time check. Starting a score session checks the requested level and campaign epoch against the database. Each attempt has a new opaque token; the legacy database column `run` stores its level, while the API and UI call it `level`.
- A successful victory submission records the score and advances progress in one SQL statement, immediately on victory, before Next level. The request uses keepalive so navigating away does not intentionally cancel it. Network/server failure is still possible: show failure and Retry saving, never a false saved message. Next level waits for the checkpoint response.
- A loss, exit, or unfinished session does not advance or reset the checkpoint. Duplicate submissions and concurrent wins for the same level cannot skip levels. Old wins cannot overwrite newer progress.
- Start Over rotates the campaign epoch and sets completion to zero. Older tabs/attempts cannot restore the old campaign. The reset uses the expected epoch, so stale reset requests fail visibly.
- Replaying the final level stays at level 6 with campaign completion recorded. Adding future catalogue entries automatically resumes at the first newly available level. Progress ahead of the installed catalogue is rejected with a refresh message.
- The signed cookie remembers a browser, **not a cross-device account**. Clearing cookies loses access. Safari and a Home Screen install may have separate storage; do not promise transfer or recovery by name. Existing valid cookies are refreshed when the named player is loaded.
- If the server cannot be reached, an explicitly labeled guest option uses the separate local key `isyraf98:olympus-progress:v1`. It validates the same versioned checkpoint shape with `epoch: null`; invalid saves start safely at level 1 with feedback. Blocked local storage allows in-memory play and reports that the save will not survive closing. Guest progress does not merge into a named player's campaign.
- Keep `isyraf98:olympus-best` for the independent local best score. Leave legacy `isyraf98:olympus-best-run` untouched, but do not display it or unlock new powers from it. Start Over changes no scores, player names, music settings, or unrelated storage.
- The scoreboard is versioned as `olympus-3`, because new shootable powers change scoring opportunities. Historical `olympus-2` scores remain in Neon; the current board ranks the new rules separately. Existing player names and local best scores remain.

### Database deployment

`db/004-level-progress.sql` adds the checkpoint table and nullable session epoch without deleting historical data. Vercel runs `npm run db:migrate && npm run build`; the existing migration runner records applied files and runs each migration transactionally. A failed migration blocks deployment. Local development may build without database credentials; `npm run db:migrate` needs `DATABASE_URL`. Neither secrets nor generated screenshots are committed.

## Implementation sequence

1. **Complete: level model and wording.** Catalogue, level/power names, distinct attempt IDs, fixed baseline tuning, HUD/pause/endings/guide and scoreboard wording.
2. **Complete: saved progression and menus.** Signed player checkpoints, immediate win saves, retry/continue, final-level behavior, Start Over, guest fallback and explicit save failures.
3. **Complete: Marble Swarm.** Warned two-wave attack, shootable non-splitting fragments, eight-hazard cap, finite lifetime, recovery, visual and audio cues, touch counts.
4. **Complete: levels 3–6.** Halo with a safe gap; rain with safe lanes; three breakable orbiting shields whose destruction also damages the statue (no extra required hits); slow, warned sweep. All use separate schedules and finite cleanup.
5. **Open: human playtest and polish.** Test keyboard, phone/tablet joystick, real iPhone Safari and its Home Screen app. Compare challenge and encounter duration; tune powers that feel harder. Automated checks cannot establish equal perceived difficulty.
6. **Later: levels 7–100.** Expand only after the initial set is stable. The number 100 is future scope, not shipped content.

## Future 100-level direction

A possible structure is ten themed chapters of ten levels. Chapters organize different powers, visual motifs, and pattern variations; they are not difficulty tiers. Reuse validated mechanics through different directions, arrangements, and rhythms while keeping the same challenge target.

Level 100 can have a distinctive finale and story payoff without becoming a harder fight. A finale may present familiar powers sequentially with recovery between them; it must not pile them together or inflate enemy health. Save a checkpoint at every level rather than requiring 100 consecutive wins.

## Engineering map

| Area | Expected work |
| --- | --- |
| `src/components/game/olympus.ts` | Level/power selection, attack state, consistent tuning, shared hazard limits. Remove old progression multipliers. |
| `src/components/game/draw.ts` | Distinct warnings, destructible swarm visuals, safe gaps, per-power effects. |
| `src/components/game/OlympusGame.tsx` | HUD/announcements, level endings, checkpoint event timing, retries, cleanup. |
| `src/components/desktop/Desktop.tsx` | Start a selected/saved level; separate attempt/remount ID from progression; preserve desktop and fullscreen cleanup. |
| `src/components/game/GameContext.tsx` and a focused progress helper | Storage schema, validation, migration, save-result handling, start/continue controls. |
| `src/components/window/OlympusWindow.tsx` | Continue / Play / Start Over choices and saved-level information. |
| `src/config/site.ts` | Level story, power instructions, UI labels, save/reset feedback. |
| `src/app/globals.css`, joystick, fullscreen and Home Screen helpers | Preserve current mobile layout, safe areas, no-selection behavior, readable/scrollable menus, and installation experience. |
| `scripts/olympus-sim.mjs` and focused tests | Per-profile scenarios, save transitions, difficulty comparisons; retire historical “later runs must be harder” expectations. |

Prefer the existing canvas/React/Web Audio implementation and avoid new dependencies unless a concrete need emerges. Read relevant installed Next.js documentation before editing framework-specific code. Keep code changes in small, reviewable steps.

## Acceptance checks before release

### Progress and wording

- New visitors start at level 1; all current game text says level rather than run.
- Clear level 1, leave on the victory screen, return: Continue offers level 2.
- Lose, exit, reload, or close during level 2: level 2 remains available with fresh lives on return.
- Canceling Start Over preserves progress; confirming it returns to level 1 and keeps best score.
- Final-level completion never points to nonexistent content; later catalogue additions advance a previously completed save correctly.
- Corrupt, out-of-range, unsupported-version, and blocked-storage cases are handled without breaking play or promising nonexistent saves.
- Normal browser and installed-app relaunches are tested independently, including storage behavior on a real iPhone.

### Powers and fairness

- Level 2 has a distinct swarm with a warning, destructible non-splitting fragments, recovery time, and no surprise concurrent laser.
- Levels 3–6 have distinct powers and counterplay, rather than more speed, more health, or accumulated attacks.
- A test verifies that increasing the level ID alone does not scale global enemy stats or shorten warnings.
- Every pattern leaves a reachable escape route on the smaller landscape playfield, respecting the phone's slower movement and the control area.
- Retry, death, pause/resume, rotation, exit, and level transitions never leak projectiles, attack timers, audio, input, or save events.
- Compare fight duration, win rate, and player feedback across profiles and devices. Existing simulation bots need adaptation for new powers; historical percentages alone are not evidence of fairness.

### Regression checks

- Build, type-check, and lint succeed, allowing only documented existing warnings.
- Preserve joystick braking, simultaneous steering/firing, desktop arrows, and long-press prevention.
- Preserve fullscreen fallback, landscape gating, taskbar restoration, icon/manifest behavior, and access to Story & how to play.
- Screenshots and browser checks cover desktop plus short landscape phones/tablets. Headless checks do not replace real Safari/Home Screen or human fairness testing.

## Verification for this implementation

- `npm run test:leaderboard`: 16 checks executing the real route/server SQL against PostgreSQL (PGlite), including cookie ownership, environment isolation, immediate checkpoints, loss/exit, duplicate and concurrent wins, reset invalidation, final replay, score retention and rate limits.
- `npm run test:game`: 16 checks for phone/tablet/keyboard controls, drift and hitbox, all six profiles' fixed stats, warning/recovery/hazard budgets, non-splitting swarm, safe rain lanes, armour damage credit, resize/death/victory cleanup and progress validation/migration.
- Production build and TypeScript pass. ESLint passes with the pre-existing `opengraph-image.tsx` image warning.
- Headless Edge browser checks use mocked player/score API responses and the real built game: desktop 1280×800 and phone 667×320 cover returning level 2, reset/cancel, retained best score, reload, pause/resume, mobile-only joystick and exit. They complement the real SQL tests; they are not a live Neon or physical iPhone test.
- Seeded legacy-bot diagnostics (20 attempts/profile/device) show no rising difficulty formula and no longer require later levels to be harder. New powers often finish faster than the original guardian because the bot can fire more consistently. These keyboard-oriented bots do not establish touch balance or equal difficulty. Human comparisons remain required.
