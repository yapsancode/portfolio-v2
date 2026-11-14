# Olympus — Swipe & Smash build and release plan

Date: 2026-11-15.
Status: implemented and locally verified; PR / production release in progress.
Destination: implement, verify, commit, push, merge into `main`, and verify the production deployment.

This plan supersedes the gameplay direction and release gates in `OLYMPUS_ROADMAP.md`. That document remains the history of the Asteroids version.

## Product decision

Build the recommended **Swipe & Smash** direction: a portrait game controlled with one thumb, in which the world advances only when the player swipes. The same game supports mouse gestures and keyboard arrows on desktop.

Keep Olympus's Windows 98 desktop objects, marble statue, destruction, sound effects, and humour. Replace rotation, thrust, manual shooting, momentum, and continuous survival with short turns and readable decisions.

The promise: **Swipe. Smash the desktop. Annoy a god.**

A round should feel complete in roughly 30–60 seconds of active play, with approximately 12–25 useful swipes as an initial tuning target. These are design targets to test, not measured results. There is no countdown, time-based combo expiry, or punishment for putting the phone down.

## Verified starting point

- Repository: `yapsancode/portfolio-v2`.
- Working branch: `yapsancode/olympusgame-improvement`.
- At planning time, `HEAD`, the remote working branch, and `origin/main` all point to `b03b5cb11936a979150d5cf599611626b429e66a`.
- The working tree was clean before writing this plan. The earlier improvements are already on `main`; the old roadmap's unmerged status is historical.
- GitHub CLI is authenticated. No PR exists for this branch, and there are no GitHub Actions workflows yet.
- Vercel reports a successful Production deployment for that commit. Configured public site: `https://www.isyraf-afifi.com`.
- `main` is checked out in another local worktree. Release through GitHub without switching or modifying that worktree.
- Next.js 16.2.9, React 19.2.4, TypeScript, npm, and an existing framework-free rules/simulation structure are available.
- The installed Next.js guides for layouts/pages, server/client components, and Playwright have been read. Revisit relevant installed documentation if implementation touches additional APIs.

## First release scope

### Exact core rules

1. A fixed logical **5-column by 6-row board** contains the cursor, solid marble blocks, and breakable desktop objects. It scales visually without changing its rules across devices.
2. One cardinal swipe slides the cursor to the last free cell before a solid block or board edge. Breakable objects are destroyed as the cursor crosses them; they do not stop movement. A preview shows the destination before committing the swipe.
3. Sliding through multiple objects gives a chain bonus. Moving through empty space earns nothing. Repeated back-and-forth movement cannot farm score.
4. Every destroyed object chips the statue. Its health reflects remaining breakables, and destroying all of them wins the round. Larger chains produce a stronger visual impact, without requiring an additional attack button.
5. The statue reacts to the first destruction. The introductory round's first two accepted moves cannot deal damage. After that, its next attack is visibly marked on the board.
6. Turn order is fixed: move and smash; check for victory; resolve the previously visible attack against the final landing cell; check for defeat; select and display the next warning. A winning smash cancels retaliation. Crossing a marked cell during the slide is safe; landing there is dangerous. Show this rule during onboarding.
7. The player has three hearts and can lose at most one per turn. Warning styles progress from individual marked cells to a row or column, then combinations. Attacks never happen on a timer.
8. Every newly selected attack must leave at least one legal safe landing destination. If a candidate fails that check, choose a simpler valid warning. Skip the warning if necessary. Never manufacture an unavoidable hit.
9. A gesture into a wall, a short tap, or a cancelled pointer does not consume a turn. Ignore second fingers. Accept one move per gesture and prevent extra moves during the brief resolution animation.
10. Pausing, resizing, switching tabs, or elapsed wall-clock time cannot advance the logical game.

### Content and replay

