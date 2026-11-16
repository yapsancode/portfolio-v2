# Olympus — Level Progression Roadmap

Updated: 16 November 2026.

**Status: levels 1–6, resumable progress, the Earth-resource story, unique dialogue, and stronger attack patterns are implemented. The current revision adds the saved marble bank, ten-level refits, mission wording, and desktop movement without drift.** Based on `6b6b16c`. Levels 7–10 are documented concepts below, not implemented. Real-device and human balance playtests remain open.

This is the active plan. The latest clarification prioritizes creative, distinctive, memorable encounters over difficulty progression. It supersedes both the earlier harder-replay targets and the later requirement for equal difficulty, as well as the pre-launch merge restrictions. The original plan and historical simulation results are preserved in [the 14 November archive](docs/archive/OLYMPUS_ROADMAP_2026-11-14.md). Historical numbers are not acceptance targets for the new levels.

## Decisions from the user

- Call progression **levels**, not runs, in the game and its instructions.
- Level 1 keeps the original statue encounter. Level 2 onward introduces different statue powers.
- **Creativity, uniqueness, and player enjoyment are the priority. Difficulty is secondary, not forbidden.** A level may be harder when that serves its concept; making the same fight faster or tougher is not enough to define a new level.
- Give every level its own randomized statue dialogue: a theatrical, egotistical guardian with power-specific boasts, reactions such as “ARHHH!”, and occasional topical jokes.
- Returning players can continue at their saved level.
- Players can choose Start Over and return to level 1.
- Collect and save marble as upgrade currency. After every ten cleared levels, allow one upgrade choice: an extra life, faster firing, or longer protection after a hit. Keep unused choices and banked marble for later.
- Extend the creative plan through level 10. Level 7 uses the user’s idea: three marble duplicates firing lasers simultaneously at different angles.
- A possible 100-level journey is a later expansion. Design and validate the initial levels first.
- Documentation was updated first. The subsequent implementation reuses the new scoreboard identity and database, as requested.

## Existing features retained

- `/games/olympus` opens the game's start screen directly.
- Arcade Gold start/end buttons, pause/resume, and exit controls.
- Fixed joystick and separate Fire control on phones/tablets; arrows and Space on computers.
- Phone movement is slower, the pointer and its collision radius are smaller, and releasing the joystick brakes quickly.
- Landscape play on touch devices; fullscreen requests where supported, full-viewport fallback, and protection against long-press selection.
- Olympus Home Screen icons, installation guidance, and edge-to-edge layout with safe areas.
- A story and device-specific instructions.
- Reserved player names, signed browser identity cookies, Neon score storage, and the global top ten with retro medals.
- Shareable saved-score cards and public result pages, with native sharing where supported, image download, and a copyable challenge. Card ranks describe the time the card was created, not a permanently fixed leaderboard position.
- The original encounter remains level 1. Revised levels 2–6 use distinct stronger patterns and 48 health, compared with level 1’s 38. Three lives and movement controls are preserved. Loss and exit keep the checkpoint.

## Experience and terminology

Earth needs marble resources to rebuild its cities and orbital stations. Inside Isyraf 98, the pointer becomes a small salvage battleship sent to collect Olympus marble. The egotistical guardian sees the expedition as theft of its own greatness. Each level is another encounter with that guardian, who changes powers to defend the marble. Breaking fragments collects marble automatically. Completed attempts bank that marble as persistent currency for ship refits after every ten cleared levels; see the resource contract below. Keep the Windows 98 and marble visual identity, pointer fighter, destruction/anger introduction, awakening, and restored desktop on exit.

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
| 2 | Marble Swarm | A marked marble formation point and swirling rings announce three warned shoulder volleys of destructible marble asteroids. | Shoot an opening or steer between fragments. |
| 3 | Shattered Halo | Two expanding fragment rings have offset, shifting safe gaps and separate warnings. | Move through the gap; keep an escape route available. |
| 4 | Meteor Rain | Three waves target occupied lanes; each locks its lane and drop positions during a fresh warning. | Move into an unmarked lane; always leave a reachable safe lane. |
| 5 | Orbiting Armour | Breakable shields absorb shots, then surviving shields freeze, warn, and launch outward. | Break a shield or fire through a gap to hit the statue. |
| 6 | Sweeping Gaze | A wider sweep makes a separately warned return pass; the next cycle reverses its starting direction. | Move around the sweep into the advertised safe space. |

