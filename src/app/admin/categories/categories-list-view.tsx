"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteCategory } from "@/lib/data/categories-mutations";
import type { Category } from "@/types";

interface CategoriesListViewProps {
  categories: Category[];
  productCounts: Record<string, number>;
}

export function CategoriesListView({
  categories,
  productCounts,
}: CategoriesListViewProps) {
  const router = useRouter();
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const target = confirmDeleteSlug
    ? categories.find((c) => c.slug === confirmDeleteSlug)
    : null;
  const targetCount = target ? productCounts[target.slug] ?? 0 : 0;

  const handleDelete = async (slug: string) => {
    setDeletingSlug(slug);
    try {
      await deleteCategory(slug);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Couldn't delete category.");
    } finally {
      setDeletingSlug(null);
      setConfirmDeleteSlug(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            {categories.length} {categories.length === 1 ? "category" : "categories"}
            {" "}· customers use these to browse the catalog.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/admin/categories/new">
            <Plus className="h-4 w-4" />
            Add category
          </Link>
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No categories yet. Add your first one to start organizing products.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const count = productCounts[c.slug] ?? 0;
            return (
              <li
                key={c.slug}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-2xl">
                    {c.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold">
                      {c.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] font-mono text-muted-foreground">
                      {c.slug}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {count} {count === 1 ? "product" : "products"}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground">
                  {c.description}
                </p>

                <div className="mt-auto flex gap-2 pt-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-full"
                  >
                    <Link href={`/admin/categories/${c.slug}`}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                  </Button>
                  <button
                    onClick={() => setConfirmDeleteSlug(c.slug)}
                    aria-label="Delete category"
                    className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {target && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-3 backdrop-blur-sm sm:items-center"
          onClick={() => setConfirmDeleteSlug(null)}
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
                  Delete this category?
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {target.name}
                  </span>{" "}
                  will be removed.
                </p>
              </div>
            </div>

            {targetCount > 0 && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-[hsl(var(--yellow))]/40 bg-[hsl(var(--yellow))]/10 p-3 text-xs text-[hsl(var(--yellow))]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">
                    {targetCount} product{targetCount === 1 ? "" : "s"} use{" "}
                    {targetCount === 1 ? "this" : "these"} category.
                  </p>
                  <p className="mt-0.5 text-muted-foreground">
                    They won't be deleted but they'll lose their category — you
                    should reassign them first via /admin/products.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setConfirmDeleteSlug(null)}
                disabled={!!deletingSlug}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 rounded-full"
                onClick={() => handleDelete(target.slug)}
                disabled={!!deletingSlug}
              >
                {deletingSlug ? (
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
