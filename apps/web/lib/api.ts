const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003/api";

export type ProductPrice = number | string;

export interface StorefrontCategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface StorefrontProductImage {
  url: string;
  alt: string | null;
}

export interface StorefrontProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface StorefrontProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string | null;
  retailPrice: ProductPrice;
  retailDiscount: ProductPrice;
  stock: number;
  featured: boolean;
  category: StorefrontProductCategory | null;
  images: StorefrontProductImage[];
}

export interface ProductsResponse {
  items: StorefrontProduct[];
  total: number;
  page: number;
  pages: number;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  id: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  message: string;
  rating: number;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialsResponse {
  items: Testimonial[];
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;

    try {
      const payload = (await response.json()) as
        | { error?: string; message?: string }
        | undefined;

      if (payload?.error) {
        errorMessage = payload.error;
      } else if (payload?.message) {
        errorMessage = payload.message;
      }
    } catch {
      // Use fallback message when API does not return JSON.
    }

    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

export async function getCategories(): Promise<StorefrontCategory[]> {
  return fetchJson<StorefrontCategory[]>("/categories");
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<ProductsResponse> {
  const params = new URLSearchParams();

  if (filters.category) {
    params.set("category", filters.category);
  }
  if (filters.search) {
    params.set("search", filters.search);
  }
  if (filters.featured) {
    params.set("featured", "true");
  }
  if (typeof filters.page === "number") {
    params.set("page", String(filters.page));
  }
  if (typeof filters.limit === "number") {
    params.set("limit", String(filters.limit));
  }

  const query = params.toString();
  return fetchJson<ProductsResponse>(`/products${query ? `?${query}` : ""}`);
}

export async function submitContact(
  payload: ContactPayload,
): Promise<ContactResponse> {
  return fetchJson<ContactResponse>("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getTestimonials(limit = 10): Promise<TestimonialsResponse> {
  return fetchJson<TestimonialsResponse>(`/testimonials?limit=${limit}`);
}

export async function getTrendingProducts(
  limit = 6,
): Promise<ProductsResponse> {
  return fetchJson<ProductsResponse>(`/products/trending/popular?limit=${limit}`);
}