Each profile **replaces** the appropriate part of the previous attack schedule. It does not inherit every earlier power. In particular, level 2 does not add a swarm on top of level 1's simultaneous spreads and laser. This is the current baseline for levels 2–6. Future levels may use deliberately coordinated combinations, such as the three-clone volley, when they support the creative concept and leave readable counterplay and recovery.

## Planned expansion: levels 7–10

These concepts extend the lineup without changing the six currently playable levels. Level 7 comes from the user's clone idea; levels 8–10 are the suggested follow-ups from the design discussion. Record them as planned content, not completed implementation or verified balance.

| Level | Statue power | Transformation and attack | Player response |
| --- | --- | --- | --- |
| 7 | Marble Mirage | Three marble copies emerge from dust and fire lasers simultaneously at different angles. Between attacks they crumble and reappear in new positions. | Read all three beam warnings, move into the opening, and shoot any copy. |
| 8 | Borrowed Time | The statue raises its hand to freeze its flying marble fragments, then closes its fist to rewind them along their original paths. | Shoot frozen fragments or position between the ghost trails before they return. |
| 9 | Gates of Olympus | Two broken marble doorways float in space. Attacks enter one gate and emerge from the other after a visible warning. | Watch the exit gate; send your own bullets through the portals to hit the statue from another angle. |
| 10 | The Marble Leviathan | The statue shatters into a long marble serpent, with its glowing face as the head, then coils back into statue form between passes. | Stay outside its previewed route, shoot the head or segments, and use the reformation window. |

### Level 7: Marble Mirage

- Three copies fire together at different angles, as requested. Treat the coordinated three-beam volley as one major attack; do not add swarm, rain, or other powers on top.
- Show all three beam paths before firing. Lock their directions after the warning so a safe opening remains predictable and reachable with phone movement speed.
- All copies share the guardian's normal total health. Shooting any copy damages that shared pool; three copies do not mean three health bars or three times the required hits.
- Fit the copies to the landscape playfield. Keep the HUD, touch controls, and escape routes readable; do not simply place three full-size statues over the arena.
- Reposition only during a clear, non-damaging crumble/reformation interval. Never materialize a damaging copy or beam on the player without its warning.

### Level 8: Borrowed Time

- Raise the statue's hand as a readable cue. A sparse volley freezes in midair, with suspended marble dust reinforcing the time-stop illusion.
- Only this power's marble fragments freeze and rewind. The player's movement, joystick braking, bullets, and controls continue normally.
- Draw ghost trails before the fragments return along their recorded paths. Destroyed fragments stay destroyed; rewinding does not respawn them or restore statue health.
- Bound the number of fragments and the recorded history. Finish the return motion, clear the volley, and provide recovery before the next cycle.

### Level 9: Gates of Olympus

- Use two recognizable marble doorways, with matching symbols as well as colour to communicate the pair.
- Show the entering attack and warn its exit position and direction before it becomes damaging. Keep a reachable safe lane around the exit.
- Player bullets use the same portals, allowing a planned shot to reach the guardian from another direction, including behind it.
- Redirect projectiles without multiplying them, increasing damage, or resetting their lifetime. Prevent immediate re-entry loops and unlimited portal crossings.
- Rearrange the doors between attacks with a clear transition. Keep entrances and exits outside the touch-control area.

### Level 10: The Marble Leviathan

- Animate the familiar statue breaking into linked marble segments, forming a serpent with its glowing face as the head. The transformation is the main attraction. A harder finale is allowed if it improves the experience; extra health alone is not the payoff.
- Preview the curved travel route with a ghostly ribbon wide enough to communicate the creature's damaging footprint. Leave reachable space outside that route on short landscape phones.
- Shooting either the head or a segment damages one shared health pool. A single bullet must not count multiple overlapping segment hits.
- After each pass, coil back into statue form and provide a generous stationary shooting window. No healing or extra health bar during transformation.
- Keep the serpent's attack separate from earlier powers. Clear segment collisions, paths, and transition effects on death, resize, retry, or exit.

