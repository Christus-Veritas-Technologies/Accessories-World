'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

// Queries
export function useWholesalerProducts() {
  return useQuery({
    queryKey: ['wholesaler', 'products'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/wholesalers/products`);
      if (!res.ok) throw new Error('Failed to fetch wholesale products');
      return res.json();
    },
  });
}

export function useWholesalerOrders() {
  return useQuery({
    queryKey: ['wholesaler', 'orders'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/wholesalers/orders`);
      if (!res.ok) throw new Error('Failed to fetch wholesale orders');
      return res.json();
    },
  });
}

export function useWholesalerProfile() {
  return useQuery({
    queryKey: ['wholesaler', 'profile'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/wholesalers/profile`);
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
