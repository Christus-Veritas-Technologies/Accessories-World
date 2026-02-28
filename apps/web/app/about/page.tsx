"use client";

import Image from "next/image";
import { Users, Award, MapPin, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import StoreMap with ssr: false
const StoreMap = dynamic(() => import("@/components/store-map").then(mod => mod.StoreMap), {
  ssr: false,
  loading: () => <div className="w-full h-96 rounded-lg bg-gray-200 flex items-center justify-center"><p className="text-gray-600">Loading map...</p></div>
});

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-red-50 to-white px-4 py-16 sm:px-6 lg:px-8 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            About Accessories World
          </h1>
          <p className="text-lg text-gray-600">
            Your trusted partner for quality accessories and excellent service
          </p>
        </div>
      </section>

      {/* Founder's Vision Section */}
      <section className="border-b border-gray-200 px-4 py-16 sm:px-6 lg:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Founder Image Placeholder */}
            <Image 
              src="/team/kelvin.jpeg"
              className="rounded-2xl"
              width={400}
              height={800}
            />

            {/* Vision Content */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-6">
                Our Founder's Vision
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  "I started Accessories World with a simple belief: every Zimbabwean family deserves access to quality accessories at affordable prices. Too many people were struggling to find reliable products without breaking the bank."
                </p>
                <p>
                  "Our mission is to bridge that gap. We carefully curate every product in our collection to ensure it meets our standards for quality, durability, and value. Whether it's a phone accessory, home item, or everyday essential, we believe you shouldn't have to compromise on quality."
                </p>
                <p>
                  "Today, we're proud to serve thousands of families across Zimbabwe. But our journey is far from over. We're committed to expanding our selection, improving our service, and staying true to the values that got us here: integrity, quality, and customer-first thinking."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="border-b border-gray-200 bg-gray-50 px-4 py-16 sm:px-6 lg:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-3">
              Meet Our Team
            </h2>
            <p className="text-gray-600">
              Dedicated professionals committed to bringing you the best accessories and service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Sir Kelbin */}
            <Card className="border border-gray-200 bg-white p-6">
              <div className="flex flex-col items-center text-center">
                <img
                  alt="Takudzwa Jiri"
                  src="/team/kelvin.jpeg"
                  className="rounded-full w-48 h-48 object-cover"
                />
                <h3 className="text-lg font-bold text-black mb-1">Kelvin Mutsambi</h3>
                <p className="text-red-500 font-medium mb-3">Founder and Visionary</p>
                <p className="text-gray-600 text-sm">
                  Founder of Accessories World and the architect of the company’s long-term vision. Kelvin leads strategic development, digital transformation, and sustainable business growth initiatives aimed at building a modern customer-centered retail ecosystem in the cellphone accessories industry. 
                </p>
              </div>
            </Card>

            {/* Team Member 1 */}
            <Card className="border border-gray-200 bg-white p-6">
              <div className="flex flex-col items-center text-center">
                <img
                  alt="Takudzwa Jiri"
                  src="/team/shantel-korera.jpeg"
                  className="rounded-full w-48 h-48 object-cover"
                />
                <h3 className="text-lg font-bold text-black mb-1">Shantel Korera</h3>
                <p className="text-red-500 font-medium mb-3">Customer Experience Specialist</p>
                <p className="text-gray-600 text-sm">
                  Dedicated to delivering exceptional customer service by assisting clients in product selection, responding to enquiries, and ensuring a smooth and professional shopping experience that reflects the brand’s commitment to customer satisfaction.
                </p>
              </div>
            </Card>

            {/* Team Member 2 */}
            <Card className="border border-gray-200 bg-white p-6">
              <div className="flex flex-col items-center text-center">
                <img
                  alt="Takudzwa Jiri"
                  src="/team/takudzwa-jiri.jpeg"
                  className="rounded-full w-48 h-48 object-cover"
                />
                <h3 className="text-lg font-bold text-black mb-1">Takudzwa Jiri</h3>
                <p className="text-red-500 font-medium mb-3">Retail Support Specialist</p>
                <p className="text-gray-600 text-sm">
                 Supports daily retail operations by providing product guidance, customer assistance, and maintaining high service standards that strengthen customer relationships and brand loyalty
                 </p>
              </div>
            </Card>

             {/* Team Member 3 */}
            <Card className="border border-gray-200 bg-white p-6">
              <div className="flex flex-col items-center text-center">
                <img
                  alt="Takudzwa Jiri"
                  src="/team/tanaka-mugomba.jpeg"
                  className="rounded-full w-48 h-48 object-cover"
                />
                <h3 className="text-lg font-bold text-black mb-1">Tanaka Mugomba</h3>
                <p className="text-red-500 font-medium mb-3">Marketing Director & Branch Operations Manager</p>
                <p className="text-gray-600 text-sm">
                  Responsible for marketing strategy, digital advertising execution, and branch management operations. Tanaka oversees customer acquisition campaigns, product promotion systems, and service quality standards to ensure consistent retail excellence and business expansion.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Quality Section */}
      <section className="border-b border-gray-200 px-4 py-16 sm:px-6 lg:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Quality Content */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-6">
                Our Commitment to Quality
              </h2>
              <div className="space-y-4 text-gray-600 mb-8">
                <p>
                  We source our products from trusted manufacturers and distributors across Africa and internationally. Every product undergoes rigorous quality checks before reaching our shelves.
                </p>
                <p>
                  Our sourcing process focuses on:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Durability:</strong> Products built to last, not just to sell</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Reliability:</strong> Trusted manufacturers with proven track records</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Value:</strong> Best prices without compromising on quality</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Support:</strong> Warranty and after-sales support for peace of mind</span>
                  </li>
                </ul>
              </div>
              <Button asChild>
                <Link href="/products">Shop Our Collection</Link>
              </Button>
            </div>

            {/* Quality Image Placeholder */}
            <div className="flex items-center justify-center">
              <div className="w-full aspect-square max-w-sm rounded-lg bg-gradient-to-br from-red-100 to-red-50 border border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <Award className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Quality Assurance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Where to Find Us Section */}
      <section className="border-b border-gray-200 bg-gray-50 px-4 py-16 sm:px-6 lg:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-12">
            Where to Find Us
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map */}
            <div className="flex items-center justify-center">
              <StoreMap
                latitude={-18.865}
                longitude={32.661}
                storeName="Accessories World"
                address="49-51 Second Street, Mutare, Zimbabwe"
              />
            </div>

            {/* Location Info */}
            <div>
              <h3 className="text-xl font-bold text-black mb-6">Visit Our Store</h3>
              <Card className="border border-gray-200 bg-white p-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-black text-sm">Address</p>
                      <p className="text-gray-600 text-sm mt-1">
                        43 Second Street, Mutare<br />
                        Zimbabwe
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-black mb-2">Opening Hours</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Everyday: 7:30 AM - 6 PM</p>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="font-semibold text-black mb-2">Get Directions</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Located in the heart of Harare's shopping district, we're easy to find. Look for the red Accessories World sign.
                  </p>
                  <Button variant="outline" asChild>
                    <a
                      href="https://maps.google.com/?q=123+Main+Street+Harare+Zimbabwe"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open in Maps
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 sm:py-24 bg-red-50">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">
            Join the Accessories World Family
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you're looking for a specific product or browsing our collection, we're here to help you find exactly what you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
