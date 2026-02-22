import Link from "next/link";
import { CheckCircle, Users, Truck, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-primary-dark py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white">About Us</h1>
          <p className="mt-2 text-brand-secondary-light">
            Your trusted partner for quality mobile accessories since day one
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        {/* Mission & Vision */}
        <section className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To provide affordable, quality mobile accessories and gadgets to everyone 
              across Zimbabwe. We believe that everyone deserves access to reliable 
              products at fair prices, whether buying retail or wholesale.
            </p>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-bold">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              To become Zimbabwe's most trusted source for mobile accessories, known 
              for our commitment to quality, customer service, and fair pricing. We aim 
              to support local businesses and wholesalers with competitive bulk rates.
            </p>
          </div>
        </section>

        {/* Values */}
        <section>
          <h2 className="mb-8 text-3xl font-bold text-center">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <CheckCircle className="mx-auto mb-4 h-8 w-8 text-brand-primary" />
              <h3 className="font-semibold mb-2">Quality</h3>
              <p className="text-sm text-muted-foreground">
                We source only the best products that meet our strict quality standards.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <Users className="mx-auto mb-4 h-8 w-8 text-brand-primary" />
              <h3 className="font-semibold mb-2">Customer First</h3>
              <p className="text-sm text-muted-foreground">
                Your satisfaction is our priority. We're here to help and support you.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <Truck className="mx-auto mb-4 h-8 w-8 text-brand-primary" />
              <h3 className="font-semibold mb-2">Reliability</h3>
              <p className="text-sm text-muted-foreground">
                Consistent quality, dependable service, and fast delivery every time.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <Award className="mx-auto mb-4 h-8 w-8 text-brand-primary" />
              <h3 className="font-semibold mb-2">Integrity</h3>
              <p className="text-sm text-muted-foreground">
                Fair pricing, transparent dealings, and honest communication always.
              </p>
            </div>
          </div>
        </section>

        {/* Who We Are */}
        <section className="rounded-lg border border-border bg-muted/30 p-8">
          <h2 className="mb-6 text-2xl font-bold">Who We Are</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Accessories World is a leading mobile accessories retailer based in 
              Mutare, Zimbabwe. We've built our reputation on offering quality products 
              at affordable prices to both individual customers and wholesale buyers.
            </p>
            <p>
              Our product range includes earphones, Bluetooth speakers, radios, chargers, 
              cables, phone cases, screen protectors, and many other mobile accessories. 
              Whether you're looking for a single item or bulk orders, we have you covered.
            </p>
            <p>
              We're proudly Zimbabwean and committed to supporting local businesses and 
              entrepreneurs. Our dedicated wholesaler program offers special pricing and 
              services for bulk purchases.
            </p>
          </div>
        </section>

        {/* Why Choose Us */}
        <section>
          <h2 className="mb-8 text-2xl font-bold text-center">Why Choose Accessories World?</h2>
          <div className="space-y-4">
            {[
              "Wide selection of quality mobile accessories at competitive prices",
              "Special wholesale pricing for bulk orders and resellers",
              "Fast and reliable delivery across Zimbabwe",
              "Expert customer service and product recommendations",
              "Authentic products with warranty support",
              "Convenient online shopping with secure payment options",
            ].map((reason, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <CheckCircle className="h-6 w-6 text-brand-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{reason}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-lg bg-gradient-to-r from-brand-primary to-brand-primary-dark p-12 text-center text-white">
          <h2 className="mb-4 text-2xl font-bold">Ready to Shop?</h2>
          <p className="mb-6 text-brand-secondary-light">
            Explore our collection or contact us for wholesale inquiries
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/products"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-brand-primary hover:bg-brand-secondary-light transition-colors"
            >
              Browse Products
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-white px-6 py-3 font-semibold hover:bg-white/10 transition-colors"
            >
              Contact for Wholesale
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