### Expansion acceptance and progression

- Start from the existing tuning and controls, then tune each encounter for its own concept. Difficulty may vary, including harder encounters. Evaluate whether the transformation, mechanics, and personality are fun and readable on keyboard and touch; equal win rates or identical health are not acceptance requirements.
- Add a level to the runtime catalogue only once its gameplay, warnings, rendering, and cleanup are implemented and tested. These docs alone do not unlock levels 7–10.
- When level 7 ships, players who completed level 6 continue at level 7. Preserve their completed milestones, player identity, and scores. Apply the same rule to subsequent releases.
- Keep victory checkpoints, loss/retry, confirmed Start Over, and final-level replay working against the actual shipped catalogue. Once all ten ship, level 10 becomes the final replayable level; level 11 remains unavailable.
- Verify clone shared damage, coordinated safe gaps, rewind cleanup, bounded portal traversal, and serpent hit deduplication with focused tests. Review all four visually on desktop, tablet, and short landscape phones.

### Level 2: Marble Swarm specification

- Use marble fragments, not unrelated space assets. Destructible swarm fragments must look distinct from hot, indestructible thrown marble.
- Use a 1-second desktop / 1.2-second touch visual warning before each volley, with matching rumble. Audio is supplementary; the warning must work with sound muted.
- Three volleys from alternating shoulders, each aimed and locked during its own warning. Use three fragments per touch volley or four on desktop, with an active cap of nine/twelve respectively. Spawns too close to the player are omitted.
- Spawn from visibly marked positions near the statue. Never materialize damaging fragments on the player or inside the joystick/Fire area.
- Swarm fragments can be destroyed and do not split into extra fragments.
- No concurrent laser or spread during the swarm. Leave a navigable escape route and enough warning for the slower phone pointer.
- Finish with 1 second of recovery on desktop or 1.2 seconds on touch. Earlier volleys may still travel during a later volley’s warning, within the shared profile budget.
- Apply the profile’s active-hazard budget, including existing fragments, before spawning another wave. Despawn expired fragments and clear all attack state on retry, exit, and level transition.
- The boss remains beatable through both shooting and movement. Reject a pattern that forces unavoidable damage or rewards only standing still and holding Fire.

### Creative identity first; difficulty second

The desired reaction is “I want to see what the statue does next.” Each level should offer a recognizable transformation, mechanic, rhythm, or personality moment. Difficulty can rise, fall, or vary across the journey; it is a supporting design tool, not the primary progression system.

- Prioritize a memorable visual idea, a distinct interaction, entertaining statue dialogue, and satisfying counterplay. A new name plus higher stats does not make a new level.
- The implemented levels removed the old automatic `runSpeedUp` and `laserAtPerRun` formulas. Keep explicit per-profile tuning so changes serve a specific encounter rather than applying an unexplained multiplier to every later level.
- Speed, health, hazard count, warning length, timing, and attack combinations may be adjusted when they make a concept work better. Do not increase them merely to fill a higher numbered slot.
- A harder encounter is acceptable when players find learning it enjoyable. Do not flatten an interesting level just to match level 1's win rate or duration.
- Preserve readable warnings, reachable responses, responsive controls, and deliberate recovery opportunities. Surprise should come from the idea, not an unavoidable hit or an obscured phone playfield.
- Three lives and current movement/braking remain the starting defaults. Assess keyboard, phone, and tablet separately when tuning; a fun desktop pattern may need wider gaps or longer cues on touch screens.
- The planned clone volley is a coordinated multi-beam attack, not a ban on simultaneous attacks. Other combinations can be designed deliberately when they remain readable and fit the level's identity.
- Use an explicit active-hazard budget and bounded lifetimes for each profile. Raising a budget is a conscious design decision, not an accidental consequence of stacking powers.
- Playtests should ask: Did this feel different? Was the reveal memorable? Did the player understand what happened? Would they replay it or want to see the next level? Use difficulty and fight duration as supporting evidence.

