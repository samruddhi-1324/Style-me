'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  color: string;
  size: string;
  image: string;
  framePrice: number;
  lensType: string;
  lensTypePrice: number;
  lensIndex: string;
  lensIndexPrice: number;
  coatings: string[];
  coatingsPrice: number;
  prescription: string | null;
  quantity: number;
  totalPrice: number;
}

interface StoreState {
  cart: CartItem[];
  wishlist: string[];
  cartOpen: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  setCartOpen: (open: boolean) => void;
  cartTotal: () => number;
  cartCount: () => number;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      cartOpen: false,

      addToCart: (item) =>
        set((s) => {
          const exists = s.cart.find((c) => c.id === item.id);
          if (exists) return { cart: s.cart.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c) };
          return { cart: [...s.cart, item] };
        }),

      removeFromCart: (id) =>
        set((s) => ({ cart: s.cart.filter((c) => c.id !== id) })),

      updateQuantity: (id, qty) =>
        set((s) => ({
          cart: qty <= 0
            ? s.cart.filter((c) => c.id !== id)
            : s.cart.map((c) => c.id === id ? { ...c, quantity: qty } : c),
        })),

      toggleWishlist: (id) =>
        set((s) => ({
          wishlist: s.wishlist.includes(id)
            ? s.wishlist.filter((w) => w !== id)
            : [...s.wishlist, id],
        })),

      isWishlisted: (id) => get().wishlist.includes(id),

      setCartOpen: (open) => set({ cartOpen: open }),

      cartTotal: () =>
        get().cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0),

      cartCount: () =>
        get().cart.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: 'styleme-store' }
  )
);
