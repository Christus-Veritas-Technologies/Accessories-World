'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MessageCircle, ShoppingCart, Search, Loader2 } from 'lucide-react';
import { useWholesalerProducts } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WhatsAppDialog } from '@/components/WhatsAppDialog';
import { SuccessModal } from '@/components/SuccessModal';

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

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successPhoneNumber, setSuccessPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, error } = useWholesalerProducts();
  // API returns paginated shape: { items, total, page, pages }
  const products: Product[] = data?.items ?? [];

  const addToCart = (productId: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.set(productId, (next.get(productId) ?? 0) + 1);
      return next;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      const qty = next.get(productId) ?? 0;
      if (qty > 1) {
        next.set(productId, qty - 1);
      } else {
        next.delete(productId);
      }
      return next;
    });
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const effectivePrice = (p: Product) =>
    p.wholesalePrice * (1 - (p.wholesaleDiscount || 0) / 100);

  const cartTotal = Array.from(cart.entries()).reduce((sum, [productId, qty]) => {
    const product = products.find((p) => p.id === productId);
    return product ? sum + effectivePrice(product) * qty : sum;
  }, 0);

  const cartCount = Array.from(cart.values()).reduce((a, b) => a + b, 0);

  const getWhatsAppMessage = () => {
    const lines = Array.from(cart.entries())
      .map(([productId, qty]) => {
        const product = products.find((p) => p.id === productId);
        const price = product ? effectivePrice(product) : 0;
        return `- ${product?.name} x${qty} ($${(price * qty).toFixed(2)})`;
      })
      .join('%0A');
    return `Hello! I'd like to place a wholesale order:%0A%0A${lines}%0A%0ATotal: $${cartTotal.toFixed(2)}%0A%0APlease confirm.`;
  };

  const handleCompleteOrder = async (phoneNumber: string) => {
    setIsSubmitting(true);
    try {
      const message = getWhatsAppMessage();
      const response = await fetch('/api/whatsapp/send-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: `263${phoneNumber}`, message }),
      });
      if (!response.ok) throw new Error('Failed to send WhatsApp message');
      setSuccessPhoneNumber(phoneNumber);
      setShowSuccessModal(true);
      setCart(new Map());
      setShowWhatsAppDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Wholesale pricing for your business</p>
        </div>
        {cartCount > 0 && (
          <Button
            onClick={() => setShowWhatsAppDialog(true)}
            variant="whatsapp"
            className="gap-2"
            disabled={isSubmitting}
          >
            <ShoppingCart className="h-5 w-5" />
            Cart ({cartCount}) — ${cartTotal.toFixed(2)}
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-600">
          <p className="font-semibold mb-1">Error loading products</p>
          <p className="text-sm">{(error as Error).message}</p>
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
          const price = effectivePrice(product);
          const savings = product.wholesalePrice - price;
          const cartQty = cart.get(product.id) ?? 0;

          return (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                {product.images.length > 0 ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt || product.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
                    No image
                  </div>
                )}
                {savings > 0 && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    -{product.wholesaleDiscount}%
                  </div>
                )}
              </div>

              <CardContent className="pt-5 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {product.sku && `SKU: ${product.sku} · `}{product.category?.name}
                  </p>
                </div>

                {/* Pricing */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-brand-primary">
                      ${price.toFixed(2)}
                    </span>
                    {savings > 0 && (
                      <span className="text-xs text-gray-400 line-through">
                        ${product.wholesalePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {savings > 0 && (
                    <p className="text-xs text-green-600 font-medium">
                      Save ${savings.toFixed(2)} per unit
                    </p>
                  )}
                </div>

                {/* Stock */}
                <p className="text-xs font-medium">
                  {product.stock > 0 ? (
                    <span className="text-green-600">{product.stock} in stock</span>
                  ) : (
                    <span className="text-red-500">Out of stock</span>
                  )}
                </p>

                {/* Cart Controls */}
                <div className="flex items-center gap-2">
                  {cartQty > 0 ? (
                    <>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="h-9 w-9 rounded-lg border border-border/50 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg"
                      >
                        −
                      </button>
                      <span className="flex-1 text-center text-sm font-semibold">{cartQty}</span>
                      <button
                        onClick={() => addToCart(product.id)}
                        className="h-9 w-9 rounded-lg border border-border/50 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg"
                      >
                        +
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock === 0}
                      className="w-full h-9 rounded-lg bg-brand-primary text-white text-sm font-medium hover:bg-brand-primary-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

      {!isLoading && filteredProducts.length === 0 && (
        <div className="rounded-lg border border-border/50 bg-gradient-to-br from-gray-50 to-white p-12 text-center">
          <MessageCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            {search ? 'No products match your search' : 'No products available'}
          </p>
        </div>
      )}

      <WhatsAppDialog
        isOpen={showWhatsAppDialog}
        onClose={() => setShowWhatsAppDialog(false)}
        onSubmit={handleCompleteOrder}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => { setShowSuccessModal(false); setSuccessPhoneNumber(''); }}
        phoneNumber={successPhoneNumber}
      />
    </div>
  );
}