## Statue personality and per-level dialogue

**Status: levels 1–6 now have 15 authored lines each in `src/components/games/olympus/dialogue.ts` (90 total).** Levels 7–10 and topical rotations remain planned. The shared generic lines and the competing hint/wakeup speech timers have been removed. Gameplay hints remain in the guide, pause menu, and accessibility announcements.

The guardian has an enormous ego and takes a tiny desktop pointer far too personally. It boasts, overreacts, invents excuses, and treats every new power as proof of its own greatness. Humour should make players enjoy provoking it. Mix short emotional barks (“ARHHH!”, “AGAIN?!”, “MY FACE!”) with lines that reference the current transformation.

### Draft voice palette for all ten levels

This table describes the voice direction; the runtime file contains the final level 1–6 pools. Levels 7–10 remain draft examples. Lines are selected from shuffled event pools, not spoken as a fixed script.

| Level | Character angle | Example randomized lines |
| --- | --- | --- |
| 1 — Marble Guardian | An offended monument disturbed at work. | “WHO CLICKED ON ME?” / “I am a monument. Show some respect.” / “ARHHH! My good side!” |
| 2 — Marble Swarm | Turns its own destruction into a boast. | “Every piece of me is a masterpiece.” / “Meet my smaller opinions.” / “I call this crowd support.” |
| 3 — Shattered Halo | Convinced it deserves divine admiration. | “Even my ego has an orbit.” / “Admire the halo. From a distance.” / “That gap is a design choice!” |
| 4 — Meteor Rain | Treats the sky as its personal stage. | “Forecast: me.” / “I requested a standing ovation. This will do.” / “ARHHH! Who approved this weather?” |
| 5 — Orbiting Armour | Obsessed with status and appearance. | “These are designer shields.” / “You scratched the premium finish!” / “My personal space has security.” |
| 6 — Sweeping Gaze | Believes its attention is a privilege. | “All eyes on me. Especially mine.” / “You cannot dodge my greatness.” / “Hold still. I am making a point.” |
| 7 — Marble Mirage | Three copies make its ego even louder. | “One of me was clearly not enough.” / “Finally. Intelligent company.” / “WE ARE ALL THE ORIGINAL!” |
| 8 — Borrowed Time | Refuses to accept a bad moment. | “That hit never happened.” / “Time itself asked for my autograph.” / “Rewind. I looked better earlier.” |
| 9 — Gates of Olympus | Acts as if space belongs to it. | “I do not take detours. Space does.” / “Your exit is my entrance.” / “WHO LET THAT BULLET THROUGH?” |
| 10 — The Marble Leviathan | Makes its transformation a grand performance. | “You wanted character development?” / “Behold my final sculpture!” / “This is not defeat. It is an artistic breakup.” |

### Dialogue events and selection

- Provide separate pools per level for awakening/entrance, power reveal, occasional damage reaction, player life lost, and statue defeat. The implemented events are entrance, attack, hurt, player-hit taunt, and defeat. Idle chatter is a possible future addition.
- Make the first power reveal understandable; afterwards vary the line so retries feel lively. Keep essential instructions and attack warnings deterministic even when flavour text is random.
- Use a shuffled pool or recent-line exclusion to avoid immediate repeats. Exhaust several alternatives before repeating a joke. Short barks supplement each level's voice instead of replacing it.
- Speech lasts 3.2 seconds of simulation time, with a five-second chatter cooldown. Hurt reactions are sampled sparingly. Entrance and defeat have priority; bullet-hit spam cannot replace them. Recent lines are remembered across attempts in the same page session.
- Level 7 can use occasional brief clone disagreement or a synchronized shout, but show one readable exchange at a time rather than three overlapping bubbles.
- Keep bubbles short, legible, and clear of warnings, the HUD, and touch controls. Pause dialogue timers with gameplay and clear them on exit, retry, or level transition.
- Keep accessibility announcements useful: announce significant reveals and warnings; avoid overwhelming screen-reader users with every random taunt. Text works with sound muted; new voice acting is not required by this plan.

### Topical and news-inspired banter

