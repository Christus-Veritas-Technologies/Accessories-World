"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ProductCard } from "@/components/products/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  retailPrice: string | number;
  stock: number;
  featured: boolean;
  images: Array<{
    id: string;
    url: string;
    alt?: string;
  }>;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ProductsGridProps {
  category?: string;
  priceRange?: string;
  stockFilter?: string;
  page?: number;
}

const PRODUCTS_PER_PAGE = 10;

export function ProductsGrid({
  category,
  priceRange = "all",
  stockFilter = "all",
  page = 1,
}: ProductsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Build query string
        const queryParams = new URLSearchParams();
        
        if (category) queryParams.append("category", category);
        if (priceRange && priceRange !== "all") queryParams.append("price", priceRange);
        if (stockFilter && stockFilter !== "all") queryParams.append("stock", stockFilter);
        
        queryParams.append("page", String(page));
        queryParams.append("limit", String(PRODUCTS_PER_PAGE));

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams.toString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.items || []);
        setTotalCount(data.total || 0);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [category, priceRange, stockFilter, page]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-gray-600 text-center max-w-md">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 text-center max-w-md">
          No products found matching your filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    router.push(`/products?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {(page - 1) * PRODUCTS_PER_PAGE + 1} to{" "}
        {Math.min(page * PRODUCTS_PER_PAGE, totalCount)} of {totalCount} products
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => hasPrevious && handlePageChange(page - 1)}
                  aria-disabled={!hasPrevious}
                  className={!hasPrevious ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === page;

                return (
                  <PaginationItem key={pageNum}>
                    <button
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-md transition-colors ${
                        isActive
                          ? "bg-red-500 text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {pageNum}
                    </button>
                  </PaginationItem>
                );
              })}

              {totalPages > 5 && page < totalPages - 2 && (
                <PaginationItem>
                  <span className="px-2 text-gray-600">...</span>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => hasNext && handlePageChange(page + 1)}
                  aria-disabled={!hasNext}
                  className={!hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
