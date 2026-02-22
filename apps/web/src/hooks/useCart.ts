'use client';

import { useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (isMounted) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export function useCart() {
  const [cart, setCart] = useLocalStorage<CartItem[]>('cart', []);

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id);
      if (existingItem) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prevCart, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const getWhatsAppMessage = () => {
    if (cart.length === 0) return '';
    
    const itemsList = cart
      .map((item) => `- ${item.name} x${item.quantity} (ZWL ${(item.price * item.quantity).toLocaleString()})`)
      .join('%0A');
    
    return `Hi! I'd like to complete an order:%0A%0A${itemsList}%0A%0ATotal: ZWL ${cartTotal.toLocaleString()}`;
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    itemCount,
    getWhatsAppMessage,
  };
}
