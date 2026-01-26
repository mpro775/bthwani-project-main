import { create } from 'zustand';
import { storage } from '../utils/storage';
import type { CartItem, Product } from '../types';

interface CartStore {
  items: CartItem[];
  initCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  // Initialize cart from storage
  initCart: () => {
    const savedCart = storage.getCart();
    set({ items: savedCart });
  },
  
  // Add item to cart
  addItem: (product: Product, quantity = 1) => {
    const { items } = get();
    const existingItem = items.find(item => item.id === product.id);
    
    let newItems: CartItem[];
    if (existingItem) {
      newItems = items.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newItems = [...items, { ...product, quantity }];
    }
    
    set({ items: newItems });
    storage.setCart(newItems);
  },
  
  // Remove item from cart
  removeItem: (productId: string) => {
    const { items } = get();
    const newItems = items.filter(item => item.id !== productId);
    set({ items: newItems });
    storage.setCart(newItems);
  },
  
  // Update item quantity
  updateQuantity: (productId: string, quantity: number) => {
    const { items } = get();
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    
    const newItems = items.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    set({ items: newItems });
    storage.setCart(newItems);
  },
  
  // Clear cart
  clearCart: () => {
    set({ items: [] });
    storage.clearCart();
  },
  
  // Get cart total
  getTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
  
  // Get cart count
  getCount: () => {
    const { items } = get();
    return items.reduce((count, item) => count + item.quantity, 0);
  }
}));

export default useCartStore;