- Occasionally rotate in a small, curated set of topical jokes expressed through the statue's ego. Everyday boasts remain the majority so the character still works after a news cycle ends.
- Example tone, not claims about current headlines: “Everyone is launching AI. I have been judging humans for centuries.” / “Another product launch? I invented standing here.” / “Apparently everyone is going viral. I prefer monumental.”
- If a line references an actual news event, verify the event when writing it and give the line an expiry date or review date. Retire stale references while retaining the evergreen fallback pool.
- Store optional topical lines with an ID, eligible levels/events, active dates, and an evergreen fallback. Review them as authored game copy; automatic live-news ingestion is not part of this plan.
- Keep the joke centred on the statue's absurd self-importance. Topical jokes must remain understandable without knowing the headline and must not crowd out power-specific personality.

### Dialogue acceptance checks

- Every level has distinct lines that relate to its identity; replaying a level produces variety without immediate repetition.
- Damage spam, three clones, and repeated event callbacks cannot flood speech or audio.
- Expired topical lines fall back cleanly, with no network dependency during play.
- Check readability on a short landscape phone and verify pause/resume, retry, exit, and screen-reader behaviour.

## Continue and Start Over

### Checkpoint behavior

Continue resumes **at the beginning of the saved level**, with fresh lives including purchased upgrades, zero attempt marble, and a clean world. It does not restore mid-fight coordinates, projectiles, or remaining health. Pause/Resume preserves a live attempt only while that game session remains open.

| Event | Saved progress | What happens next |
| --- | --- | --- |
| First play | Resume level 1; no completed levels | Start level 1. |
| Exit, reload, close the browser, or lose during level N | Keep level N | Continue or Retry starts level N again. |
| Clear level N with a next shipped level | Record N completed and save N + 1 immediately | Next level starts N + 1; leaving on the victory screen still preserves it. |
| Clear the last shipped level | Record campaign complete and keep the final valid level | Offer Replay final level or Start Over; never load a missing level. |
| Cancel Start Over | No change | Keep the saved campaign. |
| Confirm Start Over | Reset campaign completion and resume level to 1 | Start level 1 with upgraded starting lives. Keep the marble bank, purchased upgrades, lifetime milestones, and independent best haul. |

Start Over must explain what it resets before erasing a real save: **“Start again at level 1? Your saved level progress will reset. Your marble bank, upgrades and best haul will stay.”** Offer Start Over and Cancel. This is an in-game player action, not an implementation approval gate.

### Storage contract

The scoreboard now supplies the identity and Neon connection. Named players use **server checkpoints**, not a local best-score or legacy streak value.

- `olympus_progress` is keyed by signed-cookie player ID and environment (`production`, `preview`, `development`). It stores `highest_completed`, a campaign `epoch`, `updated_at`, and the resource bank/upgrade fields described below.
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
- The revised scoreboard is versioned as `olympus-5` for marble resources, direct desktop movement, and upgrade-aware rules. Historical results remain in Neon unless explicitly removed; the current board ranks the new rules separately. Existing player names, level checkpoints, local best scores, and previously shared score-card links remain.

### Database deployment

`db/004-level-progress.sql` adds the checkpoint table and nullable session epoch without deleting historical data. `db/006-marble-resources.sql` adds the persistent marble bank, lifetime collection, highest-ever milestone, and purchased upgrade ranks. It starts existing wallets at zero without converting historical scores, and retains existing completed milestones. Vercel runs `npm run db:migrate && npm run build`; the existing migration runner records applied files and runs each migration transactionally. A failed migration blocks deployment. Local development may build without database credentials; `npm run db:migrate` needs `DATABASE_URL`. Neither secrets nor generated screenshots are committed.

## Implementation sequence

