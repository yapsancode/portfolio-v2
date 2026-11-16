// Runs every Last Stand test in scripts/finales, so adding a finale needs no change here or in package.json.
import { readdirSync } from "node:fs";
for (const file of readdirSync(new URL("./finales/", import.meta.url)).sort()) {
  if (file.endsWith(".test.mjs")) await import(`./finales/${file}`);
}
