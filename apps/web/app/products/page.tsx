'use client';

import { useState } from 'react';
import { Search, Filter, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useProducts, useCategories } from '@/hooks/queries';

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
  const [search, setSearch] = useState(searchParams.search || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.category || ''
  );

  const { data: productsData, isLoading: productsLoading, error: productsError } = useProducts({
    category: selectedCategory,
    search: search,
  });
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const products = productsData?.items || [];

  const discountedPrice = (product: Product) => {
    return product.retailPrice * (1 - (product.retailDiscount || 0) / 100);
  };

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-red-600 to-red-700 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white">Products</h1>
          <p className="mt-2 text-red-100">
            Browse our full collection of mobile accessories
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-semibold">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Product name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Filter className="h-4 w-4" />
                Categories
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`block w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                    !selectedCategory
                      ? 'bg-red-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  All Products
                </button>
                {categoriesLoading ? (
                  <div className="text-sm text-gray-500">Loading categories...</div>
                ) : (
                  categories.map((cat: any) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`block w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                        selectedCategory === cat.slug
                          ? 'bg-red-600 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {cat.name}
                      <span className="text-xs opacity-75">
                        ({cat.productCount || 0})
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {productsLoading ? (
              <div className="flex h-64 items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-2"></div>
                  <p>Loading products...</p>
                </div>
              </div>
            ) : productsError ? (
              <div className="flex h-64 items-center justify-center text-red-600">
                Error loading products. Please try again.
              </div>
            ) : products.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-gray-500">
                No products found
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product: Product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                  >
                    {/* Image */}
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].alt}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2 text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-3">
                        {product.category.name}
                      </p>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-lg font-bold text-red-600">
                          ${discountedPrice(product).toFixed(2)}
                        </span>
                        {product.retailDiscount > 0 && (
                          <span className="text-xs line-through text-gray-400">
                            ${product.retailPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Stock */}
                      <p className="text-xs mb-3">
                        {product.stock > 0 ? (
                          <span className="text-green-600 font-semibold">
                            {product.stock} in stock
                          </span>
                        ) : (
                          <span className="text-red-600 font-semibold">
                            Out of stock
                          </span>
                        )}
                      </p>

                      <button
                        className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="mr-1 inline h-4 w-4" />
                        View Details
                      </button>
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
