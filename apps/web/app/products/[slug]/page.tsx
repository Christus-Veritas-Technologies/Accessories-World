"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Heart } from "lucide-react";

interface ProductDetail {
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
  images: Array<{ url: string; alt: string; order: number }>;
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [params.slug]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${params.slug}`
      );
      if (!res.ok) throw new Error("Product not found");
      setProduct(await res.json());
    } catch (err) {
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link href="/products" className="mt-4 inline-block text-brand-primary hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  const discountedPrice =
    product.retailPrice * (1 - (product.retailDiscount || 0) / 100);
  const savings = product.retailPrice - discountedPrice;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/products" className="text-brand-primary hover:underline">
              Products
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-brand-primary hover:underline"
            >
              {product.category.name}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="mb-6 inline-flex items-center gap-2 text-brand-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-border bg-muted aspect-square">
              {product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]?.url}
                  alt={product.images[selectedImage]?.alt}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-20 w-20 overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedImage === idx
                        ? "border-brand-primary"
                        : "border-border hover:border-brand-primary/50"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {product.category.name}
              </p>
              <h1 className="text-4xl font-bold">{product.name}</h1>
              {product.sku && (
                <p className="mt-2 font-mono text-sm text-muted-foreground">
                  SKU: {product.sku}
                </p>
              )}
            </div>

            {/* Pricing */}
            <div className="rounded-lg border border-border bg-muted/50 p-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-brand-primary">
                  ${discountedPrice.toFixed(2)}
                </span>
                {savings > 0 && (
                  <span className="text-xl line-through text-muted-foreground">
                    ${product.retailPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <p className="text-sm text-green-600 font-semibold">
                  Save ${savings.toFixed(2)} ({product.retailDiscount}% off)
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            {/* Stock Status */}
            <div className="rounded-lg border border-border p-4">
              {product.stock > 0 ? (
                <p className="text-sm font-semibold text-green-600">
                  ✓ {product.stock} in stock
                </p>
              ) : (
                <p className="text-sm font-semibold text-red-600">
                  Out of stock
                </p>
              )}
            </div>

            {/* Add to Cart */}
            {product.stock > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Quantity</label>
                  <div className="flex items-center gap-2 border border-border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-10 w-10 hover:bg-muted"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-semibold">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      className="h-10 w-10 hover:bg-muted"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button className="w-full rounded-lg bg-brand-primary px-6 py-3 text-lg font-semibold text-white hover:bg-brand-primary-light flex items-center justify-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </button>
                <button className="w-full rounded-lg border border-border px-6 py-3 font-semibold hover:bg-muted flex items-center justify-center gap-2">
                  <Heart className="h-5 w-5" />
                  Add to Wishlist
                </button>
              </div>
            )}

            {/* Contact */}
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground mb-2">
                Have questions? Contact us
              </p>
              <Link
                href="/contact"
                className="inline-block text-brand-primary hover:underline font-semibold"
              >
                Get in touch →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
