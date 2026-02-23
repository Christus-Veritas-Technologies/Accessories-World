import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

async function getCategories() {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003/api";
    const res = await fetch(`${apiUrl}/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function Footer() {
  const blogUrl = process.env.NEXT_PUBLIC_BLOG_URL ?? "/blog";
  const categories = await getCategories();

  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="relative h-9 w-9 overflow-hidden rounded-lg">
                <Image
                  src="/logo.jpg"
                  alt="Accessories World"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-lg font-bold text-foreground">
                Accessories World
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Your one-stop shop for quality mobile accessories and gadgets at
              prices that work for you.
            </p>
            <div className="space-y-2.5 text-sm text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                <span>49, 51 Second St, Mutare, Zimbabwe</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-brand-primary" />
                <a
                  href="tel:+263784923973"
                  className="transition-colors duration-200 hover:text-foreground"
                >
                  +263 78 492 3973
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-brand-primary" />
                <a
                  href="mailto:info@accessoriesworld.co.zw"
                  className="transition-colors duration-200 hover:text-foreground"
                >
                  info@accessoriesworld.co.zw
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={blogUrl}
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Categories (dynamic) */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Categories
            </h3>
            <ul className="space-y-2.5">
              {categories.length > 0 ? (
                categories.slice(0, 6).map((cat: { slug: string; name: string }) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link
                    href="/products"
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    View All Products
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Legal
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border/60 pt-8">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Accessories World Zimbabwe. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
