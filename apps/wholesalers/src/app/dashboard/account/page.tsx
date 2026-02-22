"use client";

import { useEffect, useState } from "react";
import { Mail, User, Building, Phone, MapPin, Loader } from "lucide-react";

interface WholesalerProfile {
  id: string;
  email: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  address: string;
  approved: boolean;
  createdAt: string;
}

export default function AccountPage() {
  const [profile, setProfile] = useState<WholesalerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("wholesaler_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/wholesalers/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch profile");
      setProfile(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-6 w-6 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>;
  }

  if (!profile) {
    return <div className="py-12 text-center text-muted-foreground">Profile not found</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">My Account</h1>

      {/* Account Status */}
      <div
        className={`rounded-lg p-6 ${
          profile.approved
            ? "bg-green-50 border border-green-200"
            : "bg-yellow-50 border border-yellow-200"
        }`}
      >
        <p
          className={`font-semibold ${
            profile.approved ? "text-green-900" : "text-yellow-900"
          }`}
        >
          {profile.approved
            ? "✓ Account Approved"
            : "⏳ Account Pending Approval"}
        </p>
        {!profile.approved && (
          <p className="text-sm text-yellow-800 mt-2">
            Your wholesaler account is pending admin approval. You will receive an
            email once approved.
          </p>
        )}
      </div>

      {/* Account Information */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-6">
        <h2 className="text-xl font-semibold">Account Information</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Business Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Building className="h-4 w-4" />
              Business Name
            </label>
            <p className="text-lg font-semibold">{profile.businessName}</p>
          </div>

          {/* Contact Person */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <User className="h-4 w-4" />
              Contact Person
            </label>
            <p className="text-lg font-semibold">{profile.contactPerson}</p>
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <p className="text-lg font-semibold">{profile.email}</p>
          </div>

          {/* Phone */}
          {profile.phone && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Phone className="h-4 w-4" />
                Phone
              </label>
              <a href={`tel:${profile.phone}`} className="text-lg font-semibold text-brand-primary hover:underline">
                {profile.phone}
              </a>
            </div>
          )}

          {/* Address */}
          {profile.address && (
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                Address
              </label>
              <p className="text-lg font-semibold">{profile.address}</p>
            </div>
          )}

          {/* Member Since */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2">
              Member Since
            </label>
            <p className="text-lg font-semibold">
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
        <p className="text-muted-foreground mb-4">
          If you need to update your account information or have questions, please contact us.
        </p>
        <a
          href="/contact"
          className="inline-block rounded-lg bg-brand-primary px-4 py-2 text-white hover:bg-brand-primary-light"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
