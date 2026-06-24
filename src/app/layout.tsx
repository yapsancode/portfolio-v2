import type { Metadata, Viewport } from "next";
import { Archivo, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";
import { Analytics } from "@vercel/analytics/next"

// Brand background — mirrors `--lime` in globals.css (theme-color/manifest need a
// literal hex; meta tags can't read CSS custom properties).
const BRAND_COLOR = "#C6F432";

// Factual, entity-led description: who + what + stack + where + availability.
// Reads well for humans AND for answer/generative engines that quote it verbatim.
const DESCRIPTION = `${site.fullName} is a ${site.role.toLowerCase()} ${site.tagline.statement} Based in ${site.location}; open to remote frontend and fullstack roles.`;

const TITLE = `${site.fullName} — ${site.role}`;

// Heavy geometric grotesque for display type (the heavy lifting).
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

// Calmer geometric sans for body / UI text.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  // Lets every URL-based field below use relative paths (and is required once
  // we ship a file-based OG image). Override domain via NEXT_PUBLIC_SITE_URL.
  metadataBase: new URL(site.url),
  title: {
    default: TITLE,
    template: `%s — ${site.fullName}`,
  },
  description: DESCRIPTION,
  applicationName: `${site.fullName} — Portfolio`,
  authors: [{ name: site.fullName, url: site.url }],
  creator: site.fullName,
  publisher: site.fullName,
  category: "technology",
  keywords: [...site.keywords],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    firstName: "Isyraf",
    lastName: "Afifi",
    username: "yapsancode",
    title: TITLE,
    description: DESCRIPTION,
    url: site.url,
    siteName: `${site.fullName} — Portfolio`,
    locale: site.locale,
    // og:image is supplied automatically by app/opengraph-image.tsx.
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    // twitter:image is supplied automatically by app/twitter-image.tsx.
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  themeColor: BRAND_COLOR,
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
      < Analytics />
    </html>
  );
}
