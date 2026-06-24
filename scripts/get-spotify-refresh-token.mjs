// ============================================================================
//  One-time helper: get a Spotify refresh token for the "now playing" pill.
//
//  Usage:
//    1. Put SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET in .env.local
//       (or export them in your shell).
//    2. In the Spotify dashboard, add Redirect URI exactly:
//         http://127.0.0.1:8888/callback
//    3. Run:  node scripts/get-spotify-refresh-token.mjs
//    4. Open the printed URL, authorize, and the token prints in your terminal.
//
//  Zero dependencies — Node 20+ built-ins only.
// ============================================================================

import http from "node:http";
import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

const REDIRECT_URI = "http://127.0.0.1:8888/callback";
const PORT = 8888;
const SCOPES = ["user-read-currently-playing", "user-read-playback-state"];

// --- Load credentials (process env first, then .env.local) ------------------
function loadEnvLocal() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // no .env.local — rely on the shell environment
  }
}
loadEnvLocal();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "\n✗ Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET.\n" +
      "  Add them to .env.local (copy from .env.example) and re-run.\n",
  );
  process.exit(1);
}

const state = crypto.randomBytes(8).toString("hex");
const authUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPES.join(" "),
    redirect_uri: REDIRECT_URI,
    state,
  });

// --- Best-effort open the browser (Windows/macOS/Linux) ---------------------
// IMPORTANT (Windows): do NOT use `cmd /c start <url>`. cmd treats `&` as a
// command separator and mangles `%`-encoded chars, so the auth URL gets
// truncated at the first `&` and Spotify reports "client_id: Not present".
// PowerShell's Start-Process with a single-quoted URL passes it through intact.
// (Our auth URLs never contain a single quote, so the quoting is safe.)
function openBrowser(url) {
  try {
    if (process.platform === "win32") {
      spawn(
        "powershell",
        ["-NoProfile", "-NonInteractive", "-Command", `Start-Process '${url}'`],
        { stdio: "ignore", detached: true },
      ).unref();
    } else if (process.platform === "darwin") {
      spawn("open", [url], { stdio: "ignore", detached: true }).unref();
    } else {
      spawn("xdg-open", [url], { stdio: "ignore", detached: true }).unref();
    }
  } catch {
    /* fall back to the printed link */
  }
}

console.log("\n► Open this URL and authorize:\n");
console.log("  " + authUrl + "\n");
console.log(
  "  (A browser should open automatically. If it doesn't, or the page says\n" +
    '   "client_id: Not present", copy the FULL URL above into your browser —\n' +
    "   select the whole line, it's long.)\n",
);
openBrowser(authUrl);

// --- Catch the redirect, exchange the code for tokens -----------------------
const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith("/callback")) {
    res.writeHead(404).end();
    return;
  }
  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const done = (msg) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<html><body style="font-family:sans-serif;padding:2rem">${msg}</body></html>`);
  };

  if (error) {
    done(`Authorization failed: ${error}. Check your terminal.`);
    console.error(`\n✗ Spotify returned an error: ${error}\n`);
    server.close();
    process.exit(1);
  }
  if (returnedState !== state) {
    done("State mismatch — possible CSRF. Re-run the script.");
    console.error("\n✗ State mismatch. Re-run the script.\n");
    server.close();
    process.exit(1);
  }

  try {
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });
    const data = await tokenRes.json();
    if (!data.refresh_token) {
      throw new Error(JSON.stringify(data));
    }

    done("✓ Got it! Copy the refresh token from your terminal. You can close this tab.");
    console.log("\n✓ Success! Add this to .env.local (and Vercel env vars):\n");
    console.log("  SPOTIFY_REFRESH_TOKEN=" + data.refresh_token + "\n");
  } catch (err) {
    done("Token exchange failed — check your terminal.");
    console.error("\n✗ Token exchange failed:\n", err, "\n");
    process.exitCode = 1;
  } finally {
    server.close();
    // give the response a tick to flush before exiting
    setTimeout(() => process.exit(process.exitCode ?? 0), 250);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`  (waiting for the redirect on ${REDIRECT_URI} …)\n`);
});
