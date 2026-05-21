"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CategoryPill } from "@/components/shop/category-pill";
import { ProductGrid } from "@/components/shop/product-grid";
import type { Category, Product } from "@/types";

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
}

const sortOptions = [
  { value: "popular", label: "Most popular" },
  { value: "price-asc", label: "Price: low → high" },
  { value: "price-desc", label: "Price: high → low" },
  { value: "name", label: "Name (A–Z)" },
] as const;

export function ProductsView({ products, categories }: ProductsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const activeCat = params.get("cat");
  const onlyPromos = params.get("promo") === "1";

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<(typeof sortOptions)[number]["value"]>(
    "popular"
  );

  const filtered = useMemo(() => {
    let list = products.slice();
    if (activeCat) list = list.filter((p) => p.category === activeCat);
    if (onlyPromos)
      list = list.filter((p) => Boolean(p.oldPrice) || p.tags?.includes("promo"));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort(
          (a, b) =>
            (b.featured ? 1 : 0) - (a.featured ? 1 : 0) ||
            (b.rating ?? 0) - (a.rating ?? 0)
        );
    }
    return list;
  }, [activeCat, onlyPromos, query, sort]);

  const setCategoryParam = (slug: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (slug) next.set("cat", slug);
    else next.delete("cat");
    router.replace(`${pathname}?${next.toString()}`);
  };

  const togglePromo = () => {
    const next = new URLSearchParams(params.toString());
    if (onlyPromos) next.delete("promo");
    else next.set("promo", "1");
    router.replace(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {onlyPromos
            ? "Promos"
            : activeCat
            ? categories.find((c) => c.slug === activeCat)?.name ?? "Shop"
            : "All products"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length} item{filtered.length === 1 ? "" : "s"} · Tap{" "}
          <span className="font-medium text-foreground">+</span> on any product
          to add it to your cart.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search Lucky Me, tuna, rice…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 rounded-full pl-10 pr-10 text-base"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as (typeof sortOptions)[number]["value"])
          }
          className="h-12 rounded-full border border-input bg-background px-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          onClick={() => setCategoryParam(null)}
          className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            !activeCat
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-background hover:bg-secondary"
          }`}
        >
          All
        </button>
        <button
          onClick={togglePromo}
          className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            onlyPromos
              ? "border-accent bg-accent text-accent-foreground shadow-sm"
              : "border-border bg-background hover:bg-secondary"
          }`}
        >
          🔥 Promos
        </button>
        {categories.map((c) => (
          <CategoryPill key={c.slug} category={c} active={activeCat === c.slug} />
        ))}
      </div>

      <ProductGrid products={filtered} />
    </div>
  );
}
