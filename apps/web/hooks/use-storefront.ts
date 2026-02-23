"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getCategories,
  getProducts,
  submitContact,
  getTestimonials,
  getTrendingProducts,
  type ContactPayload,
  type ProductFilters,
} from "@/lib/api";

export const storefrontQueryKeys = {
  categories: ["storefront", "categories"] as const,
  products: (filters: ProductFilters) =>
    ["storefront", "products", filters] as const,
  featuredProducts: (limit: number) =>
    ["storefront", "products", "featured", limit] as const,
};

export function useCategoriesQuery() {
  return useQuery({
    queryKey: storefrontQueryKeys.categories,
    queryFn: getCategories,
  });
}

export function useFeaturedProductsQuery(limit = 6) {
  return useQuery({
    queryKey: storefrontQueryKeys.featuredProducts(limit),
    queryFn: () => getProducts({ featured: true, limit }),
  });
}

export function useProductsQuery(filters: ProductFilters) {
  return useQuery({
    queryKey: storefrontQueryKeys.products(filters),
    queryFn: () => getProducts(filters),
  });
}

export function useContactMutation() {
  return useMutation({
    mutationFn: (payload: ContactPayload) => submitContact(payload),
  });
}

export function useTestimonialsQuery(limit = 10) {
  return useQuery({
    queryKey: ["testimonials", limit],
    queryFn: () => getTestimonials(limit),
  });
}

export function useTrendingProductsQuery(limit = 6) {
  return useQuery({
    queryKey: ["trending-products", limit],
    queryFn: () => getTrendingProducts(limit),
  });
}
