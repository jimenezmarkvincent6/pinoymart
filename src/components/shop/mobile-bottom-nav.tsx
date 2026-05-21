"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Flame, Home, Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  /** Whether this tab is active given the current pathname + search params. */
  isActive: (pathname: string, searchParams: URLSearchParams) => boolean;
}

const items: readonly NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: Home,
    isActive: (p) => p === "/",
  },
  {
    href: "/products",
    label: "Shop",
    icon: Search,
    isActive: (p, q) => p.startsWith("/products") && q.get("promo") !== "1",
  },
  {
    href: "/products?promo=1",
    label: "Promos",
    icon: Flame,
    isActive: (p, q) => p.startsWith("/products") && q.get("promo") === "1",
  },
  {
    href: "/cart",
    label: "Cart",
    icon: ShoppingBag,
    isActive: (p) => p.startsWith("/cart"),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const hydrated = useCart((s) => s.hydrated);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {items.map((item) => {
          const active = item.isActive(pathname, searchParams);
          const Icon = item.icon;
          const showBadge = item.href === "/cart" && hydrated && count > 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "relative flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "fill-primary/15")} />
                {item.label}
                {showBadge && (
                  <span className="absolute right-[28%] top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
