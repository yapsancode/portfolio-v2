import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Isyraf Afifi — Software Engineer";

/* ------------------------------------------------------------------ */
/* Deterministic star field (stable across builds)                     */
/* ------------------------------------------------------------------ */

type Star = { x: number; y: number; r: number; o: number };

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildStars(count: number): Star[] {
  const rand = mulberry32(7);
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.round(rand() * 1200),
      y: Math.round(rand() * 630),
      r: 0.6 + rand() * 1.6,
      o: 0.1 + rand() * 0.42,
    });
  }
  return stars;
}

const STARS = buildStars(44);

/* ------------------------------------------------------------------ */
/* Image generation                                                    */
/* ------------------------------------------------------------------ */

export default async function Image() {
  const [regular, medium, bold, sculpture] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Inter-Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Inter-Medium.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Inter-Bold.ttf")),
    readFile(
      join(process.cwd(), "public/images/greek-male-sculpture.png"),
      "base64"
    ),
  ]);

  const sculptureSrc = `data:image/png;base64,${sculpture}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#050510",
          overflow: "hidden",
        }}
      >
        {/* Deep near-black → purple diagonal base */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            backgroundImage:
              "linear-gradient(45deg, #1a0a2e 0%, #0a0718 48%, #050510 100%)",
          }}
        />

        {/* Soft purple glow toward the lower-left */}
        <div
          style={{
            position: "absolute",
            left: -180,
            bottom: -240,
            width: 620,
            height: 620,
            borderRadius: "50%",
            backgroundImage:
              "radial-gradient(circle, rgba(90,45,150,0.42) 0%, rgba(90,45,150,0) 68%)",
          }}
        />

        {/* Cool rim glow behind the statue */}
        <div
          style={{
            position: "absolute",
            right: -140,
            top: -160,
            width: 720,
            height: 720,
            borderRadius: "50%",
            backgroundImage:
              "radial-gradient(circle, rgba(120,135,205,0.20) 0%, rgba(120,135,205,0) 70%)",
          }}
        />

        {/* Quiet, sparse stars */}
        {STARS.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              width: s.r,
              height: s.r,
              borderRadius: "50%",
              backgroundColor: "#e8e8f0",
              opacity: s.o,
            }}
          />
        ))}

        {/* Soft vignette */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            backgroundImage:
              "radial-gradient(circle, rgba(0,0,0,0) 42%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* Marble sculpture — hero, cropped upper body */}
        <div
          style={{
            position: "absolute",
            left: 660,
            top: 0,
            width: 540,
            height: 630,
            display: "flex",
            overflow: "hidden",
          }}
        >
          <img
            src={sculptureSrc}
            alt=""
            width={540}
            height={630}
            style={{
              width: 540,
              height: 630,
              objectFit: "cover",
              objectPosition: "top center",
              opacity: 0.96,
            }}
          />
          {/* Fade the lower figure gently into the bottom edge */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 230,
              backgroundImage:
                "linear-gradient(0deg, #050510 0%, rgba(5,5,16,0.55) 52%, rgba(5,5,16,0) 100%)",
            }}
          />
        </div>

        {/* Typography — left safe zone */}
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 80,
              lineHeight: 1.02,
              fontWeight: 700,
              color: "#f5f5f7",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              textShadow: "0 2px 24px rgba(0,0,0,0.5)",
            }}
          >
            Isyraf Afifi
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 38,
              lineHeight: 1.1,
              fontWeight: 500,
              color: "#c8c8d4",
              marginTop: 22,
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
            }}
          >
            Software Engineer
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 25,
              lineHeight: 1,
              fontWeight: 400,
              color: "rgba(200,200,212,0.62)",
              marginTop: 32,
              letterSpacing: "0.03em",
              whiteSpace: "nowrap",
            }}
          >
            code → cloud → production
          </div>
        </div>

        {/* Faint Windows-style taskbar strip (subtle nod to the site) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 4,
            opacity: 0.14,
            backgroundImage:
              "linear-gradient(90deg, #7a7a8a 0%, #c8c8d4 50%, #7a7a8a 100%)",
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: medium, weight: 500, style: "normal" },
        { name: "Inter", data: bold, weight: 700, style: "normal" },
      ],
    }
  );
}
