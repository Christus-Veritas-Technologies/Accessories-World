"use client";

import { TrendingUp } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrendingProductsQuery } from "@/hooks/use-storefront";

export function TrendingProductsSection() {
  const { data, isLoading, isError } = useTrendingProductsQuery(6);

  const products = data?.items ?? [];

  if (isLoading) {
    return (
      <section className="border-b border-gray-200 py-16 sm:py-24 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl">
              Most Popular Items
            </h2>
            <p className="mb-8 text-base text-gray-600 sm:text-lg max-w-2xl">
              Bestsellers and trending accessories that customers love
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-80 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError || !products || products.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-gray-200 py-16 sm:py-24 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-6 w-6 text-red-500" />
            <p className="text-sm font-semibold text-red-500 uppercase tracking-wider">
              Most Popular
            </p>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl">
            Trending Accessories
          </h2>
          <p className="text-base text-gray-600 sm:text-lg max-w-2xl">
            Bestsellers and trending accessories that customers love
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
