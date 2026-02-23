"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const blogUrl = process.env.NEXT_PUBLIC_BLOG_URL ?? "/blog";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-9 w-9 overflow-hidden rounded-lg transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/logo.jpg"
              alt="Accessories World"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Accessories World
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground hover:bg-muted/60"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={blogUrl}
            className="relative rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground hover:bg-muted/60"
          >
            Blog
          </a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center">
          <Button size="sm" className="gap-1.5" asChild>
            <Link href="/products">
              Browse Products
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[280px] p-0">
            <div className="flex flex-col h-full">
              {/* Mobile Logo */}
              <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border/60">
                <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                  <Image
                    src="/logo.jpg"
                    alt="Accessories World"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-base font-bold text-foreground">
                  Accessories World
                </span>
              </div>

              {/* Mobile Nav Links */}
              <nav className="flex flex-col gap-0.5 px-3 py-4 flex-1">
                <SheetClose asChild>
                  <Link
                    href="/"
                    className="rounded-lg px-4 py-3 text-[15px] font-medium text-foreground transition-colors duration-200 hover:bg-muted/60"
                  >
                    Home
                  </Link>
                </SheetClose>
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-lg px-4 py-3 text-[15px] font-medium text-foreground transition-colors duration-200 hover:bg-muted/60"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <a
                    href={blogUrl}
                    className="rounded-lg px-4 py-3 text-[15px] font-medium text-foreground transition-colors duration-200 hover:bg-muted/60"
                  >
                    Blog
                  </a>
                </SheetClose>
              </nav>

              {/* Mobile CTA */}
              <div className="px-4 pb-6">
                <SheetClose asChild>
                  <Button className="w-full gap-1.5" asChild>
                    <Link href="/products">
                      Browse Products
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
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
