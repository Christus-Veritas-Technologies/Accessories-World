"use client";

import { CheckCircle2, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const contactMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send message");
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success("Thank you! Your inquiry has been sent successfully.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send your inquiry. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    contactMutation.mutate(formData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
            Fill out the form below or reach out to us directly at your convenience.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: Contact Form */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    disabled={contactMutation.isPending}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    disabled={contactMutation.isPending}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                {/* Phone (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Phone <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Your phone number"
                    disabled={contactMutation.isPending}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter your message"
                    rows={6}
                    disabled={contactMutation.isPending}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white text-gray-900 resize-none disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 h-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {contactMutation.isPending ? "Sending..." : "Send Your Request"}
                </Button>
              </form>
            </div>

            {/* Right: Benefits and Location */}
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

              {/* Location Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-black">Zimbabwe</h3>
                  <span className="text-2xl">🇿🇼</span>
                </div>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>43 Second Street</p>
                  <p>Mutare, Zimbabwe</p>
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
