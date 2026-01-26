// Local Storage utilities

import type { CartItem, User } from "../types";

const STORAGE_KEYS = {
  ID_TOKEN: 'firebase-idToken',
  REFRESH_TOKEN: 'firebase-refreshToken',
  EXPIRY_TIME: 'firebase-expiryTime',
  USER_DATA: 'user-data',
  CART: 'cart-data',
  LANGUAGE: 'app-language'
};

export const storage = {
  // Token management
  getIdToken: (): string | null => localStorage.getItem(STORAGE_KEYS.ID_TOKEN),
  setIdToken: (token: string): void => localStorage.setItem(STORAGE_KEYS.ID_TOKEN, token),
  
  getRefreshToken: (): string | null => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  setRefreshToken: (token: string): void => localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token),
  
  getExpiryTime: (): string | null => localStorage.getItem(STORAGE_KEYS.EXPIRY_TIME),
  setExpiryTime: (time: string): void => localStorage.setItem(STORAGE_KEYS.EXPIRY_TIME, time),
  
  clearTokens: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ID_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.EXPIRY_TIME);
  },
  
  // User data
  getUserData: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },
  setUserData: (data: User): void => localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data)),
  clearUserData: (): void => localStorage.removeItem(STORAGE_KEYS.USER_DATA),
  
  // Cart data
  getCart: (): CartItem[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CART);
    return data ? JSON.parse(data) : [];
  },
  setCart: (cart: CartItem[]): void => localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart)),
  clearCart: (): void => localStorage.removeItem(STORAGE_KEYS.CART),
  
  // Language
  getLanguage: (): string => localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'ar',
  setLanguage: (lang: string): void => localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang),
  
  // Selected locations
  getSelectedLocation: (key: string): { lat: number; lng: number; address: string } | null => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  setSelectedLocation: (key: string, location: { lat: number; lng: number; address: string }): void => {
    localStorage.setItem(key, JSON.stringify(location));
  },

  clearSelectedLocation: (key: string): void => {
    localStorage.removeItem(key);
  },

  // Clear all
  clearAll: (): void => {
    localStorage.clear();
  }
};

export default storage;
