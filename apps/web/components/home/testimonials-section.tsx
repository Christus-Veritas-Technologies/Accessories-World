"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useTestimonialsQuery } from "@/hooks/use-storefront";

export function TestimonialsSection() {
  const { data, isLoading } = useTestimonialsQuery(6);

  const testimonials = data?.items ?? [];
  const isEmpty = !isLoading && testimonials.length === 0;

  return (
    <section className="border-b border-gray-200 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mb-8 text-base text-gray-600 sm:text-lg max-w-2xl">
            Real feedback from people who trust us
          </p>
          <Button variant="secondary" asChild>
            <Link href="/contact">Share Your Feedback</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="py-12 text-center text-gray-600">
            No testimonials yet. We'd love to hear from you!
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="flex flex-col">
                <CardContent className="flex-1 p-6">
                  {/* Rating */}
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`h-4 w-4 ${
                          idx < testimonial.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Message */}
                  <p className="mb-4 text-sm leading-relaxed text-gray-700">
                    "{testimonial.message}"
                  </p>

                  {/* Author */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    {testimonial.location && (
                      <p className="text-xs text-gray-500">{testimonial.location}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
