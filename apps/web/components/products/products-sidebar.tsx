"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Package } from "lucide-react";
import { useTrendingProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductsSidebar() {
  const { data: trendingProducts, isLoading: isLoadingTrending } = useTrendingProducts(6);
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  return (
    <div className="space-y-8">
      {/* Popular Categories */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-red-500" />
          Popular Categories
        </h3>
        <div className="space-y-3">
          {isLoadingCategories ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))
          ) : !categories || categories.length === 0 ? (
            <p className="text-sm text-gray-500">No categories available</p>
          ) : (
            categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="text-sm text-gray-700 group-hover:text-red-600">
                  {category.name}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded group-hover:bg-red-50">
                  Browse
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Trending Products */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-red-500" />
          Trending Now
        </h3>
        <div className="space-y-4">
          {isLoadingTrending ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))
          ) : !trendingProducts || trendingProducts.length === 0 ? (
            <p className="text-sm text-gray-500">No trending products</p>
          ) : (
            trendingProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="flex gap-3 group"
              >
                <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  {product.images?.[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-red-600">
                    {product.name}
                  </p>
                  <p className="text-sm font-semibold text-red-600 mt-1">
                    ${typeof product.retailPrice === "string" ? product.retailPrice : product.retailPrice.toFixed(2)}
                  </p>
                  {product.stock > 0 ? (
                    <p className="text-xs text-green-600 mt-1">In Stock</p>
                  ) : (
                    <p className="text-xs text-orange-600 mt-1">Out of Stock</p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
