'use client';

import { useQuery } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';
const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL || 'http://localhost:3005/api';

// Helper to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('wholesalerToken');
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
  });
}

// Get all products available for wholesale
export function useWholesalerProducts() {
  return useQuery({
    queryKey: ['wholesaler', 'products'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });
}

// Get authenticated user's profile
export function useWholesalerProfile() {
  return useQuery({
    queryKey: ['wholesaler', 'profile'],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_URL}/wholesalers/profile`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
    enabled: !!getAuthToken(),
  });
}

// Get authenticated user's orders
export function useWholesalerOrders() {
  return useQuery({
    queryKey: ['wholesaler', 'orders'],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_URL}/wholesalers/orders`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
    enabled: !!getAuthToken(),
  });
}
