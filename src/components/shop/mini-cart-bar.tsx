"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useMemo } from "react";
import { useCart, resolveCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";

/**
 * Floating mini-cart bar — appears on mobile shop pages whenever the cart
 * has items. Sits above the bottom nav, gives one-tap access to checkout.
 * Hidden on /cart (would be redundant) and any /admin route.
 */
export function MiniCartBar() {
  const pathname = usePathname();
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);

  const { subtotal, itemCount } = useMemo(() => {
    const { subtotal, itemCount } = resolveCart(items);
    return { subtotal, itemCount };
  }, [items]);

  // Hide on cart page, admin pages, and before hydration
  if (!hydrated) return null;
  if (itemCount === 0) return null;
  if (pathname.startsWith("/cart")) return null;
  if (pathname.startsWith("/admin")) return null;

  return (
    <div
      className="fixed inset-x-3 bottom-[64px] z-30 mx-auto max-w-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Link
        href="/cart"
        className="flex items-center gap-3 rounded-2xl bg-primary px-3.5 py-3 text-primary-foreground shadow-xl shadow-primary/30 transition-transform active:scale-[0.99]"
      >
        <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-foreground/15">
          <ShoppingBag className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground ring-2 ring-primary">
            {itemCount}
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/85">
            {itemCount} item{itemCount === 1 ? "" : "s"} in cart
          </div>
          <div className="text-base font-bold leading-tight tabular-nums">
            {formatPrice(subtotal)}
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-bold">
          View cart <ArrowRight className="h-4 w-4" />
        </span>
      </Link>
    </div>
  );
}
