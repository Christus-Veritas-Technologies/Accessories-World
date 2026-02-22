"use client";

import { useEffect, useState } from "react";
import { Search, Filter, ShoppingCart } from "lucide-react";
import Link from "next/link";

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

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.search || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.category || ""
  );

  useEffect(() => {
    fetchData();
  }, [selectedCategory, search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (search) params.append("search", search);

      const [productsRes, categoriesRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}`
        ),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`),
      ]);

      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setProducts(productsData.items);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const discountedPrice = (product: Product) => {
    return (
      product.retailPrice * (1 - (product.retailDiscount || 0) / 100)
    );
  };

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-primary-dark py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white">Products</h1>
          <p className="mt-2 text-brand-secondary-light">
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
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Product name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-border pl-10 pr-3 py-2"
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
                  onClick={() => setSelectedCategory("")}
                  className={`block w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                    !selectedCategory
                      ? "bg-brand-primary text-white"
                      : "hover:bg-muted"
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`block w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                      selectedCategory === cat.slug
                        ? "bg-brand-primary text-white"
                        : "hover:bg-muted"
                    }`}
                  >
                    {cat.name}
                    <span className="text-xs opacity-75">
                      ({cat.productCount})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                No products found
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg hover:-translate-y-1"
                  >
                    {/* Image */}
                    <div className="aspect-square overflow-hidden bg-muted">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].alt}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        {product.category.name}
                      </p>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-lg font-bold text-brand-primary">
                          ${discountedPrice(product).toFixed(2)}
                        </span>
                        {product.retailDiscount > 0 && (
                          <span className="text-xs line-through text-muted-foreground">
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

                      <button className="w-full rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-primary-light disabled:opacity-50"
                        disabled={product.stock === 0}>
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
