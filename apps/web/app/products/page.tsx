"use client";

import { Suspense, useState, useEffect } from "react";
import { Heart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ProductFilters } from "@/components/products/product-filters";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

const LIMIT = 10;

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

function buildUrl(current: URLSearchParams, overrides: Record<string, string | null>) {
  const next = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }
  return `/products?${next.toString()}`;
}

function PaginationControls({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: URLSearchParams;
}) {
  if (totalPages <= 1) return null;

  // Build visible page numbers with ellipsis
  const pages: (number | "ellipsis")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("ellipsis");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
  }

  return (
    <Pagination className="mt-12">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={page > 1 ? buildUrl(searchParams, { page: String(page - 1) }) : undefined}
            aria-disabled={page === 1}
            className={page === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href={buildUrl(searchParams, { page: String(p) })}
                isActive={p === page}
                className={p === page ? "border-red-500 text-red-600" : ""}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href={page < totalPages ? buildUrl(searchParams, { page: String(page + 1) }) : undefined}
            aria-disabled={page === totalPages}
            className={page === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category");
  const price = searchParams.get("price");
  const stock = searchParams.get("stock");
  const searchQuery = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [inputValue, setInputValue] = useState(searchQuery);

  // Keep input in sync if URL changes (e.g. browser back/forward)
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const { data: categories } = useCategories();
  const { data: productsData, isLoading: isLoadingProducts, error: productsError } = useProducts({
    category: category || undefined,
    priceRange: price || undefined,
    stockFilter: stock || undefined,
    search: searchQuery || undefined,
    page,
    limit: LIMIT,
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const url = buildUrl(searchParams, {
      search: inputValue.trim() || null,
      page: "1",
    });
    router.push(url);
  };

  const totalPages = productsData ? Math.ceil(productsData.total / LIMIT) : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-red-50 to-white px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Shop Our Collection
          </h1>
          <p className="text-gray-600 max-w-2xl mb-8">
            Discover quality accessories for your devices. Browse our full selection of chargers, cables, earphones, and more.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search for a product..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pl-9 bg-white border-gray-300 focus:border-red-400 focus:ring-red-400"
              />
            </div>
            <Button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white shrink-0"
            >
              Search
            </Button>
          </form>

          {searchQuery && (
            <p className="mt-3 text-sm text-gray-500">
              Results for <span className="font-medium text-gray-800">"{searchQuery}"</span>
              {" · "}
              <button
                onClick={() => router.push(buildUrl(searchParams, { search: null, page: "1" }))}
                className="text-red-500 hover:underline"
              >
                Clear
              </button>
            </p>
          )}
        </div>
      </section>

      {/* Category Tabs */}
      {categories && categories.length > 0 && (
        <section className="px-4 py-6 sm:px-6 lg:px-8 bg-gray-50 border-b border-gray-200">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Link
                href={buildUrl(searchParams, { category: null, page: "1" })}
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
                  href={buildUrl(searchParams, { category: cat.slug, page: "1" })}
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
              {Array.from({ length: LIMIT }).map((_, i) => (
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
              {/* Results count */}
              <p className="text-sm text-gray-500 mb-4">
                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, productsData.total)} of {productsData.total} products
              </p>

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

              <PaginationControls
                page={page}
                totalPages={totalPages}
                searchParams={searchParams}
              />
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
