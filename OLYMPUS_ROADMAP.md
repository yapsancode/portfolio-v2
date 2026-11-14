# Olympus — Development Roadmap

Status: **option A chosen (2026-11-14). Build plan written at the bottom, waiting for review.** No game code has been changed.
Written 2026-11-14, after a code review and three browser playtests.

## Goal

A short, funny surprise for portfolio visitors (about 60 seconds) that is:

**Fun to play → Hard to master → Epic final boss.**

Rule: make the existing experience exceptional. Do not turn it into a bigger game.

## Decision: option A (decided 2026-11-14)

Option B is only reopened if the game gets real engagement after launch.

| Option | What it means |
|---|---|
| **A. One fight, three boss phases** (recommended) | No level system. The statue gets harder as its health drops. Laser eyes are the last phase. "Play again" after a win starts a harder run. |
| **B. Full level system** | Multiple levels, each with new attacks, and a separate final boss level. Several times more work, and most visitors only play once. |

The steps below are written for option A. Option B's extra items are listed at the end.

## What the playtest showed (why this order)

- Statue woke at about 20.5 s in both desktop runs. The ANGER bar filled before that and waited, so it does not react to the player.
- The About window died 1.2 s after the first shot. By the boss fight the desktop was empty.
- A player who never moved won the boss fight. The fight lasted 46 s; the desktop part only 20 s.
- The last 5% of the statue took 10 s, because shots flew through its hollow centre.
- There is no sound at all. Bullets are 3-pixel dots.
- On a phone (412 px wide) the same scripted player lost all lives around the moment the statue woke. Rocks are too big, the ship hides under the buttons, and the text talks about keyboard keys.
- The controls hint was cut off on screen ("Esc qu").

## Design rules

1. Everything on screen is either Windows 98 or marble. Nothing should look like a generic space game.
2. Every hit is seen and heard.
3. Playtest after every step, on desktop and phone, not only at the end.

## Steps

### 1. Game feel (and phone basics)

- Sound effects: shot, hit, window crash, icon break, ship lost, statue rumble, crumble. Own retro-style sounds, not Microsoft's files.
- Bigger bullets, muzzle flash, small recoil, very short pause on each kill.
- Ship easier to see: bigger, a clear "pointer becomes ship" moment at the start, no invisible first second.
- Fix the cut-off hint. Keep it until the first key press.
- Phone: scale rocks to the screen, move touch buttons off the ship and the statue, use touch wording in the start dialog and the blue screen.

### 2. Gameplay: destruction and anger

- Windows take more hits and show damage before they crash.
- Broken windows and icons leave wreckage behind (damage stays visible).
- ANGER rises mainly from destruction, with a time limit as a safety net.
- Give the drifting rocks a reason in the story (for example chips of the statue), and draw them in the pixel style.

### 3. Statue awakening

- A real "moment": the game freezes briefly, the desktop darkens, the change is big.
- More reactions and personality while it wakes and while it is hurt.
- Remove the spoiler from the warning dialog ("the statue may wake up").
- Fix the jagged outline that appears when the statue wakes.

### 4. Boss fight: three phases in one fight

Target length: 20–25 seconds. The player must move to win.

| Phase | Statue health | Attack |
|---|---|---|
| 1 | 100–60% | Throws marble, with a warning before each throw. |
| 2 | 60–25% | Faster throws and spreads. Thrown marble looks different from drifting rocks. |
| 3 | below 25% | **Laser eyes.** The statue charges, a line shows where the beam will go, then it fires. Dodgeable. |

- Fix the hollow-centre ending (health bar and visible statue must agree).
- Very difficult at the end, but still beatable.

### 5. Win / lose experience

- A win ending as strong as the blue screen.
- Remove the repeated "only a wallpaper" joke.
- "Play again" after a win starts a harder run (faster throws, laser earlier). This is the "hard to master" part.
- Keep the best score.

### 6. Final playtest and polish

- Three real people play once while being watched (desktop and phone).
- Fix what confused or frustrated them.

## Only if option B is chosen

