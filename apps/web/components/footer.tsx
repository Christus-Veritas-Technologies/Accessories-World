import Link from "next/link";
import {
  Smartphone,
  MapPin,
  Phone,
  Package,
  ShieldCheck,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

const categoryLinks = [
  { href: "/products?category=earphones", label: "Earphones & Earpods" },
  { href: "/products?category=speakers", label: "Bluetooth Speakers" },
  { href: "/products?category=radios", label: "Radios" },
  { href: "/products?category=chargers", label: "Chargers & Cables" },
  { href: "/products?category=cases", label: "Phone Cases" },
];

export function Footer() {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? "/admin";
  const wholesalerUrl =
    process.env.NEXT_PUBLIC_WHOLESALER_URL ?? "/wholesale";
  const blogUrl = process.env.NEXT_PUBLIC_BLOG_URL ?? "/blog";

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white">
                <Smartphone className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Accessories World
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every accessory at an affordable price. Your one-stop shop for
              mobile accessories and gadgets in Zimbabwe.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                <span>49, 51 Second St, Mutare, Zimbabwe</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-brand-primary" />
                <a
                  href="tel:+263784923973"
                  className="hover:text-foreground transition-colors"
                >
                  +263 78 492 3973
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={blogUrl}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Categories
            </h3>
            <ul className="space-y-2">
              {categoryLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Portals
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={wholesalerUrl}
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Package className="h-4 w-4 text-brand-secondary" />
                  Wholesaler Portal
                </a>
              </li>
              <li>
                <a
                  href={adminUrl}
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ShieldCheck className="h-4 w-4 text-brand-primary" />
                  Admin Portal
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Accessories World Zimbabwe. All
            rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
