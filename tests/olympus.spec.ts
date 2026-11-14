import { test, expect, type Page } from "@playwright/test";
import * as rules from "../src/components/game/olympus";
import { emptySession, SAVE_KEY } from "../src/components/game/storage";
import { solve } from "../scripts/olympus-solver.mjs";

async function open(page: Page) {
  await page.goto("/olympus");
  await expect(page.locator(".swipe-board")).toBeVisible();
}
async function swipe(page: Page, dx: number, dy: number) {
  const box = (await page.locator(".swipe-pad").boundingBox())!;
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 3 });
  await page.mouse.up();
}
async function saved(page: Page) {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key) || "null"), SAVE_KEY);
}
async function advance(page: Page, direction: rules.Direction, moves: number) {
  // The animation locks input briefly, just as it does for physical gestures.
  await expect(page.locator(".swipe-game")).toHaveAttribute("data-busy", "false");
  await page.keyboard.press({ up: "ArrowUp", right: "ArrowRight", down: "ArrowDown", left: "ArrowLeft" }[direction]);
  await expect(page.locator(".swipe-game")).toHaveAttribute("data-moves", String(moves));
}

test("first swipe smashes, idle stays safe, reload resumes the exact turn", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await open(page);
  await expect(page).toHaveTitle(/Olympus/);
  await swipe(page, 60, 0);
  await expect(page.locator(".swipe-game")).toHaveAttribute("data-moves", "1");
  const before = await saved(page);
  expect(before.game.score).toBeGreaterThan(0);
  await page.waitForTimeout(500);
  expect((await saved(page)).game).toEqual(before.game);
  await page.reload();
  await expect(page.getByRole("dialog", { name: "Game paused" })).toBeVisible();
  expect((await saved(page)).game).toEqual(before.game);
  await page.getByRole("button", { name: "KEEP PLAYING" }).click();
  await advance(page, "up", 2);
  expect(errors).toEqual([]);
});

test("short, diagonal, cancelled and second-finger gestures do not create extra turns", async ({ page }) => {
  await open(page);
  await swipe(page, 10, 0);
  await swipe(page, 28, 27);
  await expect(page.locator(".swipe-game")).toHaveAttribute("data-moves", "0");
  const pad = page.locator(".swipe-pad");
  await pad.dispatchEvent("pointerdown", { pointerId: 12, clientX: 100, clientY: 100, pointerType: "touch" });
  await pad.dispatchEvent("pointermove", { pointerId: 12, clientX: 160, clientY: 100, pointerType: "touch" });
  await pad.dispatchEvent("pointercancel", { pointerId: 12, clientX: 160, clientY: 100 });
  await pad.dispatchEvent("pointerup", { pointerId: 12, clientX: 160, clientY: 100 });
  await expect(page.locator(".swipe-game")).toHaveAttribute("data-moves", "0");
  await pad.dispatchEvent("pointerdown", { pointerId: 13, clientX: 100, clientY: 100 });
  await pad.dispatchEvent("pointerdown", { pointerId: 14, clientX: 100, clientY: 100 });
  await pad.dispatchEvent("pointerup", { pointerId: 14, clientX: 160, clientY: 100 });
  await expect(page.locator(".swipe-game")).toHaveAttribute("data-moves", "0");
  await pad.dispatchEvent("pointerup", { pointerId: 13, clientX: 160, clientY: 100 });
  await expect(page.locator(".swipe-game")).toHaveAttribute("data-moves", "1");
});

test("real touch drag previews its landing and moves once", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "CDP touch injection is Chromium-only; WebKit exercises the pointer handlers separately.");
  await open(page);
  const cdp = await page.context().newCDPSession(page);
  const box = (await page.locator(".swipe-pad").boundingBox())!;
  const x = box.x + 90, y = box.y + box.height / 2;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + 65, y }] });
  await expect(page.locator(".swipe-destination")).toBeVisible();
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.locator(".swipe-game")).toHaveAttribute("data-moves", "1");
  await expect(page.locator(".swipe-destination")).toHaveCount(0);
});

test("a full round wins, credits once, unlocks Amber and replays", async ({ page }) => {
  await open(page);
  const path = solve(rules, rules.createGame())!;
  expect(path).not.toBeNull();
  for (const [i, direction] of path.entries()) await advance(page, direction, i + 1);
  await expect(page.getByRole("heading", { name: "God complex. Fixed." })).toBeVisible();
  expect((await saved(page)).profile.completed).toHaveLength(1);
  await page.reload();
  await expect(page.getByRole("dialog", { name: "Round result" })).toBeVisible();
  expect((await saved(page)).profile.completed).toHaveLength(1);
  await page.getByRole("button", { name: "Amber" }).click();
  expect((await saved(page)).profile.skin).toBe(1);
  await page.getByRole("button", { name: "SMASH ANOTHER" }).click();
  await expect(page.locator(".swipe-game")).toHaveAttribute("data-phase", "playing");
  expect((await saved(page)).game.board).toBe(1);
  expect((await saved(page)).profile.completed).toHaveLength(1);
});

