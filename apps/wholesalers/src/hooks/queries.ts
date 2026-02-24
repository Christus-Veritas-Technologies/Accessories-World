'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('wholesalerToken');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Queries
export function useWholesalerProducts() {
  return useQuery({
    queryKey: ['wholesaler', 'products'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/wholesalers/products`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch wholesale products');
      return res.json();
    },
  });
}

export function useWholesalerOrders() {
  return useQuery({
    queryKey: ['wholesaler', 'orders'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/wholesalers/orders`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch wholesale orders');
      return res.json();
    },
  });
}

export function useWholesalerProfile() {
  return useQuery({
    queryKey: ['wholesaler', 'profile'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/wholesalers/profile`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
  });
}

// Mutations
export function useCreateWholesaleOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_URL}/wholesalers/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create order');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesaler', 'orders'] });
    },
  });
}

export function useUpdateWholesalerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_URL}/wholesalers/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesaler', 'profile'] });
    },
  });
}
