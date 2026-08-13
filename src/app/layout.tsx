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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — Fullstack Developer (AI & Cloud)`,
    template: `%s | ${site.shortName} Afifi`,
  },
  description:
    `${site.name} is a fullstack developer in Malaysia who ships AI products and runs the infra — KerjaKit, Baymax (Gamuda AI Academy 1st place), Esportorium, and more. Explore the portfolio styled as a Windows 98 desktop.`,
  keywords: [
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
    title: `${site.name} — Fullstack Developer (AI & Cloud)`,
    description:
      "Fullstack developer in Malaysia shipping AI products end-to-end — KerjaKit, Baymax, Esportorium.",
    siteName: `${site.shortName} Afifi`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Fullstack Developer (AI & Cloud)`,
    description:
      "Fullstack developer in Malaysia shipping AI products end-to-end.",
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
  jobTitle: "Fullstack Developer",
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
    "Kubernetes",
    "Terraform",
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
