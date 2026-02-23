"use client";

import { useState } from "react";
import { Mail, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  method: "email" | "whatsapp";
}

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
    method: "email",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }

    const hasEmail = formData.email.trim();
    const hasPhone = formData.phone.trim();

    if (!hasEmail && !hasPhone) {
      setError("Please provide either an email or phone number");
      return false;
    }

    if (hasEmail && !hasEmail.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!formData.message.trim()) {
      setError("Message is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const endpoint =
        formData.method === "email"
          ? "/api/contact/email"
          : "/api/contact/whatsapp";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        method: "email",
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {submitted && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-medium text-green-800">
            ✓ Message sent successfully! We'll get back to you soon.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Your full name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      {/* Contact Method Selection */}
      <div className="space-y-2">
        <Label>How should we contact you? *</Label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="method"
              value="email"
              checked={formData.method === "email"}
              onChange={handleChange}
              disabled={isLoading}
              className="w-4 h-4 text-red-500"
            />
            <span className="flex items-center gap-2 text-sm text-gray-700">
              <Mail className="h-4 w-4" />
              Email
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="method"
              value="whatsapp"
              checked={formData.method === "whatsapp"}
              onChange={handleChange}
              disabled={isLoading}
              className="w-4 h-4 text-red-500"
            />
            <span className="flex items-center gap-2 text-sm text-gray-700">
              <Phone className="h-4 w-4" />
              WhatsApp
            </span>
          </label>
        </div>
      </div>

      {/* Email Field */}
      {formData.method === "email" && (
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">We'll send our reply to this email</p>
        </div>
      )}

      {/* Phone Field */}
      {formData.method === "whatsapp" && (
        <div className="space-y-2">
          <Label htmlFor="phone">WhatsApp Number *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+263 78 492 3973 or 0784923973"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">Include country code (+263) or start with 0</p>
        </div>
      )}

      {/* Email Field for Email Method */}
      {formData.method === "email" && (
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-500">
            Phone Number (Optional)
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Your phone number"
            value={formData.phone}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Phone Field for WhatsApp Method */}
      {formData.method === "whatsapp" && (
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-500">
            Email (Optional)
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Message Field */}
      <div className="space-y-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us how we can help..."
          value={formData.message}
          onChange={handleChange}
          rows={5}
          required
          disabled={isLoading}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2"
      >
        {isLoading ? "Sending..." : "Send Message"}{" "}
        {!isLoading && <ArrowRight className="h-4 w-4" />}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        * Required fields
      </p>
    </form>
  );
}
