import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Isyraf Portfolio | Creative Web Developer & Frontend Specialist',
  description:
    "Explore Isyraf’s portfolio of modern, responsive web development projects. Specializing in frontend development, UI/UX design, and creative digital experiences.",
  keywords: [
    'Isyraf',
    'portfolio',
    'web developer',
    'frontend developer',
    'UI/UX design',
    'creative web development',
    'responsive websites',
  ],
  authors: [{ name: 'Isyraf', url: 'https://isyraf-afifi.com' }],

  alternates: {
    canonical: 'https://isyraf-afifi.com',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },



  openGraph: {
    title: 'Isyraf Portfolio | Creative Web Developer & Frontend Specialist',
    description:
      "Explore Isyraf’s professional portfolio, featuring innovative projects in frontend development, UI/UX design, and creative digital solutions.",
    url: 'https://isyraf-afifi.com',
    siteName: 'Isyraf Portfolio',
    images: [
      {
        url: 'https://isyraf-afifi.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Isyraf Portfolio Preview',
      },
      {
        url: 'https://isyraf-afifi.com/og-square.jpg',
        width: 600,
        height: 600,
        alt: 'Isyraf Portfolio Square Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    site: '@isyraf', // replace with your actual handle
    creator: '@isyraf', // replace with your actual handle
    title: 'Isyraf Portfolio | Creative Web Developer',
    description:
      "Discover Isyraf’s web development projects, frontend expertise, and creative digital solutions.",
    images: ['https://isyraf-afifi.com/twitter-image.jpg'],
  },

  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Isyraf',
      url: 'https://isyraf-afifi.com',
      jobTitle: 'Creative Web Developer & Frontend Specialist',
      description:
        "Portfolio showcasing Isyraf’s expertise in modern, responsive web development, UI/UX design, and creative digital solutions.",
      sameAs: [
        'https://github.com/yapsancode',
        'https://linkedin.com/in/muhammad-isyraf-afifi',
      ],
    }),
  },
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}