- Ship one authored introductory board and five additional authored boards. Use validated mirroring/rotation where dimensions allow, plus deterministic attack variation. Do not depend on unrestricted procedural generation.
- Verify that every breakable is reachable under slide-to-stop movement and that each board has a winning route through its attack sequence. A connected grid alone is insufficient.
- The first useful swipe is obvious and breaks an object. Teach movement, chains, and danger in context, one at a time.
- End screens show score, best score, largest chain, and one short statue reaction. A prominent thumb-reachable replay action starts another board immediately.
- Offer both retrying the current board and playing another. Replaying does not automatically increase difficulty.
- Unlock three additional cursor appearances at simple total-clear milestones. No currency, streak reset, account, or shop. Track each run's completion once, including across reloads.
- Treat new scores as a separate game version; do not mix them with the Asteroids score record.

### Access, interruption, and presentation

- Add `/olympus` with its own title, description, and canonical URL. It opens the playable board directly, with the first gesture starting play/audio. It bypasses the portfolio boot animation.
- The portfolio's Olympus icon/title window launches the same game component as an overlay. Keep the real portfolio windows and icons intact beneath it; use game-board replicas for destruction. Exiting restores focus to the launcher.
- Show the statue and action above the thumb. Accept gestures across the board and a broad lower input area. Keep frequently used controls within reach, with comfortable hit targets and safe-area spacing.
- Use short, forgiving swipes with a dominant-direction threshold; exact threshold is tuned on the actual UI. Avoid edge-origin gestures. Limit scroll suppression to the game input surface.
- Provide arrow/WASD and mouse-swipe equivalents, plus optional visible direction buttons. Visible warnings use patterns/shapes as well as colour; status text describes the turn outcome.
- Keep the pixel/marble aesthetic, readable type, visible cracks, debris, short impact animations, and varied statue lines. Reduced-motion mode removes shake and large movement effects without changing the rules.
- Reuse Web Audio sounds; sound is optional, starts only after interaction, and has an accessible mute control. No autoplay music requirement.
- Save a versioned logical snapshot after every accepted move, before visual animation. Include board identity, cursor position, remaining objects, hearts, score, move count, attack warning, deterministic random state, and run identity.
- On reopen, show a clear resume state with the same pending warning. Pause active effects on hidden/blur and require an intentional resume. Clear incomplete pointer state during interruptions.
- Validate stored data. Unsupported/corrupt snapshots start cleanly; unavailable storage leaves the game playable. Keep profile progress separate from the resumable run.

### Deferred from this release

Offline/service-worker caching, install prompts, leaderboards, accounts, multiplayer, daily challenges, additional game modes, and a full upgrade economy. Save/resume supports returning after interruptions but does not imply cold-start offline availability.

## Implementation structure

| File/area | Planned responsibility |
|---|---|
| `src/components/game/olympus.ts` | Replace continuous physics with typed deterministic turn state and actions. No DOM, React, audio, storage, or wall-clock dependencies. |
| `src/components/game/boards.ts` (new) | Authored boards, safe transformations, seeds, and board metadata. |
| `src/components/game/swipe-input.ts` (new) | Gesture classification and cancellation rules, shared with input tests. |
| `src/components/game/storage.ts` (new) | Versioned snapshot/profile parsing, persistence, and exactly-once completion credit. |
| `src/components/game/draw.ts` | Board/cursor/statue drawing and event-driven visual effects. Animation time never changes rules. |
| `src/components/game/OlympusGame.tsx` | Reusable game shell, pointer/keyboard input, HUD, onboarding, pause/resume, replay, accessible controls and status. |
| `src/components/game/sound.ts` | Reuse existing effects; adjust timing to match turn animations and mute behaviour. |
| `src/components/game/GameContext.tsx` | Simplify desktop launch contract; remove ship-spawn and old scoring assumptions. |
| `src/components/window/OlympusWindow.tsx` | Short preview, new promise, clear launch action, link to direct play. |
| `src/components/desktop/Desktop.tsx` | Mount the shared game, pass current volume, restore focus on exit, remove obsolete target-reading/destruction callbacks. |
| `src/app/olympus/page.tsx` (new) | Server page metadata wrapping the client game; no desktop or music-provider dependency for direct play. |
| `src/config/site.ts`, `src/app/globals.css`, sitemap | Centralised copy, portrait/responsive styling, direct-route discovery. |
| `scripts/olympus-sim.mjs` and new rule tests | Replace Asteroids bot targets with board-solving, fairness, input and persistence checks. |
| Browser tests, npm scripts, `.github/workflows/ci.yml` | Repeatable production-build checks on PRs and `main`. |

