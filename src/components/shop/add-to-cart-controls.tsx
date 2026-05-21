"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";

interface AddToCartControlsProps {
  product: Product;
}

/**
 * Renders inline on desktop and a fixed sticky bar above the bottom nav on mobile.
 * One state, two presentations — keeps mobile users' "Add to cart" always reachable.
 */
export function AddToCartControls({ product }: AddToCartControlsProps) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const qtyStepper = (
    <div className="inline-flex shrink-0 items-center rounded-full border border-input bg-background p-1 shadow-sm">
      <button
        type="button"
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        disabled={qty <= 1}
        aria-label="Decrease quantity"
        className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-secondary disabled:opacity-40"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-10 text-center text-base font-semibold tabular-nums">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
        disabled={qty >= product.stock}
        aria-label="Increase quantity"
        className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-secondary disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop & tablet: inline controls below the product info */}
      <div className="hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center">
        {qtyStepper}
        <Button
          size="lg"
          onClick={handleAdd}
          disabled={outOfStock}
          className="rounded-full sm:flex-1"
        >
          {added ? (
            <>
              <Check className="h-4 w-4" /> Added to cart
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              {outOfStock ? "Out of stock" : "Add to cart"}
            </>
          )}
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <Link href="/cart">View cart</Link>
        </Button>
      </div>

      {/* Mobile: sticky bar above the bottom nav */}
      <div
        className="fixed inset-x-0 bottom-[64px] z-30 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {qtyStepper}
          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {added ? (
              <>
                <Check className="h-5 w-5" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="h-5 w-5" />
                {outOfStock ? "Out of stock" : `Add · ${formatPrice(product.price * qty)}`}
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
