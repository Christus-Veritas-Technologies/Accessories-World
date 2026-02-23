"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useProducts, useCategories } from "@/hooks/queries";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  retailPrice: number;
  retailDiscount: number;
  stock: number;
  featured: boolean;
  category: { id: string; name: string; slug: string };
  images: Array<{ url: string; alt: string }>;
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const [search, setSearch] = useState(searchParams.search || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.category || ""
  );
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts({ category: selectedCategory, search });
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const products: Product[] = productsData?.items || [];

  const discountedPrice = (product: Product) =>
    product.retailPrice * (1 - (product.retailDiscount || 0) / 100);

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-muted/60 to-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our Products
          </h1>
          <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto">
            Browse our full collection of mobile accessories. Use the search and
            filters to find exactly what you need.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Search & Filter Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all duration-200"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 sm:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Category Sidebar */}
          <aside
            className={`${showFilters ? "block" : "hidden"} sm:block lg:w-56 shrink-0`}
          >
            <div className="sticky top-20 space-y-1.5">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Categories
              </p>

              <button
                onClick={() => setSelectedCategory("")}
                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  !selectedCategory
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                All Products
              </button>

              {categoriesLoading ? (
                <div className="space-y-2 px-3 py-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-5 rounded bg-muted animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                categories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      selectedCategory === cat.slug
                        ? "bg-brand-primary text-white shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat.productCount != null && (
                      <span
                        className={`text-xs ${
                          selectedCategory === cat.slug
                            ? "text-white/70"
                            : "text-muted-foreground/60"
                        }`}
                      >
                        {cat.productCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {productsLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-border/60 bg-card"
                  >
                    <div className="aspect-square bg-muted rounded-t-2xl" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 rounded bg-muted w-3/4" />
                      <div className="h-3 rounded bg-muted w-1/2" />
                      <div className="h-5 rounded bg-muted w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : productsError ? (
              <div className="flex h-64 items-center justify-center text-center">
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    Something went wrong
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We could not load the products. Please try again later.
                  </p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-center">
                <div>
                  <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-4 text-lg font-semibold text-foreground">
                    No products found
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try changing your search or filter.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="aspect-square overflow-hidden bg-muted">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].alt || product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                          <Package className="h-16 w-16" />
                        </div>
                      )}

                      {product.retailDiscount > 0 && (
                        <div className="absolute top-3 left-3">
                          <span className="rounded-full bg-brand-primary px-2.5 py-1 text-xs font-semibold text-white shadow">
                            -{product.retailDiscount}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      {product.category && (
                        <p className="mb-1 text-xs font-medium text-brand-primary">
                          {product.category.name}
                        </p>
                      )}
                      <h3 className="font-semibold text-foreground line-clamp-2 leading-snug">
                        {product.name}
                      </h3>

                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-lg font-bold text-foreground">
                          ${discountedPrice(product).toFixed(2)}
                        </span>
                        {product.retailDiscount > 0 && (
                          <span className="text-sm line-through text-muted-foreground">
                            ${product.retailPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-xs font-medium">
                        {product.stock > 0 ? (
                          <span className="text-green-600">In Stock</span>
                        ) : (
                          <span className="text-destructive">Out of Stock</span>
                        )}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