Keep one shipped engine for both launch paths. Reuse existing artwork rather than introduce an art-generation dependency. Add no runtime framework; Playwright is an intentional development-only dependency for this interaction-heavy change. The old roadmap's blanket no-new-dependencies rule is superseded for that purpose.

## Build sequence and exit checks

Work sequentially in this branch with one meaningful commit per stage. No parallel agent work is required.

### 1. Playable rules and first board

- Record the existing lint/build/simulation baseline before replacing behaviour.
- Implement deterministic slide, destruction, chains, health, warning resolution and win/loss.
- Build the introductory board and a minimal renderer/input shell.
- Add rule tests at the same time; verify no-op input, turn ordering, wall collisions, final-hit victory, damage caps and deterministic replay.
- Exit: a complete introductory round can be won and lost using only swipes or arrow keys; leaving it idle never changes state.

### 2. Mobile interaction and launch paths

- Build the portrait layout, forgiving gesture handling, accessible alternatives, direct route, and desktop launcher integration.
- Remove the old rotation/thrust/fire controls and stale copy.
- Preserve the portfolio interaction and music behaviour outside the game.
- Exit: start, play, pause, resume, retry and exit work at phone and desktop sizes; no control obscures the cursor or important warnings.

### 3. Content and game feel

- Add the five additional boards and validated variations.
- Add statue reactions, cracks, chains, attack transitions, sound and reduced-motion handling.
- Tune clarity and pacing; show the first payoff on the first useful action.
- Exit: every shipped board has a solver-verified winning route, every selected warning offers a safe legal action, and the win/lose flow is readable with audio disabled.

### 4. Save/resume and replay progress

- Implement snapshots, profile records, appearance unlocks, same-board retry, and next-board replay.
- Exercise refresh during animation, hidden/blur, resize, corrupt save, denied storage and repeated loading of a completed run.
- Exit: reopening preserves the last committed turn and pending warning; wins/unlocks are never credited twice.

### 5. Browser verification, review, and CI

- Add npm commands for type-checking, rule tests/simulation, and browser tests.
- Add GitHub Actions with `npm ci`, lint, type-check, deterministic rules/board checks, production build, and Playwright against that build. Configure generated Next.js types before type-checking in a clean checkout.
- Exercise Chromium and WebKit; phone widths 360, 390 and 412, tablet, desktop, and a short landscape viewport. WebKit automation is not a claim of physical iPhone testing.
- Browser coverage: both entry paths, touch/pointer gestures, diagonal/short/cancelled gestures, multiple fingers, replay, exit/focus, keyboard, save/resume, reduced motion, storage failure, sound-off play, and portfolio window regressions.
- Inspect screenshots for the intro, active warning, chain, damaged statue, pause, win, loss and resume states. Resolve overflow, safe-area, thumb-occlusion and readability problems.
- Review the final diff for unused Asteroids code, accidental portfolio changes, hydration errors, duplicate effects/listeners, and runaway animation/audio work.
- Exit: all automated checks pass; representative actual browser journeys have been exercised; no known release-blocking defect remains. Record any unavailable physical-device or human playtesting explicitly.

Real-player observation is useful for tuning appeal, but this release is not left indefinitely waiting for the old roadmap's three-person sign-off. Human retention or one-hand comfort is not proven by bots or viewport screenshots.

### 6. Push, PR, merge and production verification

