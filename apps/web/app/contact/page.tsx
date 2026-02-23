"use client";

import { CheckCircle2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";
import { siteConfig } from "@/lib/site";

export default function ContactPage() {
  const benefits = [
    "Improve usability of your product",
    "Engage users at a higher level and outperform your competition",
    "Reduce the onboarding time and improve sales",
    "Balance user needs with your business goal",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-red-50 to-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Contact Us
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            Get in touch with us
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Fill out the form below or schedule a meeting with us at your convenience.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: Contact Form */}
            <div className="space-y-6">
              {/* Form Fields */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Message
                </label>
                <textarea
                  placeholder="Enter Your Message"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white text-gray-900 resize-none"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  defaultChecked
                  className="w-4 h-4 border border-gray-300 rounded cursor-pointer accent-red-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree with{" "}
                  <a href="#" className="text-gray-900 font-medium hover:text-red-500">
                    Terms and Conditions
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 h-auto">
                Send Your Request
              </Button>
            </div>

            {/* Right: Benefits and Locations */}
            <div className="space-y-12">
              {/* With our services you can */}
              <div>
                <h2 className="text-lg font-bold text-black mb-6">With our services you can</h2>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700 text-sm">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* USA */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-black">USA</h3>
                    <span className="text-2xl">🇺🇸</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>280 W. 7TH Street</p>
                    <p>4th floor Flat no: 402</p>
                    <p>New York NY, 10018</p>
                  </div>
                </div>

                {/* India */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-black">India</h3>
                    <span className="text-2xl">🇮🇳</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>Plot No. 2-45/BpTms</p>
                    <p>Banjaras Hills,Road No 10</p>
                    <p>Hyderabad, 500034</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="border-t border-gray-200 bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-lg font-bold text-black mb-8">You can also Contact Us via</h2>
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-16">
            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Mail className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Email
                </p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-gray-900 font-medium hover:text-red-500 transition-colors"
                >
                  {siteConfig.email}
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Phone className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Phone
                </p>
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                  className="text-gray-900 font-medium hover:text-red-500 transition-colors"
                >
                  {siteConfig.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
