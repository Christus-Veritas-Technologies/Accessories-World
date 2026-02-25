"use client";

import { Suspense, useState, useEffect } from "react";
import { ArrowRight, Heart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ProductFilters } from "@/components/products/product-filters";
import { useProducts, useTrendingProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

interface ProductCardProps {
  product: any;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

function ProductCard({ product, onFavorite, isFavorite }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-red-200 transition-all hover:shadow-lg">
      {/* Image Container */}
      <div className="relative bg-gray-100 aspect-square overflow-hidden">
        {product.images?.[0]?.url ? (
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            className="object-cover hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={onFavorite}
          className="absolute top-3 right-3 bg-white rounded-full p-2 hover:bg-red-50 transition-colors shadow-sm"
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
            }`}
          />
        </button>

        {/* Stock Badge */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-1 mb-2">
            {product.description}
          </p>
        )}

        {/* Rating and Reviews */}
        {product.views && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-yellow-400 text-xs">★</span>
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.views})</span>
          </div>
        )}

        {/* Price */}
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-red-600">
            ${typeof product.retailPrice === "string" ? product.retailPrice : product.retailPrice.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock > 0 ? (
          <p className="text-xs text-green-600 font-medium mb-3">In Stock</p>
        ) : (
          <p className="text-xs text-orange-600 font-medium mb-3">Out of Stock</p>
        )}

        {/* Add to Cart Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={product.stock === 0}
          className="w-full border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const price = searchParams.get("price");
  const stock = searchParams.get("stock");
  const page = parseInt(searchParams.get("page") || "1", 10);

  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: productsData, isLoading: isLoadingProducts, error: productsError } = useProducts({
    category: category || undefined,
    priceRange: price,
    stockFilter: stock,
    page,
    limit: 12,
  });

  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const handleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const newFavs = new Set(prev);
      if (newFavs.has(productId)) {
        newFavs.delete(productId);
      } else {
        newFavs.add(productId);
      }
      return newFavs;
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-red-50 to-white px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Shop Our Collection
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Discover quality accessories for your devices. Browse our full selection of chargers, cables, earphones, and more.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      {categories && categories.length > 0 && (
        <section className="px-4 py-6 sm:px-6 lg:px-8 bg-gray-50 border-b border-gray-200">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Link
                href="/products"
                className={`px-4 py-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors ${
                  !category
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-red-300 hover:text-red-600"
                }`}
              >
                All Categories
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className={`px-4 py-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors ${
                    category === cat.slug
                      ? "bg-red-500 text-white"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-red-300 hover:text-red-600"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters and Products Section */}
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Filters */}
          <div className="mb-8">
            <ProductFilters
              categories={categories || []}
              currentCategory={category}
              currentPriceRange={price}
              currentStockFilter={stock}
            />
          </div>

          {/* Products Grid */}
          {isLoadingProducts ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-lg" />
              ))}
            </div>
          ) : productsError ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-medium">Failed to load products. Please try again.</p>
            </div>
          ) : !productsData?.items || productsData.items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 font-medium">No products found matching your filters.</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {productsData.items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={favorites.has(product.id)}
                    onFavorite={() => handleFavorite(product.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {productsData.total > 12 && (
                <div className="flex justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    asChild={page > 1}
                  >
                    {page > 1 ? (
                      <Link href={`/products?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) }).toString()}`}>
                        Previous
                      </Link>
                    ) : (
                      "Previous"
                    )}
                  </Button>

                  {Array.from({ length: Math.min(5, Math.ceil(productsData.total / 12)) }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "default" : "outline"}
                        asChild
                      >
                        <Link href={`/products?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(pageNum) }).toString()}`}>
                          {pageNum}
                        </Link>
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    disabled={page >= Math.ceil(productsData.total / 12)}
                    asChild={page < Math.ceil(productsData.total / 12)}
                  >
                    {page < Math.ceil(productsData.total / 12) ? (
                      <Link href={`/products?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) }).toString()}`}>
                        Next
                      </Link>
                    ) : (
                      "Next"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