1. Update this plan/roadmap with delivered behaviour, test evidence and any material deviations. Ensure only intended changes are staged; commit each finished stage.
2. Fetch `origin` and compare with the latest `origin/main`. If it advanced, integrate it in the current branch, resolve conflicts, and rerun affected checks before release. Do not force-push or change the other worktree.
3. Push `yapsancode/olympusgame-improvement` and create a PR targeting `main`. Write the final problem/behaviour, scope, validation and known limits in the PR body using a file for multiline text.
4. Wait for CI and the Vercel preview associated with the current PR head. Verify the preview's `/olympus` route and portfolio launcher. Fix failures, push, and recheck the new commit.
5. Merge the verified PR through GitHub using a merge commit, matching the head SHA that passed review/checks. Respect any repository rules in effect at that time; do not bypass protections.
6. Fetch again and confirm the implementation commit is contained in `origin/main` and the PR is merged. Leave the existing managed worktree/branch available rather than deleting it or switching the other worktree.
7. Follow the Vercel Production deployment for the resulting `main` commit. Verify its commit identity, deployment success, public `/olympus`, portfolio launcher, and a brief play/reload/replay journey.
8. If production reveals a regression, reproduce, fix on the working branch, rerun relevant checks, and release a follow-up PR. Do not report completion while a known shipped blocker remains.
9. Report the PR link, merge commit, production game link, checks passed and any validation limits.

The user's request includes push and merge to `main`; do not introduce an additional routine approval gate during execution. If an external credential, repository rule, or deployment restriction actually blocks release, report the exact blocker and retain completed work.

## Definition of done

- [x] One-thumb Swipe & Smash is the playable Olympus experience on phone and desktop.
- [x] Six authored boards, readable statue attacks, chain scoring, immediate replay and small cosmetic progression work.
- [x] No time pressure or hidden damage while the player is idle; interruptions and reloads preserve progress.
- [x] `/olympus` and the portfolio launcher use the same tested implementation.
- [ ] Lint, type checks, rule/board checks, build and browser tests pass on the released revision.
- [ ] Changes are committed and pushed; the PR is merged into `main`.
- [ ] The production deployment for that merge succeeds and its public routes pass smoke checks.
- [ ] Final handoff includes links and honest verification limits.


## Delivery record — 2026-11-15

Implemented the shared phone/desktop game, six authored layouts and four reflections per layout, previewed swipes, readable turn attacks, three hearts, chain scoring, sound/mute, pause/help, direct route, desktop launcher, versioned save/resume, cross-tab save updates, immediate retry/next board, and three cosmetic unlocks.

Implementation choices:

- The board uses a small DOM grid and SVG/pixel icons with event-driven CSS animation instead of a canvas loop. This makes the responsive layout and accessible controls easier to inspect and leaves no gameplay timer running while idle.
- Objects are placed deterministically on the swept paths of each authored layout. Geometry changes are checked by the solver; connected but unsweepable cells never receive objects.
- Snapshot and profile are separate fields in one atomic localStorage record, so a terminal result and its completion credit cannot be written separately. Old Asteroids scores are not mixed into the new game.
- The initial game/saving/layout stages were implemented as one integrated commit, followed by browser verification/polish and release documentation, because they share the same component contract.
- The original statue PNG is served directly in the game to avoid a slow first image-optimization request. The renderer reuses the existing art and sound assets.

Local verification:

- Existing lint/build/simulation baseline passed before changes (lint had one existing warning in `src/app/opengraph-image.tsx`).
- New rule checks solve 96 board/reflection/attack-seed combinations with normal damage and verify turn ordering, fairness, terminal states, scoring, gestures, and save validation. Winning solver routes take 7–18 swipes; human session duration and retention remain unmeasured.
- Production build and TypeScript checks pass. Lint has no errors and the same existing image warning.
- Production-browser suite: 23 passed, one intentional skip. Chromium tests actual touch injection; that CDP-only test is skipped in WebKit, which still runs gesture-handler, phone-launcher, pause/focus, replay, storage and layout checks.
- Both browsers exercise 360/390/412 px phones, tablet/desktop sizing, and a short landscape viewport. Desktop-launcher contexts explicitly use desktop input and pixel ratio rather than inheriting the phone project's settings.
- Screenshots inspected for introduction, marked attack, pause/help, win/unlock, next board and landscape. Portrait controls fit the tested short phone; landscape permits vertical scrolling while keeping the board and swipe pad accessible.

Limits: no physical iPhone/Android hand-comfort study, human retention test, or acoustic listening test has been performed. Browser WebKit is not physical Safari hardware. Offline cold starts remain outside this release.
