"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Pencil,
  Plus,
  Search,
  Star,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import { deleteProduct } from "@/lib/data/products-mutations";
import type { Category, Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductsListViewProps {
  products: Product[];
  categories: Category[];
}

const sortOptions = [
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "price-asc", label: "Price low → high" },
  { value: "price-desc", label: "Price high → low" },
  { value: "stock-asc", label: "Stock low → high" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

export function ProductsListView({ products, categories }: ProductsListViewProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sort, setSort] = useState<SortValue>("name-asc");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = products.slice();
    if (categoryFilter) list = list.filter((p) => p.category === categoryFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "stock-asc":
        list.sort((a, b) => a.stock - b.stock);
        break;
    }
    return list;
  }, [products, categoryFilter, query, sort]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product. Check console for details.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const target = confirmDeleteId
    ? products.find((p) => p.id === confirmDeleteId)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} total · live on Firestore
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-[1fr_180px_180px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, brand, or slug…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 pl-10 pr-10"
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
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-11 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortValue)}
          className="h-11 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Product table — list on mobile, table on md+ */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No products match your search. Try clearing filters.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="space-y-2 md:hidden">
            {filtered.map((p) => (
              <li
                key={p.id}
                className="flex gap-3 rounded-xl border border-border bg-card p-3 shadow-sm"
              >
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-secondary text-3xl">
                  {p.image}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {p.name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {p.brand} · {p.unit} · {p.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold tabular-nums">
                        {formatPrice(p.price)}
                      </div>
                      <div
                        className={cn(
                          "text-[11px] tabular-nums",
                          p.stock <= 20
                            ? "text-destructive"
                            : "text-muted-foreground"
                        )}
                      >
                        {p.stock} units
                      </div>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {p.featured && (
                      <Badge variant="soft" className="text-[10px]">
                        <Star className="h-3 w-3" /> Featured
                      </Badge>
                    )}
                    {p.oldPrice && (
                      <Badge variant="accent" className="text-[10px]">
                        <Tag className="h-3 w-3" /> Promo
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-full"
                    >
                      <Link href={`/admin/products/${p.id}`}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                    </Button>
                    <button
                      onClick={() => setConfirmDeleteId(p.id)}
                      className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-2xl">
                          {p.image}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{p.name}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {p.brand} · {p.unit}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.category}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-semibold tabular-nums">
                        {formatPrice(p.price)}
                      </div>
                      {p.oldPrice && (
                        <div className="text-xs text-muted-foreground line-through tabular-nums">
                          {formatPrice(p.oldPrice)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          "tabular-nums",
                          p.stock <= 20
                            ? "font-semibold text-destructive"
                            : "text-foreground"
                        )}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        {p.featured && (
                          <Badge variant="soft" className="text-[10px]">
                            <Star className="h-3 w-3" /> Featured
                          </Badge>
                        )}
                        {p.oldPrice && (
                          <Badge variant="accent" className="text-[10px]">
                            <Tag className="h-3 w-3" /> Promo
                          </Badge>
                        )}
                        {p.tags?.includes("bestseller") && (
                          <Badge variant="secondary" className="text-[10px]">
                            ★ Best
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                        >
                          <Link href={`/admin/products/${p.id}`}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Link>
                        </Button>
                        <button
                          onClick={() => setConfirmDeleteId(p.id)}
                          aria-label="Delete"
                          className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Delete confirmation dialog */}
      {target && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-3 backdrop-blur-sm sm:items-center"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-destructive/15 text-destructive">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold leading-tight">
                  Delete this product?
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {target.name}
                  </span>{" "}
                  will be removed from Firestore and the customer site.
                  This can't be undone.
                </p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setConfirmDeleteId(null)}
                disabled={!!deletingId}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1 rounded-full"
                onClick={() => handleDelete(target.id)}
                disabled={!!deletingId}
              >
                {deletingId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" /> Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
