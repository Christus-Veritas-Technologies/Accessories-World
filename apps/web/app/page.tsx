import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  Tag,
  Headset,
  Star,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  _count?: { products: number };
}

async function getCategories(): Promise<Category[]> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003/api";
    const res = await fetch(`${apiUrl}/categories`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const features = [
  {
    icon: Tag,
    title: "Fair, Honest Prices",
    description:
      "We keep our prices low so that everyone can get the accessories they need without breaking the bank.",
  },
  {
    icon: ShieldCheck,
    title: "Products You Can Trust",
    description:
      "Every item we sell is tested for quality. If it does not meet our standards, we do not stock it.",
  },
  {
    icon: Truck,
    title: "Fast Delivery Across Zimbabwe",
    description:
      "Order today and get your products delivered to your doorstep quickly and safely, wherever you are.",
  },
  {
    icon: Package,
    title: "Bulk Orders Welcome",
    description:
      "Whether you are a reseller or a business, we offer special wholesale pricing on large orders.",
  },
  {
    icon: Headset,
    title: "Friendly Customer Support",
    description:
      "Got a question? Our team is always ready to help you find the right product or solve any issue.",
  },
  {
    icon: Star,
    title: "Trusted by Thousands",
    description:
      "Customers across Mutare and Zimbabwe keep coming back because they know we deliver on our promises.",
  },
];

const stats = [
  { value: "2,000+", label: "Happy Customers" },
  { value: "500+", label: "Products Available" },
  { value: "50+", label: "Categories" },
];

export default async function Home() {
  const categories = await getCategories();

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/80 bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
              <MapPin className="h-3.5 w-3.5 text-brand-primary" />
              Proudly based in Mutare, Zimbabwe
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Every Accessory at an{" "}
              <span className="text-brand-primary">Affordable Price</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              From earphones to chargers, phone cases to Bluetooth speakers
              — we have everything you need for your phone and gadgets, all in
              one place.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base font-semibold gap-2"
                asChild
              >
                <Link href="/products">
                  Browse Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base"
                asChild
              >
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-primary">
              Browse by Category
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Find what you are looking for
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              We organize our products into clear categories so you can quickly
              find the exact accessory you need.
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group relative flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:shadow-lg hover:border-brand-primary/30 hover:-translate-y-0.5"
                >
                  {category.image ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-colors duration-300 group-hover:bg-brand-primary group-hover:text-white">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-brand-primary transition-colors duration-200">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground truncate">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-primary" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-14 text-center">
              <p className="text-muted-foreground">
                Categories are being set up. Check back soon!
              </p>
              <Button className="mt-4" asChild>
                <Link href="/products">View All Products</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-muted/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-primary">
              Why Choose Us
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Choose Accessories World?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              We are not just another accessories shop. Here is what makes us
              different from the rest.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border/60 bg-card p-7 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-extrabold tracking-tight text-brand-primary sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Trust */}
      <section className="bg-foreground py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-3xl font-bold leading-snug text-background sm:text-4xl">
            &ldquo;Accessories World has been our go-to supplier for over a
            year. The prices are fair, the products last, and they always
            deliver on time.&rdquo;
          </p>
          <div className="mt-8">
            <p className="font-semibold text-background/90">Happy Customer</p>
            <p className="text-sm text-background/60">Mutare, Zimbabwe</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-brand-primary p-10 sm:p-14 lg:p-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to find what you need?
              </h2>
              <p className="mt-4 text-lg text-white/80">
                Browse our full range of accessories or reach out to us for
                wholesale pricing. We are happy to help.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto text-base font-semibold gap-2"
                  asChild
                >
                  <Link href="/products">
                    Browse Products
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base border-white/30 text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="border-t border-border/60 bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 text-center sm:text-left sm:flex-row sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Visit Our Store
              </h2>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <MapPin className="h-5 w-5 text-brand-primary" />
                  <span>49, 51 Second St, Mutare, Zimbabwe</span>
                </div>
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <Phone className="h-5 w-5 text-brand-primary" />
                  <a
                    href="tel:+263784923973"
                    className="transition-colors duration-200 hover:text-foreground"
                  >
                    +263 78 492 3973
                  </a>
                </div>
              </div>
            </div>
            <Button size="lg" className="gap-2" asChild>
              <Link href="/contact">
                Get Directions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
