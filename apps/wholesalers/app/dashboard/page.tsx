'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MessageCircle, Search, Loader2, Phone } from 'lucide-react';
import { useWholesalerProducts } from '@/hooks/queries';
import { Card, CardContent } from '@/components/ui/card';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string | null;
  retailPrice: string;
  retailDiscount: string;
  wholesalePrice: string;
  wholesaleDiscount: string;
  stock?: number | null;
  category?: { id: string; name: string; slug: string } | null;
  images: Array<{ url: string; alt: string | null }>;
}

const BUSINESS_PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '+263 78 492 3973';
const TEL_LINK = `tel:${BUSINESS_PHONE.replace(/\s+/g, '')}`;
const WA_ME_LINK =
  process.env.NEXT_PUBLIC_WA_ME_LINK ??
  `https://wa.me/${BUSINESS_PHONE.replace(/[^0-9]/g, '')}`;

export default function ProductsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useWholesalerProducts();
  // API returns paginated shape: { items, total, page, pages }
  const products: Product[] = data?.items ?? [];

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const toNumber = (value: string | number | null | undefined) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const effectivePrice = (p: Product) => {
    const wholesalePrice = toNumber(p.wholesalePrice);
    const wholesaleDiscount = toNumber(p.wholesaleDiscount);
    return wholesalePrice * (1 - wholesaleDiscount / 100);
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
          const basePrice = toNumber(product.wholesalePrice);
          const discount = toNumber(product.wholesaleDiscount);
          const savings = Math.max(0, basePrice - price);
          const hasStockInfo = typeof product.stock === 'number';

          return (
            <Card key={product.id} className="h-full overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                {product.images.length > 0 ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt || product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover h-full transition-transform duration-300"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
                    No image
                  </div>
                )}
                {discount > 0 && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    -{discount}%
                  </div>
                )}
              </div>

              <CardContent className="pt-5 space-y-3 flex-1 flex flex-col">
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {product.sku && `SKU: ${product.sku} · `}
                    {product.category?.name}
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
                        ${toNumber(product.wholesalePrice).toFixed(2)}
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
                {hasStockInfo && (
                  <p className="text-xs font-medium">
                    {product.stock! > 0 ? (
                      <span className="text-green-600">{product.stock} in stock</span>
                    ) : (
                      <span className="text-red-500">Out of stock</span>
                    )}
                  </p>
                )}

                {/* Contact Actions (matching storefront ProductCard behavior) */}
                <div className="mt-auto flex flex-col gap-2 pt-2">
                  <a
                    href={TEL_LINK}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-light transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Call Us
                  </a>
                  <a
                    href={WA_ME_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.056-1.382l-.36-.214-3.742.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
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
    </div>
  );
}
