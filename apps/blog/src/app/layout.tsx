import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/consts";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_TITLE}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "accessories Mutare",
    "accessories Zimbabwe",
    "buy accessories Mutare",
    "wireless earbuds Mutare",
    "earbuds Zimbabwe",
    "gadgets Mutare Zimbabwe",
    "bags belts wallets Mutare",
    "Accessories World Mutare",
    "cheap earbuds Zimbabwe",
  ],
  authors: [{ name: "Accessories World Zimbabwe" }],
  creator: "Accessories World Zimbabwe",
  publisher: "Accessories World Zimbabwe",
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_TITLE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/blog-assets/blog-placeholder-1.jpg`,
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: "@AccessoriesWorld",
    images: [`${SITE_URL}/blog-assets/blog-placeholder-1.jpg`],
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="sitemap" href="/sitemap.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Accessories World Zimbabwe",
              url: SITE_URL,
              logo: `${SITE_URL}/blog-assets/blog-placeholder-1.jpg`,
              description: SITE_DESCRIPTION,
              sameAs: [
                "https://www.facebook.com/AccessoriesWorld",
                "https://www.instagram.com/AccessoriesWorld",
              ],
              address: {
                "@type": "PostalAddress",
                streetAddress: "Mutare, Zimbabwe",
                addressCountry: "ZW",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: SITE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
                },
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
