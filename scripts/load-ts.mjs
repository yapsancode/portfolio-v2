// Small CommonJS loader for testing the real DOM-free TypeScript rules.
import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
const cache = new Map();
export function loadTs(filename) {
  filename = path.resolve(filename);
  if (cache.has(filename)) return cache.get(filename);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const compiled = { exports: {} };
  const require = (name) => loadTs(path.resolve(path.dirname(filename), `${name}.ts`));
  new Function("require", "module", "exports", outputText)(require, compiled, compiled.exports);
  cache.set(filename, compiled.exports);
  return compiled.exports;
}
