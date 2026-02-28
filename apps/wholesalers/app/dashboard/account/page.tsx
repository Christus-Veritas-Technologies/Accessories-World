"use client";

import { User, Phone, Loader2 } from "lucide-react";
import { useWholesalerProfile } from "@/hooks/queries";

export default function AccountPage() {
  const { data: profile, isLoading, error } = useWholesalerProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-600">
        {(error as Error).message}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-12 text-center text-muted-foreground">Profile not found</div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">My Account</h1>

      <div className="rounded-lg bg-green-50 border border-green-200 p-6">
        <p className="font-semibold text-green-900">✓ Account Active</p>
      </div>

      {/* Account Information */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-6">
        <h2 className="text-xl font-semibold">Account Information</h2>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <User className="h-4 w-4" />
              Name
            </label>
            <p className="text-lg font-semibold">{profile.name}</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Phone className="h-4 w-4" />
              Phone
            </label>
            <a
              href={`tel:${profile.phone}`}
              className="text-lg font-semibold text-brand-primary hover:underline"
            >
              {profile.phone}
            </a>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
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

      {/* Help */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
        <p className="text-muted-foreground mb-4">
          If you need to update your account information or have any questions, please
          reach out to us.
        </p>
        <a
          href="mailto:support@accessoriesworld.co.zw"
          className="inline-block rounded-lg bg-brand-primary px-4 py-2 text-white hover:bg-brand-primary-light transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
