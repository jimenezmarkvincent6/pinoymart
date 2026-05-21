"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

interface CartButtonProps {
  className?: string;
  variant?: "default" | "on-dark";
}

export function CartButton({ className, variant = "default" }: CartButtonProps) {
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const surface =
    variant === "on-dark"
      ? "border-white/30 bg-white text-[hsl(var(--brand-green))] hover:bg-white/90 shadow-sm"
      : "border-border bg-background text-foreground hover:bg-secondary shadow-sm";

  return (
    <Link
      href="/cart"
      aria-label="Open cart"
      className={cn(
        "relative inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
        surface,
        className
      )}
    >
      <ShoppingBag className="h-4 w-4" />
      <span className="hidden sm:inline">Cart</span>
      {hydrated && count > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground ring-2 ring-[hsl(var(--brand-green))]">
          {count}
        </span>
      )}
    </Link>
  );
}
