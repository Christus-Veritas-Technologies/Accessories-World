"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { mainNavLinks, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <Image
            src="/logo.jpg"
            alt="Accessories World logo"
            width={40}
            height={40}
            className="rounded-lg border border-gray-200 object-cover"
            priority
          />
          <div className="leading-tight">
            <p className="text-base font-bold text-black">Accessories World</p>
            <p className="text-xs text-gray-500">Mutare</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {mainNavLinks.map((link) => {
            const active = isActiveRoute(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-red-50 text-red-500"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <a href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}>Call Us</a>
          </Button>
          <Button size="sm" asChild className="bg-red-500 hover:bg-red-600 text-white">
            <Link href="/products">Shop Now</Link>
          </Button>
        </div>

        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-0">
            <div className="flex h-full flex-col">
              {/* Mobile Menu Header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <p className="text-base font-semibold text-black">Menu</p>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
                {mainNavLinks.map((link) => {
                  const active = isActiveRoute(pathname, link.href);

                  return (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "rounded-md px-4 py-3 text-sm font-medium transition-all",
                          active
                            ? "bg-red-50 text-red-500"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>

              {/* Mobile CTA Buttons */}
              <div className="space-y-2 border-t border-gray-200 p-4">
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                    asChild
                  >
                    <a href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}>
                      Call Us
                    </a>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white" asChild>
                    <Link href="/products">Shop Now</Link>
                  </Button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
