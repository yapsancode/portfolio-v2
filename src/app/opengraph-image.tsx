import { ImageResponse } from "next/og";
import { site } from "@/config/site";

// Branded link-preview card (Open Graph / link unfurls in Slack, iMessage,
// LinkedIn, Discord, X, etc.). Mirrors the hero's lime-on-charcoal art
// direction. Statically generated at build time.
export const alt = `${site.fullName} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LIME = "#C6F432";
const CHARCOAL = "#1A1B16";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: LIME,
          color: CHARCOAL,
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Eyebrow row: role + domain */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          <span>{site.role}</span>
          <span style={{ opacity: 0.7 }}>{site.url.replace(/^https?:\/\//, "")}</span>
        </div>

        {/* Hero name */}
        <div
          style={{
            display: "flex",
            fontSize: 116,
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: -4,
            maxWidth: 1040,
          }}
        >
          {site.fullName}
        </div>

        {/* Tagline pill */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              background: CHARCOAL,
              color: LIME,
              fontSize: 30,
              fontWeight: 600,
              padding: "16px 28px",
              borderRadius: 999,
            }}
          >
            {site.tagline.statement}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
