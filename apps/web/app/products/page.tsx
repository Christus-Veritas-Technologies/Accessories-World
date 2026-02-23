import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductsGrid } from "@/components/products/products-grid";
import Link from "next/link";

export const metadata = {
  title: "Products | Accessories World",
  description: "Browse our full selection of quality accessories for phones and gadgets.",
};

async function getCategories() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories`,
      { cache: "revalidate", next: { revalidate: 60 } }
    );
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    price?: string;
    stock?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categories = await getCategories();
  const currentPage = parseInt(params.page || "1", 10);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-red-50 to-white px-4 py-16 sm:px-6 lg:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            Our Products
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Quality accessories for your phone and gadgets at prices you can afford. Browse our full selection of chargers, cables, earphones, speakers, and more.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Filters Sidebar */}
            <div className="md:col-span-1">
              <ProductFilters
                categories={categories}
                currentCategory={params.category}
                currentPriceRange={params.price}
                currentStockFilter={params.stock}
              />
            </div>

            {/* Products Grid with Pagination */}
            <div className="md:col-span-3">
              <Suspense fallback={<ProductsGridSkeleton />}>
                <ProductsGrid
                  category={params.category}
                  priceRange={params.price}
                  stockFilter={params.stock}
                  page={currentPage}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-200 bg-gradient-to-r from-red-500 to-red-600 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-red-100 mb-8 max-w-2xl mx-auto">
            Contact us for custom orders or bulk purchases. Our team is here to help!
          </p>
          <Button
            size="lg"
            asChild
            className="bg-white hover:bg-gray-100 text-red-600 flex items-center gap-2"
          >
            <Link href="/contact">
              Contact Us <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function ProductsGridSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-80 w-full rounded-lg" />
        ))}
      </div>
      <div className="flex justify-center">
        <Skeleton className="h-10 w-48 rounded-lg" />
      </div>
    </div>
  );
}
