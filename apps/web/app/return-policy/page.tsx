"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-red-50 to-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Return Policy
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            Return Policy
          </h1>
          <p className="text-gray-600 text-lg">
            Please read our return policy carefully
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-8">
            {/* No Returns Notice */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-900 mb-2">
                    No Returns Accepted
                  </h2>
                  <p className="text-red-800 text-lg">
                    Accessories World does not accept returns on any products purchased in-store or online.
                  </p>
                </div>
              </div>
            </div>

            {/* Policy Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-black mb-3">Our Policy</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  All sales are final. Once a product has been purchased from Accessories World, it cannot be returned, exchanged, or refunded under any circumstances.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-black mb-3">What This Means</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex gap-3">
                    <span className="text-red-500 font-bold flex-shrink-0">•</span>
                    <span>No refunds on any purchases</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-500 font-bold flex-shrink-0">•</span>
                    <span>No exchanges for different products or sizes</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-500 font-bold flex-shrink-0">•</span>
                    <span>No credits toward future purchases</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-500 font-bold flex-shrink-0">•</span>
                    <span>Products purchased on sale or clearance cannot be returned</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-black mb-3">Before You Purchase</h3>
                <p className="text-gray-600 leading-relaxed">
                  We encourage you to inspect products carefully before purchasing and to ask our staff any questions about compatibility, features, or quality. Our team in-store is always happy to help you select the right product for your needs.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-black mb-3">Questions?</h3>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about our return policy or need help choosing a product, please contact us directly. We're here to help!
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 mt-12">
              <h3 className="text-xl font-semibold text-black mb-4">Need Help?</h3>
              <p className="text-gray-600 mb-6">
                Contact our team if you have questions about our products or policies.
              </p>
              <Button asChild>
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
