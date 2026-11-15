import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { neon } from "@neondatabase/serverless";

const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL in .env.local before running the migration.");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);
// The migration is trusted repository SQL, never user input.
try {
  await sql`CREATE TABLE IF NOT EXISTS olympus_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
  for (const name of readdirSync("db").filter((name) => /^\d+.*\.sql$/.test(name)).sort()) {
    const applied = await sql`SELECT name FROM olympus_migrations WHERE name = ${name}`;
    if (applied.length) continue;
    const statements = readFileSync(`db/${name}`, "utf8")
      .replace(/^--.*$/gm, "").split(";").map((s) => s.trim())
      .filter((s) => s && s !== "BEGIN" && s !== "COMMIT");
    await sql.transaction([
      ...statements.map((statement) => sql.query(statement)),
      sql`INSERT INTO olympus_migrations (name) VALUES (${name})`,
    ]);
    console.log(`Applied ${name}.`);
  }
  console.log("Olympus leaderboard schema is ready.");
} catch {
  console.error("Migration failed. Check the Neon connection and database permissions.");
  process.exitCode = 1;
}
