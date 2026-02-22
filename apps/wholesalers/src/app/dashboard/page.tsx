"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Search } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  wholesalePrice: number;
  wholesaleDiscount: number;
  retailPrice: number;
  stock: number;
  category: { id: string; name: string; slug: string };
  images: Array<{ url: string; alt: string }>;
}

export default function DealsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("wholesaler_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/wholesalers/products`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch products");
      setProducts(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading products");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (productId: string) => {
    const newCart = new Map(cart);
    newCart.set(productId, (newCart.get(productId) ?? 0) + 1);
    setCart(newCart);
  };

  const removeFromCart = (productId: string) => {
    const newCart = new Map(cart);
    const qty = newCart.get(productId) ?? 0;
    if (qty > 1) {
      newCart.set(productId, qty - 1);
    } else {
      newCart.delete(productId);
    }
    setCart(newCart);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const cartTotal = Array.from(cart.entries()).reduce((sum, [productId, qty]) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return sum;
    const price =
      product.wholesalePrice *
      (1 - (product.wholesaleDiscount || 0) / 100);
    return sum + price * qty;
  }, 0);

  const cartCount = Array.from(cart.values()).reduce((a, b) => a + b, 0);

  if (loading) return <div className="py-12 text-center">Loading deals...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wholesale Deals</h1>
        {cartCount > 0 && (
          <button className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-white hover:bg-brand-primary-light">
            <ShoppingCart className="h-5 w-5" />
            Cart ({cartCount}) - ${cartTotal.toFixed(2)}
          </button>
        )}
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search deals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => {
          const discountedPrice =
            product.wholesalePrice *
            (1 - (product.wholesaleDiscount || 0) / 100);
          const savings =
            product.wholesalePrice - discountedPrice;
          const cartQty = cart.get(product.id) ?? 0;

          return (
            <div
              key={product.id}
              className="overflow-hidden rounded-lg border border-border bg-card"
            >
              {/* Product Image */}
              <div className="aspect-square bg-muted overflow-hidden">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[0].url}
                    alt={product.images[0].alt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {product.category.name}
                </p>

                {/* Pricing */}
                <div className="mb-3 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-brand-primary">
                      ${discountedPrice.toFixed(2)}
                    </span>
                    {savings > 0 && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.wholesalePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {savings > 0 && (
                    <p className="text-xs text-green-600 font-semibold">
                      Save ${savings.toFixed(2)} ({product.wholesaleDiscount}%)
                    </p>
                  )}
                </div>

                {/* Stock Status */}
                <p className="text-xs mb-3">
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-semibold">
                      {product.stock} in stock
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">Out of stock</span>
                  )}
                </p>

                {/* Cart Controls */}
                <div className="flex items-center gap-2">
                  {cartQty > 0 ? (
                    <>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="rounded px-2 py-1 text-sm hover:bg-muted"
                      >
                        −
                      </button>
                      <span className="flex-1 text-center text-sm font-semibold">
                        {cartQty}
                      </span>
                      <button
                        onClick={() => addToCart(product.id)}
                        className="rounded px-2 py-1 text-sm hover:bg-muted"
                      >
                        +
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock === 0}
                      className="w-full rounded-lg bg-brand-primary px-3 py-1.5 text-sm text-white hover:bg-brand-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
          No products found
        </div>
      )}
    </div>
  );
}
