"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  ChevronRight,
  Minus,
  Plus,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/${params.slug}`
        );
        if (!res.ok) throw new Error("Product not found");
        setProduct(await res.json());
      } catch {
        /* handled by null check */
      } finally {
        setLoading(false);
      }
    })();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="animate-pulse grid gap-12 lg:grid-cols-2">
          <div className="aspect-square rounded-2xl bg-muted" />
          <div className="space-y-6">
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="h-8 w-3/4 rounded bg-muted" />
            <div className="h-24 rounded-2xl bg-muted" />
            <div className="h-20 rounded bg-muted" />
            <div className="h-12 rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <Package className="mx-auto h-16 w-16 text-muted-foreground/40" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            Product not found
          </h1>
          <p className="mt-2 text-muted-foreground">
            The product you are looking for does not exist or has been removed.
          </p>
          <Button className="mt-6 gap-2" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const discountedPrice =
    product.retailPrice * (1 - (product.retailDiscount || 0) / 100);
  const savings = product.retailPrice - discountedPrice;

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link
              href="/products"
              className="transition-colors duration-200 hover:text-foreground"
            >
              Products
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/products?category=${product.category.slug}`}
              className="transition-colors duration-200 hover:text-foreground"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted aspect-square">
              {product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]?.url}
                  alt={product.images[selectedImage]?.alt || product.name}
                  className="h-full w-full object-cover transition-opacity duration-300"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                  <Package className="h-24 w-24" />
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                      selectedImage === idx
                        ? "border-brand-primary ring-2 ring-brand-primary/20"
                        : "border-border/60 hover:border-brand-primary/50"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt || product.name}
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
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-sm font-medium text-brand-primary transition-colors duration-200 hover:text-brand-primary-dark"
              >
                {product.category.name}
              </Link>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {product.name}
              </h1>
              {product.sku && (
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  SKU: {product.sku}
                </p>
              )}
            </div>

            {/* Pricing */}
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground sm:text-4xl">
                  ${discountedPrice.toFixed(2)}
                </span>
                {savings > 0 && (
                  <span className="text-lg line-through text-muted-foreground">
                    ${product.retailPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <p className="mt-1.5 text-sm font-semibold text-green-600">
                  You save ${savings.toFixed(2)} ({product.retailDiscount}% off)
                </p>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-destructive"}`}
              />
              <span
                className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-destructive"}`}
              >
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-2">
                  Description
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            {product.stock > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">
                    Quantity
                  </span>
                  <div className="flex items-center rounded-xl border border-border/60 bg-card">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-l-xl transition-colors duration-200 hover:bg-muted"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-semibold">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-r-xl transition-colors duration-200 hover:bg-muted"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <Button size="lg" className="w-full gap-2 text-base">
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
            )}

            {/* Contact */}
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
              <p className="text-sm text-muted-foreground">
                Have questions about this product?
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-2"
                asChild
              >
                <Link href="/contact">
                  <MessageCircle className="h-4 w-4" />
                  Get in Touch
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
