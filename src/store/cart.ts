"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

/**
 * CartItem stores a *snapshot* of the product at add-to-cart time —
 * name, price, image, etc. — so the cart can render without doing any
 * lookups against a backing product list. This decouples the cart from
 * Firestore reads and is robust to products being edited or removed.
 */
export interface CartItem {
  productId: string;
  quantity: number;
  // Snapshot
  name: string;
  slug: string;
  price: number;
  unit: string;
  image: string;
  brand?: string;
}

interface CartState {
  items: CartItem[];
  hydrated: boolean;
  setHydrated: () => void;
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  clear: () => void;
}

function snapshot(product: Product): Omit<CartItem, "quantity"> {
  return {
    productId: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    unit: product.unit,
    image: product.image,
    brand: product.brand,
  };
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      add: (product, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            // Refresh the snapshot in case price/name changed since the last add
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, ...snapshot(product), quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...snapshot(product), quantity: qty }],
          };
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      setQty: (productId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity: qty } : i
                ),
        })),
      increment: (productId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        })),
      decrement: (productId) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? { ...i, quantity: i.quantity - 1 }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      // v2 bumps the persist key — old "pinoymart-cart" v1 used a different
      // CartItem shape (productId+quantity only) and isn't migrate-safe.
      name: "pinoymart-cart-v2",
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);

export interface ResolvedCartLine extends CartItem {
  lineTotal: number;
}

export function resolveCart(items: CartItem[]): {
  lines: ResolvedCartLine[];
  subtotal: number;
  itemCount: number;
} {
  const lines: ResolvedCartLine[] = items.map((i) => ({
    ...i,
    lineTotal: i.price * i.quantity,
  }));
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  return { lines, subtotal, itemCount };
}
