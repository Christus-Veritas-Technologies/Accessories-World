import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  retailPrice: string | number;
  featured: boolean;
  images: Array<{
    id: string;
    url: string;
    alt?: string;
  }>;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  views?: number;
}

interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

interface UseProductsOptions {
  category?: string;
  priceRange?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { category, priceRange = "all", search, page = 1, limit = 10 } = options;

  return useQuery({
    queryKey: ["products", { category, priceRange, search, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (category) params.append("category", category);
      if (priceRange && priceRange !== "all") params.append("price", priceRange);
      if (search) params.append("search", search);

      params.append("page", String(page));
      params.append("limit", String(limit));

      const response = await axios.get<ProductsResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`
      );

      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

/** Fetch trending/featured products */
export function useTrendingProducts(limit = 8) {
  return useQuery({
    queryKey: ["products", "trending", limit],
    queryFn: async () => {
      const response = await axios.get<{ items: Product[] }>(
        `${process.env.NEXT_PUBLIC_API_URL}/products/trending?limit=${limit}`
      );
      return response.data.items;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
