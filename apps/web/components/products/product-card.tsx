"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { StorefrontProduct } from "@/lib/api";
import { formatMoney, getProductImage } from "@/lib/format";
import { Phone } from "lucide-react";
import { siteConfig } from "@/lib/site";

// ── WhatsApp number (no spaces, no +) ────────────────────────────
const WA_NUMBER = "263784923973";

/**
 * Builds a wa.me deep-link with a pre-filled product-specific message.
 * wa.me is the official WhatsApp link format — wa.link short-links
 * ultimately redirect here, so we use wa.me directly for reliability.
 *
 * Message: "Hi! I saw *{productName}* on your website and I'm interested.
 *           Can you tell me the price and if it's available?"
 */
function buildProductWaLink(productName: string): string {
  const message = `Hi! I saw *${productName}* on your website and I'm interested. Can you tell me the price and if it's available?`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

const PHONE_URL = `tel:${siteConfig.phone.replace(/\s+/g, "")}`;

interface ProductCardProps {
  product: StorefrontProduct;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function fireConversion(destinationUrl: string) {
  if (typeof window.gtag === "function") {
    window.gtag("event", "conversion", {
      send_to: "AW-18040131212/oFtaCNik77gcEIydmppD",
      value: 1.0,
      currency: "USD",
      event_callback: () => { window.location.href = destinationUrl; },
    });
  } else {
    window.location.href = destinationUrl;
  }
}

function handlePhoneClick(event: React.MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  fireConversion(PHONE_URL);
}

export function ProductCard({ product }: ProductCardProps) {
  const imageSrc = getProductImage(product.images);
  const waLink = buildProductWaLink(product.name);

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square w-full border-b border-gray-100 bg-gray-50">
          <Image
            src={imageSrc}
            alt={product.images[0]?.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      </Link>

      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {product.category?.name ? (
            <Badge variant="secondary">{product.category.name}</Badge>
          ) : null}
        </div>
        <CardTitle className="line-clamp-2 text-lg leading-6">
          <Link href={`/products/${product.slug}`} className="hover:text-red-600 transition-colors">
            {product.name}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pb-4 flex-grow">
        <p className="line-clamp-3 text-sm leading-6 text-gray-600">
          {product.description ?? "High quality accessory available in store and on request."}
        </p>
        <p className="text-xl font-semibold text-black">{formatMoney(product.retailPrice)}</p>
      </CardContent>

      <CardFooter>
        <div className="flex flex-col gap-2 w-full">
          <a
            href={PHONE_URL}
            onClick={handlePhoneClick}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Phone className="h-4 w-4" />
            Call Us
          </a>
          <a
            href={waLink}
            onClick={() => fireConversion(waLink)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/whatsapp.svg" alt="WhatsApp" className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
