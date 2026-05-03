import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { formatMoney, getProductImage } from "@/lib/format";

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  retailPrice: number | string;
  images: Array<{ url: string; alt: string | null }>;
  category: { id: string; name: string; slug: string } | null;
}

async function getProduct(slug: string): Promise<ProductDetail | null> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003/api";

  const response = await fetch(`${apiBase}/products/${slug}`, {
    next: { revalidate: 300 },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  return (await response.json()) as ProductDetail;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const imageSrc = getProductImage(product.images);
  const phoneUrl = `tel:${siteConfig.phone.replace(/\s+/g, "")}`;
  const whatsappUrl =
    process.env.NEXT_PUBLIC_WA_ME_LINK ??
    `https://wa.me/${siteConfig.whatsappNumber.replace(/[^0-9]/g, "")}`;

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-gray-200 bg-gradient-to-b from-red-50 to-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black">
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </Link>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <Image
              src={imageSrc}
              alt={product.images[0]?.alt ?? product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          <div className="space-y-6">
            {product.category ? <Badge variant="secondary">{product.category.name}</Badge> : null}
            <h1 className="text-3xl font-bold text-black sm:text-4xl">{product.name}</h1>
            <p className="text-2xl font-semibold text-black">{formatMoney(product.retailPrice)}</p>
            <p className="leading-7 text-gray-600">
              {product.description || "High quality accessory available in store and on request."}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-red-500 text-white hover:bg-red-600">
                <a href={phoneUrl}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call Us
                </a>
              </Button>
              <Button asChild variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
