"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  Smartphone,
  LogIn,
  ShieldCheck,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? "/admin";
  const wholesalerUrl =
    process.env.NEXT_PUBLIC_WHOLESALER_URL ?? "/wholesale";
  const blogUrl = process.env.NEXT_PUBLIC_BLOG_URL ?? "/blog";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white transition-transform group-hover:scale-105">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight text-foreground">
              Accessories World
            </span>
            <span className="hidden text-[10px] font-medium leading-tight text-muted-foreground sm:block">
              Every accessory at an affordable price
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={blogUrl}
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Blog
          </Link>
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="outline" size="sm" asChild>
            <a href={wholesalerUrl}>
              <Package className="mr-1 h-4 w-4" />
              Wholesaler Sign In
            </a>
          </Button>
          <Button variant="default" size="sm" asChild>
            <a href={adminUrl}>
              <ShieldCheck className="mr-1 h-4 w-4" />
              Admin
            </a>
          </Button>
        </div>

        {/* Mobile Menu Trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[300px] sm:w-[350px]">
            <div className="flex flex-col gap-6 pt-6">
              {/* Mobile Logo */}
              <div className="flex items-center gap-2 px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary text-white">
                  <Smartphone className="h-4 w-4" />
                </div>
                <span className="text-lg font-bold text-foreground">
                  Accessories World
                </span>
              </div>

              {/* Mobile Nav Links */}
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <a
                    href={blogUrl}
                    className="rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    Blog
                  </a>
                </SheetClose>
              </nav>

              {/* Mobile Sign-in Buttons */}
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <Button variant="outline" asChild className="w-full justify-start">
                  <a href={wholesalerUrl}>
                    <Package className="mr-2 h-4 w-4" />
                    Wholesaler Sign In
                  </a>
                </Button>
                <Button variant="default" asChild className="w-full justify-start">
                  <a href={adminUrl}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Admin Sign In
                  </a>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
