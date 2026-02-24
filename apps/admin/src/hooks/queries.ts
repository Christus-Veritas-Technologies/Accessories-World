'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

// Queries
export function useKpis() {
  return useQuery({
    queryKey: ['kpis'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/admin/kpis`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch KPIs');
      return res.json();
    },
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ['admin', 'products'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/admin/products`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });
}

export function useAccounts() {
  return useQuery({
    queryKey: ['admin', 'accounts'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/admin/accounts`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch accounts');
      return res.json();
    },
  });
}

export function useWholesalers() {
  return useQuery({
    queryKey: ['admin', 'wholesalers'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/admin/wholesalers`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch wholesalers');
      return res.json();
    },
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/admin/orders`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/categories`, {
        credentials: 'include',
      });
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
      const res = await fetch(`${API_URL}/admin/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
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
      const res = await fetch(`${API_URL}/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
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
      const res = await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
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
      const res = await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
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
      const res = await fetch(`${API_URL}/admin/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
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
      const res = await fetch(`${API_URL}/admin/accounts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete account');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    },
  });
}

export function useApproveWholesaler() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/admin/wholesalers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to approve wholesaler');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'wholesalers'] });
    },
  });
}

export function useRevokeWholesaler() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/admin/wholesalers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to revoke wholesaler');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'wholesalers'] });
    },
  });
}

export function useCreateWholesaler() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_URL}/admin/wholesalers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
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
      const res = await fetch(`${API_URL}/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
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
      const res = await fetch(`${API_URL}/admin/sales`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch sales');
      return res.json();
    },
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_URL}/admin/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
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
      const res = await fetch(`${API_URL}/admin/sales/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
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
      const res = await fetch(`${API_URL}/admin/sales/${id}`, {
        method: 'DELETE',
        credentials: 'include',
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