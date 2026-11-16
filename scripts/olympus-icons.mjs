// Export the existing desktop Olympus artwork as installable app icons.
// Run: node scripts/olympus-icons.mjs
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const source = await readFile(new URL("../src/components/desktop/PixelIcon.tsx", import.meta.url), "utf8");
const artwork = source.match(/olympus: \(\s*<>([\s\S]*?)<\/>\s*\)/)?.[1];
if (!artwork) throw new Error("Cannot find the Olympus pixel icon.");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" shape-rendering="crispEdges"><rect width="24" height="24" fill="#101014"/><g transform="translate(4 3)">${artwork}</g></svg>\n`;
await writeFile(new URL("../src/app/games/olympus/icon.svg", import.meta.url), svg);
for (const [size, file] of [
  [180, "../src/app/games/olympus/apple-icon.png"],
  [192, "../public/olympus-icon-192.png"],
  [512, "../public/olympus-icon-512.png"],
]) {
  const icon = await sharp(Buffer.from(svg)).resize(size, size, { kernel: "nearest" }).png().toBuffer();
  await writeFile(new URL(file, import.meta.url), icon);
}
console.log("Exported Olympus SVG and 180/192/512px PNG icons.");
