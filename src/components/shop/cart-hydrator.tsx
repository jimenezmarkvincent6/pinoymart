"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

/**
 * Triggers the Zustand persist rehydration on the client so cart UI
 * (badge counts, etc.) only renders once we know the real value —
 * avoiding the SSR/client mismatch flash.
 */
export function CartHydrator() {
  const setHydrated = useCart((s) => s.setHydrated);
  useEffect(() => {
    setHydrated();
  }, [setHydrated]);
  return null;
}
