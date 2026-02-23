"use client";

import { useState, useEffect } from "react";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTestimonialDialog } from "./create-dialog";

interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  message: string;
  rating: number;
  featured: boolean;
  published: boolean;
  createdAt: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003/api"}/testimonials?limit=100`
      );
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleCreateTestimonial = async (data: {
    name: string;
    location: string;
    message: string;
    rating: number;
  }) => {
    try {
      setIsCreating(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003/api"}/testimonials`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        await fetchTestimonials();
      }
    } catch (error) {
      console.error("Failed to create testimonial:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003/api"}/testimonials/${id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setTestimonials(testimonials.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete testimonial:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
        <CreateTestimonialDialog
          onSubmit={handleCreateTestimonial}
          isLoading={isCreating}
        />
      </div>

      {isLoading ? (
        <p className="text-gray-600">Loading testimonials...</p>
      ) : testimonials.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-600">
            No testimonials yet. Create your first one!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                    {testimonial.location && (
                      <p className="mt-1 text-sm text-gray-600">
                        {testimonial.location}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(testimonial.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Rating */}
                <div className="flex gap-1">
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
                <p className="text-sm text-gray-700">"{testimonial.message}"</p>

                {/* Meta */}
                <div className="flex gap-2 text-xs text-gray-600">
                  {testimonial.featured && (
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-yellow-800">
                      Featured
                    </span>
                  )}
                  <span className="rounded-full bg-gray-100 px-2 py-1">
                    {new Date(testimonial.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
