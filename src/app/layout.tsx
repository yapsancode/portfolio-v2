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

const siteUrl = "https://isyraf-afifi.com";
const pageTitle =
  "Isyraf Afifi — software engineer who likes building things";
const pageDescription =
  "Isyraf Afifi is a software engineer in Shah Alam, Malaysia who likes building software products, AI experiments, and side projects. This is his personal corner of the internet.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: pageTitle,
    template: `%s | ${site.shortName} Afifi`,
  },
  description: pageDescription,
  keywords: [
    "software engineer",
    "fullstack developer",
    "Malaysia",
    "Next.js",
    "React",
    "FastAPI",
    "Google Cloud",
    "AI",
    "DevOps",
    "Muhammad Isyraf Afifi",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: pageTitle,
    description: pageDescription,
    siteName: "Isyraf's Website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: siteUrl,
  email: site.email,
  jobTitle: "Software Engineer",
  alumniOf: [
    { "@type": "Organization", name: "Yayasan Gamuda x Google Cloud" },
    {
      "@type": "CollegeOrUniversity",
      name: "Management & Science University (MSU)",
    },
  ],
  knowsAbout: [
    "Next.js",
    "React",
    "TypeScript",
    "FastAPI",
    "Google Cloud",
    "Docker",
    "LangChain",
    "LLM evaluation",
    "Agentic AI",
    "PostgreSQL",
    "DevOps",
  ],
  sameAs: [
    "https://github.com/yapsancode",
    "https://linkedin.com/in/muhammad-isyraf-afifi",
    "https://kerjakit.com",
    "https://esportorium.com",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={vt323.variable}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
