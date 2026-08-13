import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/config/site";
import "./globals.css";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: `${site.shortName} Afifi — ${site.role}`,
  description: `${site.name} — ${site.role}. ${site.tagline} A portfolio styled as a Windows 98 desktop: open the icons, drag the windows.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={vt323.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
