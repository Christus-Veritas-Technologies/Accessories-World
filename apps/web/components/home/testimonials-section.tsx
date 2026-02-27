import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TESTIMONIALS = [
  {
    id: "1",
    name: "Tatenda Moyo",
    location: "Mutare",
    message:
      "Amazing quality products! I bought a phone case and a charger, both have lasted over a year. Highly recommend Accessories World!",
    rating: 5,
  },
  {
    id: "2",
    name: "Chiedza Nhamo",
    location: "Mutare CBD",
    message:
      "Best accessory shop in Mutare. The staff are friendly and the prices are very fair. My whole family now shops here.",
    rating: 5,
  },
  {
    id: "3",
    name: "Blessing Mutasa",
    location: "Sakubva",
    message:
      "I was worried about quality but these are genuine products. My earphones are still going strong after 8 months!",
    rating: 5,
  },
  {
    id: "4",
    name: "Farai Chikwanda",
    location: "Dangamvura",
    message:
      "Great service and fast delivery. I ordered a car charger and it arrived the same day. Will definitely be back!",
    rating: 5,
  },
  {
    id: "5",
    name: "Rudo Banda",
    location: "Mutare",
    message:
      "Accessories World is my go-to shop for all phone accessories. Competitive prices and genuine products every time.",
    rating: 5,
  },
  {
    id: "6",
    name: "Tinashe Chirisa",
    location: "Mutare",
    message:
      "Bought a screen protector and the staff installed it for free! That kind of service keeps me coming back.",
    rating: 5,
  },
];

export function TestimonialsSection() {
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.id} className="flex flex-col">
              <CardContent className="flex-1 p-6">
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

                <p className="mb-4 text-sm leading-relaxed text-gray-700">
                  "{testimonial.message}"
                </p>

                <div className="border-t border-gray-100 pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  {testimonial.location && (
                    <p className="text-xs text-gray-500">{testimonial.location}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
