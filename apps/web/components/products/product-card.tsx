import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { StorefrontProduct } from "@/lib/api";
import { formatMoney, getDiscountPercent, getProductImage } from "@/lib/format";

interface ProductCardProps {
  product: StorefrontProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageSrc = getProductImage(product.images);
  const discountPercent = getDiscountPercent(product.retailDiscount);

  return (
    <Card className="h-full overflow-hidden">
      <div className="relative aspect-square w-full border-b border-gray-100 bg-gray-50">
        <Image
          src={imageSrc}
          alt={product.images[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-center gap-2">
          {product.category?.name ? (
            <Badge variant="secondary">{product.category.name}</Badge>
          ) : null}
          {product.featured ? <Badge>Popular</Badge> : null}
          {discountPercent > 0 ? <Badge variant="outline">-{discountPercent}%</Badge> : null}
        </div>
        <CardTitle className="line-clamp-2 text-lg leading-6">{product.name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <p className="line-clamp-3 text-sm leading-6 text-gray-600">
          {product.description ?? "High quality accessory available in store and on request."}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold text-black">{formatMoney(product.retailPrice)}</p>
          <span className="text-xs text-gray-500">
            {product.stock > 0 ? `${product.stock} in stock` : "Order on request"}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/contact?product=${encodeURIComponent(product.name)}`}>
            Ask About This Item
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
