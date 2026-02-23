import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Users,
  Truck,
  Award,
  ArrowRight,
  Target,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About Us",
  description:
    "Learn about Accessories World Zimbabwe — your trusted source for quality mobile accessories in Mutare.",
};

const values = [
  {
    icon: CheckCircle,
    title: "Quality",
    description:
      "We pick our products carefully. If it does not meet our standards, we do not sell it.",
  },
  {
    icon: Users,
    title: "Customer First",
    description:
      "You are the reason we exist. We listen, we help, and we make sure you are happy.",
  },
  {
    icon: Truck,
    title: "Reliability",
    description:
      "When we say we will deliver, we deliver. You can count on us every single time.",
  },
  {
    icon: Award,
    title: "Integrity",
    description:
      "Fair prices, honest advice, and no hidden surprises. What you see is what you get.",
  },
];

const reasons = [
  "A wide range of quality mobile accessories at fair prices",
  "Special wholesale pricing for businesses and resellers",
  "Reliable delivery across Zimbabwe",
  "A friendly team that helps you find the right product",
  "Products that are tested and built to last",
  "Easy ways to get in touch — phone, WhatsApp, or visit our store",
];

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-muted/60 to-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-primary">
            About Us
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Who We Are
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            We are Accessories World — a mobile accessories shop in Mutare,
            Zimbabwe, serving customers who want quality products at prices that
            make sense.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mission & Vision */}
        <section className="grid gap-6 py-16 sm:py-20 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card p-8 transition-all duration-300 hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Our Mission</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              To give everyone in Zimbabwe access to quality mobile accessories
              at prices they can afford. Whether you are buying one item for
              yourself or stocking your shop, we are here to help.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-8 transition-all duration-300 hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <Eye className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Our Vision</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              To become the most trusted name in mobile accessories in Zimbabwe.
              We want to be the first place people think of when they need a
              charger, earphones, or a phone case.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 sm:py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-primary">
              What We Stand For
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our Values
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-border/60 bg-card p-7 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 sm:py-20">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-8 sm:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                <Image
                  src="/logo.jpg"
                  alt="Accessories World"
                  fill
                  className="object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Our Story</h2>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Accessories World started with a simple idea: everyone deserves
                good quality accessories without paying too much. Based in
                Mutare, we opened our doors to serve local customers and have
                grown to reach people all across Zimbabwe.
              </p>
              <p>
                We stock everything from earphones and Bluetooth speakers to
                chargers, cables, phone cases, and screen protectors. Whether
                you walk into our store or shop online, you will find a wide
                selection at honest prices.
              </p>
              <p>
                For businesses and resellers, we offer a dedicated wholesale
                program with bulk pricing. We believe in supporting local
                entrepreneurs and helping them succeed.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 sm:py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-primary">
              The Difference
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Choose Accessories World?
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {reasons.map((reason, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 rounded-xl border border-border/60 bg-card p-5 transition-all duration-200 hover:border-brand-primary/30"
              >
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
                <span className="text-sm text-muted-foreground">{reason}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* CTA */}
      <section className="bg-brand-primary py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to shop?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Browse our collection or contact us for wholesale orders. We are
            always happy to help.
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
      </section>
    </>
  );
}
