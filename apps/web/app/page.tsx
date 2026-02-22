import Link from "next/link";
import {
  Headphones,
  Speaker,
  Radio,
  BatteryCharging,
  Smartphone,
  Shield,
  Truck,
  Star,
  ArrowRight,
  MapPin,
  Phone,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categories = [
  {
    icon: Headphones,
    title: "Earphones & Earpods",
    description: "Wired and wireless earphones for every budget",
    href: "/products?category=earphones",
  },
  {
    icon: Speaker,
    title: "Bluetooth Speakers",
    description: "Portable speakers with powerful sound",
    href: "/products?category=speakers",
  },
  {
    icon: Radio,
    title: "Radios",
    description: "AM/FM radios for news and entertainment",
    href: "/products?category=radios",
  },
  {
    icon: BatteryCharging,
    title: "Chargers & Cables",
    description: "Fast chargers, USB cables and power banks",
    href: "/products?category=chargers",
  },
  {
    icon: Smartphone,
    title: "Phone Cases",
    description: "Protective cases for all phone models",
    href: "/products?category=cases",
  },
  {
    icon: Shield,
    title: "Screen Protectors",
    description: "Tempered glass and film protectors",
    href: "/products?category=protectors",
  },
];

const features = [
  {
    icon: Star,
    title: "Quality Products",
    description:
      "We source the best mobile accessories and gadgets to ensure durability and performance.",
  },
  {
    icon: Truck,
    title: "Wholesale Available",
    description:
      "Special pricing for bulk orders. Register as a wholesaler to access exclusive rates.",
  },
  {
    icon: Shield,
    title: "Trusted by Thousands",
    description:
      "Serving Mutare and all of Zimbabwe with reliable products and excellent service.",
  },
];

export default function Home() {
  const wholesalerUrl =
    process.env.NEXT_PUBLIC_WHOLESALER_URL ?? "/wholesale";

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary-dark to-brand-primary py-20 sm:py-28 lg:py-36">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-1.5 text-sm font-medium"
            >
              🇿🇼 Proudly Zimbabwean
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Every Accessory at an{" "}
              <span className="text-brand-secondary-light">
                Affordable Price
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-blue-100 sm:text-xl">
              Your one-stop shop for mobile accessories and gadgets in Mutare,
              Zimbabwe. From earphones to Bluetooth speakers, we have everything
              you need.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto text-base font-semibold"
                asChild
              >
                <Link href="/products">
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10 hover:text-white sm:w-auto text-base"
                asChild
              >
                <a href={wholesalerUrl}>
                  <Package className="mr-2 h-5 w-5" />
                  Wholesale Portal
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Shop by Category
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Find exactly what you need from our wide range of mobile
              accessories
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.title} href={category.href}>
                <Card className="group h-full transition-all duration-200 hover:shadow-lg hover:border-brand-primary/30 hover:-translate-y-1">
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white">
                      <category.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-muted/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Choose Accessories World?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We&apos;re committed to providing the best value in mobile
              accessories
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-brand-primary to-brand-accent p-8 sm:p-12 lg:p-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Are You a Wholesaler?
              </h2>
              <p className="mt-4 text-lg text-blue-100">
                Get access to our exclusive wholesale pricing. Sign in to your
                wholesaler account to view bulk rates and place orders.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto text-base font-semibold"
                  asChild
                >
                  <a href={wholesalerUrl}>
                    <Package className="mr-2 h-5 w-5" />
                    Wholesaler Sign In
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10 hover:text-white sm:w-auto text-base"
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
      <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Visit Our Store
              </h2>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-brand-primary" />
                  <span>49, 51 Second St, Mutare, Zimbabwe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-brand-primary" />
                  <a
                    href="tel:+263784923973"
                    className="hover:text-foreground transition-colors"
                  >
                    +263 78 492 3973
                  </a>
                </div>
              </div>
            </div>
            <Button size="lg" asChild>
              <Link href="/contact">
                Get Directions
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
