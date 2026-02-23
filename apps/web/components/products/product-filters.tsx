"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  currentCategory?: string;
  currentPriceRange?: string;
  currentStockFilter?: string;
}

export function ProductFilters({
  categories,
  currentCategory,
  currentPriceRange = "all",
  currentStockFilter = "all",
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const priceRanges = [
    { label: "All Prices", value: "all" },
    { label: "Under $50", value: "0-50" },
    { label: "$50 - $100", value: "50-100" },
    { label: "$100 - $500", value: "100-500" },
    { label: "Over $500", value: "500+" },
  ];

  const stockFilters = [
    { label: "All Products", value: "all" },
    { label: "In Stock Only", value: "in-stock" },
    { label: "Out of Stock", value: "out-of-stock" },
  ];

  const handleFilterChange = (filterType: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value === "all" || value === "") {
      params.delete(filterType);
    } else {
      params.set(filterType, value);
    }

    // Reset to page 1 when filter changes
    params.set("page", "1");

    router.push(`/products?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push("/products");
    setIsOpen(false);
  };

  const hasActiveFilters =
    currentCategory || currentPriceRange !== "all" || currentStockFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters {hasActiveFilters && <span className="badge badge-red">Active</span>}
        </Button>
      </div>

      {/* Filters Container */}
      <div className={`${isOpen ? "block" : "hidden"} md:block space-y-6`}>
        {/* Category Filter */}
        {categories.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-black mb-4">Categories</h3>
            <Tabs
              value={currentCategory || "all"}
              onValueChange={(value) =>
                handleFilterChange("category", value === "all" ? "" : value)
              }
              className="w-full"
            >
              <TabsList className="flex flex-col h-auto bg-gray-50 p-0 border border-gray-200 rounded-lg overflow-hidden w-full justify-start">
                <TabsTrigger
                  value="all"
                  className="w-full justify-start rounded-none border-b border-gray-200 data-[state=active]:bg-red-50 data-[state=active]:text-red-500"
                >
                  All Categories
                </TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.slug}
                    className="w-full justify-start rounded-none border-b border-gray-200 last:border-b-0 data-[state=active]:bg-red-50 data-[state=active]:text-red-500"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Price Range Filter */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-4">Price Range</h3>
          <Tabs
            value={currentPriceRange}
            onValueChange={(value) => handleFilterChange("price", value)}
            className="w-fit"
          >
            <TabsList className="flex flex-col h-auto bg-gray-50 p-0 border border-gray-200 rounded-lg overflow-hidden max-w-xs justify-start">
              {priceRanges.map((range) => (
                <TabsTrigger
                  key={range.value}
                  value={range.value}
                  className="justify-start rounded-none border-b border-gray-200 last:border-b-0 data-[state=active]:bg-red-50 data-[state=active]:text-red-500 px-4 py-2"
                >
                  {range.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Stock Filter */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-4">Availability</h3>
          <Tabs
            value={currentStockFilter}
            onValueChange={(value) => handleFilterChange("stock", value)}
            className="w-fit"
          >
            <TabsList className="flex flex-col h-auto bg-gray-50 p-0 border border-gray-200 rounded-lg overflow-hidden max-w-xs justify-start">
              {stockFilters.map((filter) => (
                <TabsTrigger
                  key={filter.value}
                  value={filter.value}
                  className="justify-start rounded-none border-b border-gray-200 last:border-b-0 data-[state=active]:bg-red-50 data-[state=active]:text-red-500 px-4 py-2"
                >
                  {filter.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="w-full flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  );
}
