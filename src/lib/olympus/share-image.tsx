import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { levelInfo } from "./levels";
import { shareDate, type SharedScore } from "./sharing";

export async function scoreImage(score: SharedScore) {
  const [regular, bold] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Inter-Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Inter-Bold.ttf")),
  ]);
  const medal = score.rank ? ["#ffd966", "#d9e5f5", "#e6aa7d"][score.rank - 1] : "#ffd966";
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#070d18", color: "#f5f0de", fontFamily: "Inter", padding: 26 }}>
      <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
        {Array.from({ length: 20 }, (_, i) => <path key={`v${i}`} d={`M${i * 64} 0v630`} stroke="#121f30" strokeWidth="1" />)}
        {Array.from({ length: 10 }, (_, i) => <path key={`h${i}`} d={`M0 ${i * 64}h1200`} stroke="#121f30" strokeWidth="1" />)}
        {Array.from({ length: 24 }, (_, i) => <rect key={`s${i}`} x={(i * 197 + 71) % 1200} y={(i * 83 + 19) % 630} width="3" height="3" fill={i % 3 ? "#55718c" : "#e8ca6b"} />)}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", width: "100%", border: "2px solid #8c773b", padding: "32px 38px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="40" height="40" viewBox="0 0 40 40"><path d="M16 0h8v8h8v8h8v16H24v8h-8v-8H0V16h8V8h8z" fill="#ffd966" /><path d="M16 12h8v16h-8z" fill="#070d18" /></svg>
            <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: 6 }}>OLYMPUS</span>
          </div>
          <span style={{ fontSize: 16, letterSpacing: 3, color: "#91adbc" }}>ARCADE / SCORE RECORD</span>
        </div>
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 20, letterSpacing: 5, color: "#73dfc7", marginBottom: 12 }}>CHALLENGE ISSUED</span>
            <span style={{ fontSize: 36, fontWeight: 700 }}>{score.name}</span>
            <span style={{ fontSize: 116, lineHeight: 1.15, fontWeight: 700, letterSpacing: -5, color: "#ffd966" }}>{score.score.toLocaleString("en")}</span>
            <span style={{ fontSize: 17, letterSpacing: 6, color: "#91adbc" }}>POINTS ON THE BOARD</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 230, color: medal }}>
            {score.rank ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", position: "relative", width: 160, height: 150 }}>
              <svg width="160" height="150" viewBox="0 0 160 150">
                <path d="M30 0h30l20 35L100 0h30L95 65H65z" fill={medal} opacity=".5" />
                <path d="M50 42h60v12h16v16h12v48h-12v16h-16v12H50v-12H34v-16H22V70h12V54h16z" fill={medal} />
                <path d="M56 60h48v10h14v40h-14v18H56v-18H42V70h14z" fill="#111c2c" />
              </svg>
              <span style={{ display: "flex", position: "absolute", top: 64, left: 0, width: 160, justifyContent: "center", fontSize: 48, fontWeight: 700 }}>#{score.rank}</span>
              </div>
              <span style={{ fontSize: 18, letterSpacing: 3, marginTop: 22 }}>{["GOLD", "SILVER", "BRONZE"][score.rank - 1]} MEDAL</span>
              <span style={{ fontSize: 14, color: "#91adbc", marginTop: 10 }}>Rank snapshot</span>
              <span style={{ fontSize: 14, color: "#91adbc", marginTop: 6 }}>{shareDate(score.sharedAt)} UTC</span>
            </div> : <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <svg width="170" height="180" viewBox="0 0 170 180">
                <path d="M75 0h20v30h15v35h15v25h20v50h-30v-20H55v20H25V90h20V65h15V30h15z" fill="#e6e4d8" />
                <path d="M75 45h20v50H75z" fill="#73dfc7" /><path d="M65 135h40v25H95v20H75v-20H65z" fill="#ffd966" />
              </svg>
              <span style={{ fontSize: 16, letterSpacing: 3, marginTop: 22 }}>YOUR MOVE.</span>
            </div>}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #384238", paddingTop: 18, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <span style={{ fontSize: 18, color: "#73dfc7", fontWeight: 700 }}>LEVEL {String(score.level).padStart(2, "0")} / {score.outcome === "won" ? "CLEARED" : "REACHED"}</span>
            <span style={{ fontSize: 16, color: "#91adbc" }}>{levelInfo(score.level).name}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 7 }}>
            <span style={{ fontSize: 23, fontWeight: 700 }}>Think you can beat it?</span>
            <span style={{ fontSize: 17, color: "#ffd966" }}>isyraf-afifi.com/olympus</span>
          </div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630, fonts: [
      { name: "Inter", data: regular, weight: 400 }, { name: "Inter", data: bold, weight: 700 },
    ], headers: { "Cache-Control": "private, no-store", "Content-Disposition": `inline; filename="olympus-${score.id}.png"` } },
  );
}
