"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone, MapPin, Mail, Zap, Headphones, Smartphone, Package, Shield, Headset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { TrendingProductsSection } from "@/components/home/trending-products-section";
import { siteConfig, homeHighlights } from "@/lib/site";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative border-b border-gray-200 bg-gradient-to-br from-white via-white to-gray-50 py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 lg:items-center">
            {/* Left side - Content */}
            <div className="flex flex-col justify-center">
              <h1 className="mb-6 text-4xl font-bold text-black sm:text-5xl lg:text-6xl leading-tight">
                Your One-Stop for Quality{" "}
                <span className="text-red-500">Accessories</span>
              </h1>
              <p className="mb-2 text-lg text-gray-600 sm:text-xl">
                {siteConfig.tagline}
              </p>
              <p className="mb-8 text-base text-gray-500 leading-relaxed max-w-md">
                Find everything you need for your phone and gadgets at prices that work for your pocket. From chargers to speakers, we have it all in one place.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Link href="/products" className="flex items-center gap-2">
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <a href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`} className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Call Us
                  </a>
                </Button>
              </div>
            </div>

            {/* Right side - Hero Image */}
            <div className="relative h-80 sm:h-96 lg:h-full min-h-80 rounded-lg overflow-hidden border border-gray-200 shadow-md bg-gray-100 flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image
                  src="/logo.jpg"
                  alt="Accessories World showcase"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Decorative badge */}
              <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                Best Prices
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="border-b border-gray-200 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl">
              Why Choose Accessories World?
            </h2>
            <p className="text-base text-gray-600 sm:text-lg">
              We are more than just a shop — we are your trusted accessory partner
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {homeHighlights.map((highlight, idx) => {
              const IconMap = {
                Shield: Shield,
                Headset: Headset,
                Zap: Zap,
              };
              const Icon = IconMap[highlight.icon as keyof typeof IconMap];
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-4 h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                    {Icon && <Icon className="h-6 w-6 text-red-500" />}
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-black">
                    {highlight.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {highlight.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Preview Section */}
      <section className="border-b border-gray-200 py-16 sm:py-24 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl">
              Browse Our Range
            </h2>
            <p className="mb-8 text-base text-gray-600 sm:text-lg max-w-2xl">
              We stock a wide selection of phone accessories, chargers, cables, earphones, speakers, and smart gadgets. Everything you need, all in one place.
            </p>
            <Button
              size="lg"
              asChild
            >
              <Link href="/products" className="flex items-center gap-2">
                View All Products <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Product categories placeholder */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Chargers & Cables", icon: Zap },
              { name: "Earphones & Speakers", icon: Headphones },
              { name: "Phone Cases", icon: Smartphone },
              { name: "Gadgets & More", icon: Package },
            ].map((category, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8 text-center shadow-sm hover:shadow-md hover:border-red-200 transition-all cursor-pointer group"
              >
                <div className="mb-4 flex justify-center">
                  <category.icon className="h-8 w-8 text-red-500 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Contact Section */}
      <section className="border-b border-gray-200 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            {/* Phone */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8 text-center shadow-sm">
              <div className="mb-4 flex justify-center">
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-red-500" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-black">Call Us</h3>
              <p className="mb-4 text-sm text-gray-600">Speak to our team directly</p>
              <a
                href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                className="text-red-500 font-semibold hover:text-red-600 transition-colors"
              >
                {siteConfig.phone}
              </a>
            </div>

            {/* Location */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8 text-center shadow-sm">
              <div className="mb-4 flex justify-center">
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-red-500" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-black">Visit Us</h3>
              <p className="mb-4 text-sm text-gray-600">Come see us in person</p>
              <p className="text-red-500 font-semibold text-sm">
                {siteConfig.location}
              </p>
            </div>

            {/* Email */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8 text-center shadow-sm">
              <div className="mb-4 flex justify-center">
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-red-500" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-black">Email Us</h3>
              <p className="mb-4 text-sm text-gray-600">Send us a message anytime</p>
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-red-500 font-semibold hover:text-red-600 transition-colors"
              >
                {siteConfig.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b border-gray-200 bg-gradient-to-r from-red-500 to-red-600 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Ready to find your perfect accessory?
          </h2>
          <p className="mb-8 text-base text-red-100 sm:text-lg max-w-2xl mx-auto">
            Browse our full selection of quality accessories at prices you can afford. Shop online or visit us in Mutare today.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-center">
            <Button
              size="lg"
              asChild
            >
              <Link href="/products" className="flex items-center gap-2">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              asChild
            >
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <TrendingProductsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />
    </main>
  );
}