- Level system with increasing difficulty and new attack patterns per level.
- More enemy variety: different marble projectiles, hazards, attack combinations.
- A separate final boss level where laser eyes are the ultimate attack.
- Playtest and balance every level.

## Not decided / not checked

- Keys (Asteroids style) or mouse aiming for the pointer. Current plan: keep keys.
- How long laser eyes take to build, and whether they are fair on a phone screen.
- Real hands-on feel, tablets, iPhone Safari.

---

# Build plan (option A)

## How the work is run

- **One agent, one step at a time.** Every step edits the same three files (`olympus.ts`, `draw.ts`, `OlympusGame.tsx`), so parallel agents would only create merge conflicts.
- **One commit per step** on `yapsancode/olympusgame-improvement`. Merge to `main` only after step 6.
- **No new dependencies.** Sound is made with the browser's Web Audio API (the browser makes the beeps itself, no sound files).
- Before touching any Next.js-specific code, read the matching guide in `node_modules/next/dist/docs/` (rule from `AGENTS.md`). Almost all of this work is plain canvas code inside client components.

## Files

| File | Job |
|---|---|
| `src/components/game/olympus.ts` | Game rules and all tuning numbers (no React, no DOM). |
| `src/components/game/draw.ts` | Canvas drawing. |
| `src/components/game/OlympusGame.tsx` | Loop, input, HUD, dialogs, reacts to game events. |
| `src/components/game/sound.ts` | **New.** Web Audio sound effects. |
| `scripts/olympus-sim.mjs` | **New.** Robot players that play the rules hundreds of times and check the numbers. |
| `src/config/site.ts` | All game text (`site.olympus`). |
| `src/app/globals.css` | `.olympus-*` styles. |
| `src/components/window/OlympusWindow.tsx` | Start dialog. |
| `src/components/desktop/Desktop.tsx` | Starts and ends the game, keeps the "run" number. |

## Baseline (measured 2026-11-14, 200 simulated games each)

A robot that turns and fires but **never moves**:

| Screen | Wins | Statue wakes | Boss fight length |
|---|---|---|---|
| Desktop 1280 px | 195 / 200 | always 20.0 s | 56 s (median) |
| Phone 412 px | 163 / 200 | always 20.0 s | 104 s (median) |

This agrees with the playtest (a player who never moves wins). The simulation used a simple stand-in statue shape and one fake window, so treat the numbers as a starting point, not as exact.

## Checks used after every step

1. `npm run lint` and `npm run build` pass.
2. `node scripts/olympus-sim.mjs` passes (from step 0 on).
3. Browser playtest in headless Edge at 1280 px and 412 px, with screenshots (vault note "Browser pane testing": the hidden pane pauses animation, so use headless Edge).

## Step 0. Simulation harness (small)

- Add `scripts/olympus-sim.mjs`: compiles `olympus.ts` with the installed `typescript` package, then runs two robots with `seededRandom`: **Idle** (turns and fires, never thrusts) and **Dodger** (also moves away from rocks and beams).
- It prints wake time, boss length and win rate, and fails when a target below is missed. Targets are switched on step by step.
- Done when: it reproduces the baseline table above.

## Step 1. Game feel and phone basics

| Item | Change |
|---|---|
| Sound | `sound.ts`: one `play(name)` function with oscillator and noise sounds for shot, hit, window crash, icon break, ship lost, rumble, crumble. The audio starts on the Start click (browsers only allow sound after a click). Add `shot` and `rockBroken` to `GameEvent` so the overlay knows when to play. If the Music player has a mute, the game follows it. |
| Bullets | Draw a short bright streak along the flight direction instead of a 3 px dot. Spark burst at the nose when firing. Small push backwards on the ship. |
| Kill pause | The loop skips about 40 ms of game time on a window crash, icon break or big rock kill. Off with reduced motion. |
| Ship | `CURSOR_SCALE` 1.4 → about 2. The blink starts on a visible frame. A ring of sparks at spawn ("pointer becomes ship"). |
| Hint | Allow wrapping and cap the width to the screen. Hide on the first game key, not after 4.5 s. |
| Phone | One `scale` number in the world (from screen width) for rock size and speed. The ship wraps above the touch-button strip. Buttons become see-through over the statue. Start dialog and blue screen show touch wording on touch screens. |