1. **Complete: level model and wording.** Catalogue, level/power names, distinct attempt IDs, fixed baseline tuning, HUD/pause/endings/guide and scoreboard wording.
2. **Complete: saved progression and menus.** Signed player checkpoints, immediate win saves, retry/continue, final-level behavior, Start Over, guest fallback and explicit save failures.
3. **Complete: revised Marble Swarm.** Three separately warned shoulder volleys, shootable non-splitting fragments, profile-specific hazard budget, finite lifetime and recovery.
4. **Complete: revised levels 3–6.** Two halo rings with shifting gaps; three targeted rain waves; shields that absorb shots and then launch after warning; wider outbound/return laser sweeps. Breaking a shield no longer awards free statue damage. All use bounded hazards and explicit cleanup.
5. **Open: human playtest and polish.** Test keyboard, phone/tablet joystick, real iPhone Safari and its Home Screen app. Prioritize distinctiveness, enjoyment, clarity, and memorable reveals. Use challenge and encounter duration to refine the experience, not to enforce equal difficulty.
6. **Planned next: levels 7–10.** Marble Mirage, Borrowed Time, Gates of Olympus, and The Marble Leviathan, as specified above. Implement and validate one profile at a time.
7. **Complete for levels 1–6: statue dialogue and Earth mission story.** Per-level event pools, repetition control, dramatic barks, simulation-time cooldowns. Levels 7–10 dialogue and curated topical rotations remain planned.
8. **Later: levels 11–100.** Expand after the initial ten are stable. The number 100 remains future scope, not shipped content.

## Marble resources and ten-level refits

The user approved marble as a persistent resource that can be spent on ship upgrades at ten-level increments. This replaces generic points in player-facing copy. Keep the internal `score` fields and shared-result URLs compatible; they represent the marble haul for one attempt, not the spendable wallet.

- **MARBLE** is the current attempt's haul; **BEST HAUL** is the highest single-attempt haul; **Top collectors** ranks each player's best haul. The private **MARBLE BANK** accumulates accepted completed attempts, including losses. Exiting or reloading an unfinished attempt does not bank its cargo. Desktop icon/window rewards count as salvage bonuses converted to marble.
- Named players bank marble on the server in the same atomic operation that saves their result and checkpoint. Duplicate submissions, retries, and concurrent identical requests must not credit twice. Failed or reset-invalidated submissions do not credit marble. An old saved result does not retroactively mint currency.
- Guest marble stays in the browser with guest progress and never merges into a named account. Missing resource data in an old save starts at zero. Corrupt resource data is rejected, not silently treated as a trustworthy wallet.
- The bank, lifetime collected total, purchased upgrades, and highest-ever cleared level survive Start Over. The campaign epoch still rotates. Replaying a milestone or resetting a campaign cannot unlock the same upgrade allowance twice.
- Clearing levels **10, 20, 30, ... 100** earns one refit allowance per milestone. Unused allowances remain available. A refit spends marble on one upgrade choice; a player may save it for later. The choices are an extra life (maximum three purchases), faster firing (maximum four purchases), or longer protection after a hit (maximum four purchases). Cost is 10,000 marble times the next total purchase number. No purchase is possible without an earned allowance and sufficient banked marble.
- Upgrades apply to the next attempt: each extra-life purchase adds one starting life, each firing purchase reduces the 0.20-second cooldown by 0.02 seconds, and each protection purchase adds 0.5 seconds to the base two-second protection. Starting a named attempt takes its upgrade snapshot from the server. Movement speed is unaffected.
- **Only levels 1–6 are currently playable.** Display the bank and explain the first refit at level 10; do not unlock missing levels or imply the milestone can already be reached. Levels 7–10 remain the separately planned expansion above. Refit prices and effects are initial tuning to revisit with that expansion.
- Every shipped level has its own short Earth mission briefing, victory line, and retry line, alongside the existing randomized statue dialogue. Display the briefing on the player screen and in the pause menu, and show the next briefing on victory before continuing. Do not add a timed interruption during combat.

| Level | Mission briefing | Victory line |
| --- | --- | --- |
| 1 · Marble Guardian | Earth needs its first shipment. Unfortunately, the marble has an owner. | First shipment secured. The rebuilding begins. |
| 2 · Marble Swarm | Earth requested a bulk delivery. The guardian took that personally. | Swarm collected. Construction crews send their thanks. |
| 3 · Shattered Halo | Our orbital station needs repairs. That halo looks suspiciously useful. | Halo recovered. Earth's orbital repairs can begin. |
| 4 · Meteor Rain | Supply reserves are running low. Today's forecast: falling resources. | Storm survived. Earth's stockpiles are filling up. |
| 5 · Orbiting Armour | Our supply ships need stronger hulls. His armour might fit. | Armour salvaged. The next fleet will travel safer. |
| 6 · Sweeping Gaze | Earth needs a new navigation beacon. He seems rather attached to the light. | Shipment secured. A little of his brilliance will guide ships home. |

