import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Wholesaler Portal — Accessories World",
    template: "%s | Wholesaler Portal — Accessories World",
  },
  description:
    "Accessories World wholesaler portal. Access wholesale pricing, place bulk orders, and manage your account.",
  robots: {
    index: false,
    follow: false,
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
        <meta name="theme-color" content="#DC2626" />
      </head>
      <body className="min-h-screen antialiased bg-background text-foreground">
        <Providers>
          <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 w-full">
              {children}
            </main>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