test("dangerous landings lose hearts and losing can retry the same board", async ({ page }) => {
  await page.addInitScript(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), {
    key: SAVE_KEY, session: { ...emptySession(), game: { ...rules.createGame(), hearts: 1, warning: [29], moves: 2 } },
  });
  await open(page);
  await page.getByRole("button", { name: "KEEP PLAYING" }).click();
  await swipe(page, 60, 0);
  await expect(page.getByRole("heading", { name: "The statue won." })).toBeVisible();
  expect((await saved(page)).profile.completed).toHaveLength(0);
  await page.getByRole("button", { name: "TRY AGAIN" }).click();
  await expect(page.locator(".swipe-game")).toHaveAttribute("data-hearts", "3");
  expect((await saved(page)).game.board).toBe(0);
});

test("blur cancels an unfinished gesture and pause traps focus", async ({ page }) => {
  await open(page);
  await swipe(page, 60, 0);
  await page.waitForTimeout(240);
  const state = (await saved(page)).game;
  await page.locator(".swipe-pad").dispatchEvent("pointerdown", { pointerId: 33, clientX: 100, clientY: 100 });
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(page.getByRole("dialog", { name: "Game paused" })).toBeVisible();
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("[data-overlay]"))).toBe(true);
  }
  await page.getByRole("button", { name: "KEEP PLAYING" }).click();
  await page.locator(".swipe-pad").dispatchEvent("pointerup", { pointerId: 33, clientX: 100, clientY: 20 });
  expect((await saved(page)).game).toEqual(state);
});

test("corrupt or unavailable storage does not prevent playing", async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, "broken"), SAVE_KEY);
  await open(page);
  await expect(page.locator(".swipe-game")).toHaveAttribute("data-moves", "0");
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException("Denied", "SecurityError"); }; });
  await swipe(page, 60, 0);
  await expect(page.locator(".swipe-game")).toHaveAttribute("data-moves", "1");
  await expect(page.getByText("SAVING UNAVAILABLE ON THIS DEVICE")).toBeVisible();
});

test("buttons, mute and reduced motion work without gesture precision", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  await page.getByRole("button", { name: "Mute sound" }).click();
  await page.getByRole("button", { name: "SHOW BUTTONS" }).click();
  await page.getByRole("button", { name: /^Slide right/ }).click();
  await expect(page.locator(".swipe-game")).toHaveAttribute("data-moves", "1");
  expect((await saved(page)).profile.muted).toBe(true);
  expect(await page.locator(".swipe-cursor").evaluate(e => getComputedStyle(e).transitionDuration)).toBe("0s");
});

test("portrait sizes, tablet, desktop and landscape keep controls reachable", async ({ page }) => {
  await open(page);
  for (const [width, height] of [[360, 640], [390, 844], [412, 915], [768, 1024], [1280, 800], [844, 390]]) {
    await page.setViewportSize({ width, height });
    const board = (await page.locator(".swipe-board").boundingBox())!;
    expect(board.x).toBeGreaterThanOrEqual(0);
    expect(board.x + board.width).toBeLessThanOrEqual(width);
    expect(board.y + board.height).toBeLessThanOrEqual(height);
    const frame = page.locator(".swipe-game");
    expect(await frame.evaluate(e => e.scrollWidth <= e.clientWidth)).toBe(true);
    await page.getByRole("button", { name: "PAUSE / HELP" }).click();
    await expect(page.getByRole("button", { name: "KEEP PLAYING" })).toBeInViewport();
    await page.getByRole("button", { name: "KEEP PLAYING" }).click();
  }
});

test("portfolio launcher opens the same game and restores desktop focus", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, hasTouch: false, isMobile: false, deviceScaleFactor: 1, baseURL });
  const page = await context.newPage();
  await page.goto("/");
  await page.locator(".boot-screen").waitFor({ state: "hidden" });
  const about = page.locator('[data-window-id="about"]');
  await expect(about).toBeVisible();
  await page.locator('[data-icon-id="olympus"]').dblclick();
  await page.getByRole("button", { name: "LET’S BREAK THINGS" }).click();
  await expect(page.locator(".swipe-board")).toBeVisible();
  await swipe(page, 60, 0);
  await page.getByRole("button", { name: "Exit to desktop" }).click();
  await expect(page.locator(".swipe-game")).toHaveCount(0);
  await expect(about).toBeVisible();
  await expect(page.locator('[data-icon-id="olympus"]')).toBeFocused();
  await context.close();
});

test("phone launcher opens with one tap and returns to its icon", async ({ page }) => {
  await page.goto("/");
  await page.locator(".boot-screen").waitFor({ state: "hidden" });
  await page.locator('[data-icon-id="olympus"]').tap();
  await page.getByRole("button", { name: "LET’S BREAK THINGS" }).tap();
  await expect(page.locator(".swipe-board")).toBeVisible();
  await page.getByRole("button", { name: "Exit to desktop" }).tap();
  await expect(page.locator(".swipe-game")).toHaveCount(0);
  await expect(page.locator('[data-icon-id="olympus"]')).toBeFocused();
});

test("another tab's saved move pauses and refreshes this tab", async ({ page, context }) => {
  await open(page);
  await swipe(page, 60, 0);
  const other = await context.newPage();
  await other.goto("/olympus");
  await other.getByRole("button", { name: "KEEP PLAYING" }).click();
  await advance(other, "up", 2);
  await expect(page.getByRole("dialog", { name: "Game paused" })).toBeVisible();
  await expect(page.locator(".swipe-game")).toHaveAttribute("data-moves", "2");
  await other.close();
});
