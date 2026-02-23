import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Accessories World Zimbabwe — Every Accessory at an Affordable Price",
    template: "%s | Accessories World Zimbabwe",
  },
  description:
    "Your one-stop shop for mobile accessories and gadgets in Mutare, Zimbabwe. Shop earphones, earpods, Bluetooth speakers, radios, chargers, phone cases and more at affordable prices.",
  keywords: [
    "mobile accessories",
    "gadgets",
    "earphones",
    "earpods",
    "Bluetooth speakers",
    "radios",
    "chargers",
    "phone cases",
    "Zimbabwe",
    "Mutare",
    "affordable accessories",
    "Accessories World",
  ],
  authors: [{ name: "Accessories World Zimbabwe" }],
  creator: "Accessories World Zimbabwe",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_ZW",
    siteName: "Accessories World Zimbabwe",
    title: "Accessories World Zimbabwe — Every Accessory at an Affordable Price",
    description:
      "Your one-stop shop for mobile accessories and gadgets in Mutare, Zimbabwe.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Accessories World Zimbabwe",
    description:
      "Every accessory at an affordable price. Shop mobile gadgets in Mutare, Zimbabwe.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="apple-mobile-web-app-title" content="Accessories World" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#DC2626" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <Providers>
          <SidebarProvider>
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
