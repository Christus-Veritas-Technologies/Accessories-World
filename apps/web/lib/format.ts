import type { ProductPrice, StorefrontProductImage } from "@/lib/api";

export function formatMoney(value: ProductPrice): string {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "US$0";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getProductImage(
  images: StorefrontProductImage[] | undefined,
): string {
  const firstImage = images?.[0]?.url;
  if (!firstImage) {
    return "/logo.jpg";
  }

  return firstImage;
}

export function getDiscountPercent(value: ProductPrice): number {
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return 0;
  }

  return Math.max(0, Math.round(amount));
}