Done when: sim on phone shows the Idle robot reaching the boss with at least 2 lives in most games; screenshots at 412 px show ship and statue not covered; hint fully readable; every event has a sound.

## Step 2. Destruction and anger

- **Windows:** `TUNING.window.hp` 3 → about 8. Each hit leaves a bullet hole and cracks, drawn on the canvas at the hit point. At low health the title bar flickers.
- **Wreckage:** a crashed window or broken icon leaves a small pile of pixel debris where it was, until the game ends.
- **Anger:** destruction is worth much more, the time trickle much less. Remove the fixed 20 s gate; keep a hard safety net (statue wakes at 45 s no matter what).
- **Rocks:** they are chips falling off the statue, so they spawn at the statue, not at screen edges. Drawn with flat colours and hard edges (no smooth gradient), to match the Windows 98 look.

Done when (sim): an active shooter wakes the statue between 15 and 30 s; a player who shoots nothing gets 45 s; the first window survives at least 4 s of fire.

## Step 3. Statue awakening

- **The moment:** 0.6 s freeze, the desktop darkens (a dark layer under the canvas), then a strong shake, rumble sound, eyes flare, statue rises.
- **Personality:** new lines in `site.olympus.statue` for each boss phase and for when the player loses a life.
- **Spoiler:** remove "The statue on the wallpaper may wake up" from `warningMore`.
- **Jagged outline:** likely cause: edge tiles that are mostly transparent are dropped today, which makes stair steps. Keep those tiles for drawing but not for hitting. Confirm with before/after screenshots.

Done when: screenshots of the wake-up at both sizes show a smooth outline and a clear dark moment; lint and build pass.

## Step 4. Boss fight (three phases)

- **Phase** comes from statue health: above 60% → 1, 60–25% → 2, below 25% → 3. One helper function in `olympus.ts`.
- **Phase 1:** a 0.5 s wind-up (glow on the throwing side + sound) before every throw.
- **Phase 2:** faster throws, spreads of 3. Thrown marble gets a `thrown` flag and a hot outline, so it looks different from drifting chips.
- **Phase 3, laser eyes:** charge 1.0 s with a thin line that follows the player → lock 0.4 s (line stops and turns solid) → fire 0.5 s (wide beam from the eye). The beam takes a life if the ship is inside it. All timings live in `TUNING`.
- **Hollow centre:** a hit still counts anywhere on the statue, but the tiles that break off are the ones **furthest from the eye**. The statue shrinks toward the head and never becomes hollow. Health = attached tiles, so the bar and the picture always agree. The head with the laser eyes is the last thing standing.

Done when (sim, 200 games): Idle robot wins under 10%; Dodger robot wins 40–70%; Dodger's median boss fight is 20–25 s on desktop and under 35 s on phone; no fight where the last 5% takes more than 3 s.

## Step 5. Win and lose

- **Win ending:** a full-screen Windows 98 "It is now safe to turn off your statue" screen (black, orange text), with score and best. Replaces the small dialog.
- **Joke:** "only a wallpaper" stays once (the statue's last words). The win text gets a new line.
- **Harder run:** `Desktop.tsx` keeps a `run` number, +1 after each win, back to 1 after a loss or exit. Each run: faster throws, laser starts earlier (25% → 40% → 55%). HUD shows `RUN 2`.
- **Best score:** already saved (`loadBest` / `saveBest`). Only add the best run next to it.

Done when: sim shows the Dodger's win rate falling on run 2 and run 3; win, replay, lose and exit all work by keyboard and by touch.

## Step 6. Final playtest and polish

- You: three real people play once (desktop and phone) while you watch. Write down where they got confused.
- Agent: fix that list, run `/code-review`, then merge to `main`.

## Still open (does not block steps 0–3)

- Laser fairness on a phone screen: decided by the step 4 phone playtest.
- Keys stay. Mouse aiming is not planned.
- iPhone Safari and tablets cannot be tested from this PC. They are part of step 6.
