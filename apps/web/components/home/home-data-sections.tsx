"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategoriesQuery, useFeaturedProductsQuery } from "@/hooks/use-storefront";

function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <CardHeader>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-3 pb-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export function HomeDataSections() {
  const {
    data: featuredData,
    isLoading: isFeaturedLoading,
    isError: isFeaturedError,
  } = useFeaturedProductsQuery(6);

  const { data: categories, isLoading: isCategoriesLoading } = useCategoriesQuery();

  const featuredItems = featuredData?.items ?? [];

  return (
    <>
      <section className="border-y border-gray-200 bg-gray-50/60 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-red-500">Top picks for you</p>
              <h2 className="mt-2 text-3xl font-semibold text-black sm:text-4xl">
                Featured Products
              </h2>
              <p className="mt-3 max-w-2xl text-gray-600">
                We selected popular accessories that customers ask for every day.
              </p>
            </div>
            <Button variant="secondary" asChild>
              <Link href="/products">View full catalog</Link>
            </Button>
          </div>

          {isFeaturedLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : null}

          {isFeaturedError ? (
            <Alert variant="destructive" className="max-w-2xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Products are not loading right now</AlertTitle>
              <AlertDescription>
                Please refresh this page or check again in a few minutes.
              </AlertDescription>
            </Alert>
          ) : null}

          {!isFeaturedLoading && !isFeaturedError ? (
            featuredItems.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredItems.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            ) : (
              <Card className="max-w-2xl">
                <CardHeader>
                  <CardTitle>No featured items yet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Our team is updating products. Please check the full catalog.
                  </p>
                </CardContent>
              </Card>
            )
          ) : null}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-medium text-red-500">Easy browsing</p>
            <h2 className="mt-2 text-3xl font-semibold text-black sm:text-4xl">
              Shop by Category
            </h2>
          </div>

          {isCategoriesLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          ) : null}

          {!isCategoriesLoading ? (
            categories && categories.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categories.slice(0, 8).map((category) => (
                  <Link key={category.id} href={`/products?category=${category.slug}`}>
                    <Card className="h-full transition-colors hover:border-red-200 hover:bg-red-50/30">
                      <CardContent className="space-y-2 p-5">
                        <p className="text-base font-semibold text-black">{category.name}</p>
                        <p className="text-sm text-gray-600">
                          {category.productCount} item{category.productCount === 1 ? "" : "s"}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600">
                    Categories will appear here once products are published.
                  </p>
                </CardContent>
              </Card>
            )
          ) : null}
        </div>
      </section>
    </>
  );
}
