import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

export function loadRules() {
  const dir = mkdtempSync(join(tmpdir(), "olympus-swipe-"));
  for (const file of ["boards", "olympus", "swipe-input", "storage"]) {
    const source = readFileSync(new URL("../src/components/game/" + file + ".ts", import.meta.url), "utf8");
    writeFileSync(join(dir, file + ".js"), ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText);
  }
  const require = createRequire(import.meta.url);
  return { ...require(join(dir, "boards.js")), ...require(join(dir, "olympus.js")),
    ...require(join(dir, "swipe-input.js")), ...require(join(dir, "storage.js")) };
}

