import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { StorefrontProduct } from "@/lib/api";
import { formatMoney, getDiscountPercent, getProductImage } from "@/lib/format";
import { AlertCircle } from "lucide-react";

interface ProductCardProps {
  product: StorefrontProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageSrc = getProductImage(product.images);
  const discountPercent = getDiscountPercent(product.retailDiscount);
  const isOutOfStock = product.stock === 0;

  return (
    <Card className={`h-full overflow-hidden flex flex-col ${isOutOfStock ? "opacity-75" : ""}`}>
      <div className="relative aspect-square w-full border-b border-gray-100 bg-gray-50">
        <Image
          src={imageSrc}
          alt={product.images[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        
        {/* Stock Status Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white rounded-lg px-4 py-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span className="font-semibold text-orange-600">Out of Stock</span>
            </div>
          </div>
        )}
      </div>

      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {product.category?.name ? (
            <Badge variant="secondary">{product.category.name}</Badge>
          ) : null}
          {product.featured ? <Badge>Popular</Badge> : null}
          {discountPercent > 0 ? <Badge variant="outline">-{discountPercent}%</Badge> : null}
          {isOutOfStock ? (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Out of Stock
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              In Stock
            </Badge>
          )}
        </div>
        <CardTitle className="line-clamp-2 text-lg leading-6">{product.name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pb-4 flex-grow">
        <p className="line-clamp-3 text-sm leading-6 text-gray-600">
          {product.description ?? "High quality accessory available in store and on request."}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold text-black">{formatMoney(product.retailPrice)}</p>
          <span className={`text-xs font-medium ${isOutOfStock ? "text-orange-600" : "text-green-600"}`}>
            {isOutOfStock ? "Order on request" : `${product.stock} in stock`}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          asChild 
          className="w-full"
          variant={isOutOfStock ? "outline" : "default"}
        >
          <Link href={`/contact?product=${encodeURIComponent(product.name)}`}>
            {isOutOfStock ? "Notify Me" : "Ask About This Item"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
