import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: 72,
          background: "#000",
          color: "#fff",
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: 22, color: "#c0c0c0", marginBottom: 16 }}>
          isyraf-afifi.com / Windows 98 desktop portfolio
        </div>
        <div
          style={{
            fontSize: 84,
            lineHeight: 1.05,
            fontWeight: "bold",
            color: "#ffffff",
          }}
        >
          {site.name}
        </div>
        <div
          style={{
            fontSize: 40,
            color: "#1084d0",
            marginTop: 20,
          }}
        >
          Fullstack Developer — AI & Cloud
        </div>
        <div
          style={{
            fontSize: 26,
            color: "#c0c0c0",
            marginTop: 36,
            display: "flex",
            gap: 28,
          }}
        >
          <span>KerjaKit</span>
          <span>Baymax</span>
          <span>Esportorium</span>
          <span>GCP ACE (in progress)</span>
        </div>
      </div>
    ),
    size
  );
}
