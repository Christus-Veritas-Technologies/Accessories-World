'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

// Helper to get auth token from cookie
function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find((row) => row.startsWith('adminToken='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
}

// Helper to clear auth and redirect
function handleAuthError() {
  document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

// Helper to make authenticated fetch
function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  }).then(async (res) => {
    // Handle 401/403 by clearing auth and redirecting
    if (res.status === 401 || res.status === 403) {
      handleAuthError();
      throw new Error('Session invalid or expired');
    }
    return res;
  });
}

// Queries
export function useKpis() {
  return useQuery({
    queryKey: ['kpis'],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_URL}/admin/kpis`);
      if (!res.ok) throw new Error('Failed to fetch KPIs');
      return res.json();
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['admin', 'products', id],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_URL}/admin/products/${id}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      return res.json();
    },
    enabled: !!id,
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ['admin', 'products'],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_URL}/admin/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });
}

export function useAccounts() {
  return useQuery({
    queryKey: ['admin', 'accounts'],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_URL}/admin/accounts`);
      if (!res.ok) throw new Error('Failed to fetch accounts');
      return res.json();
    },
  });
}

export function useWholesaler(id: string) {
  return useQuery({
    queryKey: ['admin', 'wholesalers', id],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_URL}/admin/wholesalers/${id}`);
      if (!res.ok) throw new Error('Failed to fetch wholesaler');
      return res.json();
    },
    enabled: !!id,
  });
}

export function useWholesalers() {
  return useQuery({
    queryKey: ['admin', 'wholesalers'],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_URL}/admin/wholesalers`);
      if (!res.ok) throw new Error('Failed to fetch wholesalers');
      return res.json();
    },
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_URL}/admin/orders`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_URL}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });
}

// Mutations
export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await authenticatedFetch(`${API_URL}/admin/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create category');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await authenticatedFetch(`${API_URL}/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create product');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await authenticatedFetch(`${API_URL}/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update product');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await authenticatedFetch(`${API_URL}/admin/products/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete product');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await authenticatedFetch(`${API_URL}/admin/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create account');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await authenticatedFetch(`${API_URL}/admin/accounts/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete account');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    },
  });
}


export function useCreateWholesaler() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await authenticatedFetch(`${API_URL}/admin/wholesalers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create wholesaler');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'wholesalers'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await authenticatedFetch(`${API_URL}/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update order status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
}
export function useSales() {
  return useQuery({
    queryKey: ['admin', 'sales'],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_URL}/admin/sales`);
      if (!res.ok) throw new Error('Failed to fetch sales');
      return res.json();
    },
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await authenticatedFetch(`${API_URL}/admin/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create sale');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sales'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await authenticatedFetch(`${API_URL}/admin/sales/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update sale');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sales'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await authenticatedFetch(`${API_URL}/admin/sales/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete sale');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sales'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await authenticatedFetch(`${API_URL}/admin/accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update account');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    },
  });
}

// Auth & Session
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await authenticatedFetch(`${API_URL}/auth/logout`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to logout');
      return res.json();
    },
    onSuccess: () => {
      // Clear all cache
      queryClient.clear();
      // Clear auth token cookie
      document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      // Redirect to login
      window.location.href = '/login';
    },
  });
}