Verification must cover wallet persistence, win/loss banking, duplicate/concurrent result handling, reset retention and stale-attempt rejection, environment isolation, milestone/replay gates, insufficient funds, concurrent purchases, guest migration, and upgrade effects. Review wording on the HUD, pause/results screens, guide, player screen, leaderboard, and shared cards on desktop and short landscape phones.

## Future 100-level direction

A possible structure is ten themed chapters of ten levels. Chapters organize different powers, visual motifs, personalities, and pattern variations. They may also vary in challenge, but creative identity is the reason to progress. Reuse validated mechanics through new arrangements, rhythms, and combinations that feel distinct.

Level 100 should have a distinctive finale and story payoff. It may be harder, combine familiar powers, or introduce a new transformation when that serves the experience. Build readable combinations and satisfying recovery; extra health alone is not a memorable finale. Save a checkpoint at every level rather than requiring 100 consecutive wins.

## Engineering map

| Area | Expected work |
| --- | --- |
| `src/components/games/olympus/olympus.ts` | Level/power selection, attack state, consistent tuning, shared hazard limits. Remove old progression multipliers. |
| `src/components/games/olympus/draw.ts` | Distinct warnings, destructible swarm visuals, safe gaps, per-power effects. |
| `src/components/games/olympus/OlympusGame.tsx` | HUD/announcements, level endings, checkpoint event timing, retries, cleanup. |
| `src/components/desktop/Desktop.tsx` | Start a selected/saved level; separate attempt/remount ID from progression; preserve desktop and fullscreen cleanup. |
| `src/components/games/olympus/GameContext.tsx` and a focused progress helper | Storage schema, validation, migration, save-result handling, start/continue controls. |
| `src/components/window/OlympusWindow.tsx` | Continue / Play / Start Over choices and saved-level information. |
| `src/config/site.ts`, `src/components/games/olympus/dialogue.ts` | Earth mission story, power instructions, per-level dialogue pools and speech scheduling. |
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
- Each level has a distinct power, presentation, or interaction. Per-level difficulty tuning supports its identity; higher stats alone do not satisfy the creative requirement.
- A test verifies that increasing the level ID alone does not scale global enemy stats or shorten warnings.
- Every pattern leaves a reachable escape route on the smaller landscape playfield, respecting the phone's slower movement and the control area.
- Retry, death, pause/resume, rotation, exit, and level transitions never leak projectiles, attack timers, audio, input, or save events.
- Compare fight duration, win rate, and player feedback across profiles and devices. Existing simulation bots need adaptation for new powers; historical percentages alone are not evidence of fairness.

### Regression checks

- Build, type-check, and lint succeed, allowing only documented existing warnings.
- Preserve joystick braking, simultaneous steering/firing, desktop arrows, and long-press prevention. Desktop movement follows the ship's heading while thrust is held, stops immediately on release, and has no firing recoil.
- Preserve fullscreen fallback, landscape gating, taskbar restoration, icon/manifest behavior, and access to Story & how to play.
- Screenshots and browser checks cover desktop plus short landscape phones/tablets. Headless checks do not replace real Safari/Home Screen or human fairness testing.

## Verification recorded for the levels 1–6 implementation

