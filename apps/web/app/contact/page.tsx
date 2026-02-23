import Image from "next/image";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ContactForm } from "@/components/contact-form";
import { siteConfig } from "@/lib/site";
import Link from "next/link";

export const metadata = {
  title: "Contact Us | Accessories World",
  description: "Get in touch with Accessories World. Call, email, or visit us in Mutare, Zimbabwe.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-red-50 to-white px-4 py-16 sm:px-6 lg:px-8 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600">
            We'd love to hear from you. Reach out to us anytime!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="space-y-6">
              {/* Logo & Brand */}
              <div className="mb-8">
                <Link href="/" className="inline-flex items-center gap-3">
                  <Image
                    src="/logo.jpg"
                    alt="Accessories World logo"
                    width={48}
                    height={48}
                    className="rounded-lg border border-gray-200 object-cover"
                  />
                  <div className="leading-tight">
                    <p className="text-base font-bold text-black">Accessories World</p>
                    <p className="text-xs text-gray-500">Mutare</p>
                  </div>
                </Link>
              </div>

              {/* Location */}
              <Card className="border border-gray-200 p-6">
                <div className="flex gap-4">
                  <MapPin className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-black mb-2">Address</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {siteConfig.location}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Phone */}
              <Card className="border border-gray-200 p-6">
                <div className="flex gap-4">
                  <Phone className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-black mb-2">Phone</h3>
                    <a
                      href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                      className="text-sm text-red-500 hover:text-red-600 transition-colors font-medium"
                    >
                      {siteConfig.phone}
                    </a>
                    <p className="text-xs text-gray-500 mt-2">Call us during business hours</p>
                  </div>
                </div>
              </Card>

              {/* Email */}
              <Card className="border border-gray-200 p-6">
                <div className="flex gap-4">
                  <Mail className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-black mb-2">Email</h3>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="text-sm text-red-500 hover:text-red-600 transition-colors font-medium"
                    >
                      {siteConfig.email}
                    </a>
                    <p className="text-xs text-gray-500 mt-2">We'll reply within 24 hours</p>
                  </div>
                </div>
              </Card>

              {/* Hours */}
              <Card className="border border-gray-200 p-6">
                <div className="flex gap-4">
                  <Clock className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-black mb-2">Hours</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Mon - Fri: 8:00 AM - 5:30 PM</p>
                      <p>Saturday: 8:00 AM - 3:00 PM</p>
                      <p className="text-red-500 font-medium">Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Action */}
              <Button asChild className="w-full bg-red-500 hover:bg-red-600 text-white">
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber.replace(/\s+/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat on WhatsApp
                </a>
              </Button>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-black mb-2">Send us a Message</h2>
                <p className="text-gray-600 mb-8">
                  Fill out the form below and we'll get back to you as soon as possible. You can choose to receive our response via email or WhatsApp.
                </p>
                <ContactForm />
              </Card>

              {/* Additional Info */}
              <div className="mt-8 p-6 rounded-lg bg-gray-50 border border-gray-200">
                <h3 className="font-semibold text-black mb-3">Why contact us?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-red-500">•</span>
                    <span>Product inquiries and recommendations</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500">•</span>
                    <span>Bulk orders and wholesale requests</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500">•</span>
                    <span>Technical support and troubleshooting</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500">•</span>
                    <span>Delivery and return inquiries</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500">•</span>
                    <span>Feedback and suggestions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-200 bg-gradient-to-r from-red-500 to-red-600 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-red-100 mb-8 max-w-2xl mx-auto">
            Visit our store in Mutare or browse our full selection of quality accessories online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-red-600 hover:text-red-700"
            >
              <Link href="/products">Browse Products</Link>
            </Button>
            <Button
              size="lg"
              asChild
              className="bg-white hover:bg-gray-100 text-red-600"
            >
              <Link href="/about">Visit About Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
