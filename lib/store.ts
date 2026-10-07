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

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

interface StoreState {
  cart: CartItem[];
  wishlist: string[];
  cartOpen: boolean;
  hasHydrated: boolean;
  authStatus: AuthStatus;
  auth: {
    user: AuthUser | null;
    isAuthenticated: boolean;
  };
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  setCartOpen: (open: boolean) => void;
  cartTotal: () => number;
  cartCount: () => number;
  setAuthenticatedUser: (user: AuthUser) => void;
  setAuthStatus: (status: AuthStatus) => void;
  logout: () => void;
}

const unauthenticated = { user: null, isAuthenticated: false };
let storeInitialized = false;
let hydrationCompletedDuringInitialization = false;

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      cartOpen: false,
      hasHydrated: false,
      authStatus: 'loading',
      auth: unauthenticated,

      addToCart: (item) =>
        set((state) => {
          const exists = state.cart.find((cartItem) => cartItem.id === item.id);
          if (exists) {
            return {
              cart: state.cart.map((cartItem) =>
                cartItem.id === item.id
                  ? { ...cartItem, quantity: cartItem.quantity + 1 }
                  : cartItem
              ),
            };
          }
          return { cart: [...state.cart, item] };
        }),

      removeFromCart: (id) =>
        set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: quantity <= 0
            ? state.cart.filter((item) => item.id !== id)
            : state.cart.map((item) =>
                item.id === id ? { ...item, quantity } : item
              ),
        })),

      toggleWishlist: (id) =>
        set((state) => ({
          wishlist: state.wishlist.includes(id)
            ? state.wishlist.filter((itemId) => itemId !== id)
            : [...state.wishlist, id],
        })),

      isWishlisted: (id) => get().wishlist.includes(id),

      setCartOpen: (open) => set({ cartOpen: open }),

      cartTotal: () =>
        get().cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0),

      cartCount: () =>
        get().cart.reduce((sum, item) => sum + item.quantity, 0),

      setAuthenticatedUser: (user) => set({
        auth: { user, isAuthenticated: true },
        authStatus: 'authenticated',
      }),
      setAuthStatus: (authStatus) => set({ authStatus }),
      logout: () => set({
        auth: unauthenticated,
        authStatus: 'unauthenticated',
      }),
    }),
    {
      name: 'styleme-store',
      version: 4,
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
      }),
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return {
            cart: [],
            wishlist: [],
          };
        }

        const previous = persistedState as {
          cart?: CartItem[];
          wishlist?: string[];
        };
        return {
          cart: Array.isArray(previous.cart) ? previous.cart : [],
          wishlist: Array.isArray(previous.wishlist) ? previous.wishlist : [],
        };
      },
      onRehydrateStorage: () => (_state, error) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('styleme-auth-token');
        }
        if (error) {
          console.error('Unable to restore the StyleMe local session.', error);
        }
        if (storeInitialized) {
          useStore.setState({ hasHydrated: true });
        } else {
          hydrationCompletedDuringInitialization = true;
        }
      },
    }
  )
);

storeInitialized = true;
if (hydrationCompletedDuringInitialization) {
  useStore.setState({ hasHydrated: true });
}