- `npm run test:leaderboard`: 16 checks executing the real route/server SQL against PostgreSQL (PGlite), including cookie ownership, environment isolation, immediate checkpoints, loss/exit, duplicate and concurrent wins, reset invalidation, final replay, score retention and rate limits.
- `npm run test:game`: 16 checks for phone/tablet/keyboard controls, drift and hitbox, all six profiles' fixed stats, warning/recovery/hazard budgets, non-splitting swarm, safe rain lanes, armour damage credit, resize/death/victory cleanup and progress validation/migration.
- Production build and TypeScript pass. ESLint passes with the pre-existing `opengraph-image.tsx` image warning.
- Headless Edge browser checks use mocked player/score API responses and the real built game: desktop 1280×800 and phone 667×320 cover returning level 2, reset/cancel, retained best score, reload, pause/resume, mobile-only joystick and exit. They complement the real SQL tests; they are not a live Neon or physical iPhone test.
- Seeded legacy-bot diagnostics (20 attempts/profile/device) show no rising difficulty formula and no longer require later levels to be harder. New powers often finish faster than the original guardian because the bot can fire more consistently. These keyboard-oriented bots do not establish touch balance or equal difficulty. Human comparisons of enjoyment, readability, and distinctiveness remain required.

## Current difficulty and story revision

- The user approved stronger encounters, level-specific speech, and a marble-resource expedition from Earth. Levels 7–10 are still concepts, not part of this implementation.
- Initial revised-pattern simulations still ended several encounters after roughly one cycle. Level 2–6 health was therefore tuned from 38 to 48; level 1 remains unchanged. This is an explicit tuning choice, not an endlessly increasing level multiplier.
- Swarm: three waves, 225 base fragment speed; halo: two rings, 190 speed, 72-degree gaps offset from the player; rain: three waves, two threatened lanes out of five, 245 fall speed and locked target positions; armour: 2.4-second orbit, warned aimed launch at 245 speed; gaze: 2.1-radian arc, 2.4 seconds per pass and a full return warning. Existing viewport scaling applies to fragment speed.
- Active budgets are 9/12 swarm fragments (touch/desktop), 12/16 halo fragments, 18 rain fragments (three waves of six), and three shields. Pieces live long enough to cross the playfield; a cycle ends once its last pieces are gone. Each wave is warned for 1.0/1.2 seconds (desktop/touch); cycle recovery is 1.0/1.2 seconds. Patterns clear on a boss death, victory, retry, and exit; resize keeps live attacks. Moving hazards never start within 60px of the ship.
- The earlier story-only resource framing is superseded by the saved marble bank and ten-level refit contract above. Desktop damage grants salvage bonuses converted to marble and provokes the guardian.
- Automated verification: 22 game/control/dialogue tests and 18 PostgreSQL-backed score/progress/share checks pass. TypeScript and the production build pass; lint has only the existing Open Graph image warning.
- Browser checks use the built game with mocked API responses. Short landscape phone checks cover each level 2–6 entrance, speech bounds, pause/resume expiry, and attack rendering; the Earth-resource guide is also checked. Screenshots remain local review artifacts.
- Thirty-seed legacy-bot diagnostics: desktop dodger median boss durations are 18.5s (L2), 15.5s (L3), 17.8s (L4), 12.6s (L5), and 14.8s (L6). The laser is substantially more dangerous. Several auto-aiming bots still perform well against shootable powers; these bots do not understand the new warnings and their phone scenarios still use keyboard steering. These results are diagnostics, not a claim of final human difficulty balance. Physical phone/tablet playtesting remains open.

## Marble implementation verification

- 28 game/control/dialogue/resource tests pass, including guest migration and persistence, milestone eligibility, escalating costs, upgrade caps, bank retention after Start Over, and gameplay effects.
- 21 PostgreSQL-backed route/server checks pass, including win/loss banking, identical-result concurrency, reset-invalidated attempts, private wallet responses, duplicate-purchase rejection, insufficient funds, environment isolation, and server-selected upgrade snapshots.
- Future milestone tests use controlled fixtures at levels 10 and 20. They do not add those levels to the playable catalogue. The real current catalogue remains levels 1–6.
- Production build, TypeScript and lint pass; lint retains the existing Open Graph image warning. Headless Edge checks at 1280×800 and 667×320 cover mission copy, the guide, marble labels, bank layout, a simulated future refit, retained bank after reset, upgraded lives, pause and mobile controls. Browser APIs are mocked; the database behavior is covered separately by the real PostgreSQL tests.
- Deployment runs the additive resource migration with the normal build before releasing the updated server. A migration failure blocks deployment.
