'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, MessageCircle, Loader } from 'lucide-react';
import { useSubmitContact } from '@/hooks/queries';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [success, setSuccess] = useState(false);
  const contactMutation = useSubmitContact();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(formData, {
      onSuccess: () => {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setSuccess(false), 5000);
      },
    });
  };

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-red-600 to-red-700 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white">Contact Us</h1>
          <p className="mt-2 text-red-100">
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
              <p className="text-gray-600 mb-6">
                Have a question or want to learn more about our products? 
                Contact us and we'll get back to you as soon as possible.
              </p>
            </div>

            {/* Location */}
            <div className="flex gap-4">
              <MapPin className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Visit Us</h3>
                <p className="text-sm text-gray-600">
                  49, 51 Second St
                  <br />
                  Mutare, Zimbabwe
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4">
              <Phone className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Call Us</h3>
                <a
                  href="tel:+263784923973"
                  className="text-sm text-red-600 hover:underline"
                >
                  +263 78 492 3973
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4">
              <Mail className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <a
                  href="mailto:info@accessoriesworld.co.zw"
                  className="text-sm text-red-600 hover:underline"
                >
                  info@accessoriesworld.co.zw
                </a>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex gap-4">
              <MessageCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">WhatsApp</h3>
                <a
                  href="https://wa.me/263784923973"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-red-600 hover:underline"
                >
                  Message on WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold">Send us a Message</h2>

              {success && (
                <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-green-700">
                  ✓ Thank you! We've received your message and will get back to you soon.
                </div>
              )}

              {contactMutation.error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
                  Error sending message. Please try again.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Your name"
                    disabled={contactMutation.isPending}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="your@email.com"
                    disabled={contactMutation.isPending}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="+263 78 ..."
                    disabled={contactMutation.isPending}
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Message *
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={6}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Tell us how we can help..."
                    disabled={contactMutation.isPending}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="w-full rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {contactMutation.isPending && (
                    <Loader className="h-4 w-4 animate-spin" />
                  )}
                  {contactMutation.isPending ? 'Sending...' : 'Send Message'}
                </button>

                <p className="text-xs text-gray-500">
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
