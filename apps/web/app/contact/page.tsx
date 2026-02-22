"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, MessageCircle, Loader } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw new Error("Failed to submit form");

      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-primary-dark py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white">Contact Us</h1>
          <p className="mt-2 text-brand-secondary-light">
            We'd love to hear from you. Get in touch with us today.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 text-xl font-bold">Get in Touch</h2>
              <p className="text-muted-foreground mb-6">
                Have a question or want to learn more about our products? 
                Contact us and we'll get back to you as soon as possible.
              </p>
            </div>

            {/* Location */}
            <div className="flex gap-4">
              <MapPin className="h-6 w-6 text-brand-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Visit Us</h3>
                <p className="text-sm text-muted-foreground">
                  49, 51 Second St
                  <br />
                  Mutare, Zimbabwe
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4">
              <Phone className="h-6 w-6 text-brand-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Call Us</h3>
                <a
                  href="tel:+263784923973"
                  className="text-sm text-brand-primary hover:underline"
                >
                  +263 78 492 3973
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4">
              <Mail className="h-6 w-6 text-brand-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <a
                  href="mailto:info@accessoriesworld.co.zw"
                  className="text-sm text-brand-primary hover:underline"
                >
                  info@accessoriesworld.co.zw
                </a>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex gap-4">
              <MessageCircle className="h-6 w-6 text-brand-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">WhatsApp</h3>
                <a
                  href="https://wa.me/263784923973"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-primary hover:underline"
                >
                  Message on WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-border bg-card p-8">
              <h2 className="mb-6 text-2xl font-bold">Send us a Message</h2>

              {success && (
                <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700">
                  ✓ Thank you! We've received your message and will get back to you soon.
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="+263 78 ..."
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={6}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-brand-primary px-6 py-3 font-semibold text-white hover:bg-brand-primary-light disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && (
                    <Loader className="h-4 w-4 animate-spin" />
                  )}
                  {loading ? "Sending..." : "Send Message"}
                </button>

                <p className="text-xs text-muted-foreground">
                  * Required fields. We'll also send a WhatsApp notification with your
                  inquiry.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
