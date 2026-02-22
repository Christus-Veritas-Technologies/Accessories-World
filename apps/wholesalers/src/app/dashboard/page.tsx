'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { MessageCircle, ShoppingCart, Search, Loader } from 'lucide-react';
import { useWholesalerProducts } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('wholesaler_token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/wholesalers/products`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch products');
      setProducts(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading products');
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

  const getWhatsAppMessage = () => {
    const items = Array.from(cart.entries())
      .map(([productId, qty]) => {
        const product = products.find((p) => p.id === productId);
        const price = product
          ? product.wholesalePrice *
            (1 - (product.wholesaleDiscount || 0) / 100)
          : 0;
        return `- ${product?.name} x${qty} (ZWL ${(price * qty).toLocaleString()})`;
      })
      .join('%0A');

    return `Hi! I'd like to place a wholesale order:%0A%0A${items}%0A%0ATotal: ZWL ${cartTotal.toLocaleString()}`;
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '263710000000';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${getWhatsAppMessage()}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100">
        <div className="text-center">
          <Loader className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading wholesale deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wholesale Deals</h1>
          <p className="text-muted-foreground">Premium bulk pricing for your business</p>
        </div>
        {cartCount > 0 && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="whatsapp" className="gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart ({cartCount}) - ZWL {cartTotal.toLocaleString()}
            </Button>
          </a>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-600">
          <p className="font-semibold mb-1">Error Loading Deals</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border/50 bg-background py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => {
          const discountedPrice =
            product.wholesalePrice *
            (1 - (product.wholesaleDiscount || 0) / 100);
          const savings = product.wholesalePrice - discountedPrice;
          const cartQty = cart.get(product.id) ?? 0;

          return (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                {product.images.length > 0 ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
                {savings > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{product.wholesaleDiscount}%
                  </div>
                )}
              </div>

              {/* Product Info */}
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  SKU: {product.sku} • {product.category.name}
                </p>

                {/* Pricing */}
                <div className="mb-4 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-brand-primary">
                      ZWL {discountedPrice.toLocaleString()}
                    </span>
                    {savings > 0 && (
                      <span className="text-xs text-gray-400 line-through">
                        ZWL {product.wholesalePrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {savings > 0 && (
                    <p className="text-xs text-green-600 font-semibold">
                      Save ZWL {savings.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Stock Status */}
                <p className="text-xs mb-4 font-medium">
                  {product.stock > 0 ? (
                    <span className="text-green-600">
                      {product.stock} in stock
                    </span>
                  ) : (
                    <span className="text-red-600">Out of stock</span>
                  )}
                </p>

                {/* Cart Controls */}
                <div className="flex items-center gap-2">
                  {cartQty > 0 ? (
                    <>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="h-10 w-10 rounded-lg border border-border/50 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        −
                      </button>
                      <span className="flex-1 text-center text-sm font-semibold">
                        {cartQty}
                      </span>
                      <button
                        onClick={() => addToCart(product.id)}
                        className="h-10 w-10 rounded-lg border border-border/50 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        +
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock === 0}
                      className="w-full h-10 rounded-lg bg-brand-primary text-white text-sm font-medium hover:bg-brand-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="rounded-lg border border-border/50 bg-gradient-to-br from-gray-50 to-white p-12 text-center text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-gray-600">No products found</p>
        </div>
      )}
    </div>
  );
}
