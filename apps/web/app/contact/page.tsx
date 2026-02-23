"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Loader2,
  Send,
  Clock,
} from "lucide-react";
import { useSubmitContact } from "@/hooks/queries";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [success, setSuccess] = useState(false);
  const contactMutation = useSubmitContact();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(formData, {
      onSuccess: () => {
        setSuccess(true);
        setFormData({ name: "", email: "", phone: "", message: "" });
        setTimeout(() => setSuccess(false), 5000);
      },
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      detail: "49, 51 Second St, Mutare, Zimbabwe",
      href: "https://maps.google.com/?q=49+51+Second+St+Mutare+Zimbabwe",
    },
    {
      icon: Phone,
      title: "Call Us",
      detail: "+263 78 492 3973",
      href: "tel:+263784923973",
    },
    {
      icon: Mail,
      title: "Email Us",
      detail: "info@accessoriesworld.co.zw",
      href: "mailto:info@accessoriesworld.co.zw",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      detail: "Message us on WhatsApp",
      href: "https://wa.me/263784923973",
    },
  ];

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-muted/60 to-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-primary">
            Contact
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Get in Touch
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Have a question about our products? Want to place a wholesale order?
            We would love to hear from you.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Contact Info */}
          <div className="space-y-6 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {contactInfo.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    item.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:shadow-md hover:border-brand-primary/30"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-colors duration-300 group-hover:bg-brand-primary group-hover:text-white">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Business Hours */}
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-brand-primary" />
                <h3 className="font-semibold text-foreground">
                  Business Hours
                </h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Monday — Friday</span>
                  <span className="font-medium text-foreground">
                    8:00 AM — 5:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium text-foreground">
                    8:00 AM — 1:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium text-foreground">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-border/60 bg-card p-7 sm:p-9">
              <h2 className="text-xl font-bold text-foreground">
                Send us a message
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Fill in the form and we will get back to you as soon as we can.
              </p>

              {success && (
                <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
                  Thank you! We have received your message and will get back to
                  you soon.
                </div>
              )}

              {contactMutation.error && (
                <div className="mt-6 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                  Something went wrong. Please try again.
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all duration-200"
                      placeholder="Your name"
                      disabled={contactMutation.isPending}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Email <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all duration-200"
                      placeholder="your@email.com"
                      disabled={contactMutation.isPending}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all duration-200"
                    placeholder="+263 78 ..."
                    disabled={contactMutation.isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={5}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all duration-200 resize-none"
                    placeholder="Tell us how we can help..."
                    disabled={contactMutation.isPending}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 text-base"
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {contactMutation.isPending ? "Sending..." : "Send Message"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  We will also send a WhatsApp notification with your message.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
