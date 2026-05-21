"use client";

import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";
import { ProductImage } from "./product-image";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const add = useCart((s) => s.add);
  const onSale = Boolean(product.oldPrice);
  const outOfStock = product.stock <= 0;
  const tag = product.tags?.[0];

  return (
    <div className="group relative flex h-full flex-col rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <Link
        href={`/products/${product.slug}`}
        className="relative block overflow-hidden rounded-lg"
      >
        <ProductImage
          emoji={product.image}
          name={product.name}
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {onSale && <Badge variant="accent">Save</Badge>}
          {tag === "bestseller" && <Badge variant="soft">★ Bestseller</Badge>}
          {tag === "new" && <Badge variant="success">New</Badge>}
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {product.brand ?? "Pinoy Mart"}
            </p>
            <Link
              href={`/products/${product.slug}`}
              className="line-clamp-2 text-sm font-medium leading-snug text-foreground hover:underline"
            >
              {product.name}
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">{product.unit}</p>
          </div>
          {product.rating && (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium">
              <Star className="h-3 w-3 fill-current text-amber-500" />
              {product.rating}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <div className="text-base font-bold leading-none text-foreground">
              {formatPrice(product.price)}
            </div>
            {onSale && (
              <div className="mt-0.5 text-xs text-muted-foreground line-through">
                {formatPrice(product.oldPrice!)}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => add(product)}
            disabled={outOfStock}
            aria-label={`Add ${product.name} to cart`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 sm:h-10 sm:w-10"
          >
            <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
          </button>
        </div>

        {outOfStock && (
          <p className="mt-2 text-xs font-medium text-destructive">Out of stock</p>
        )}
      </div>
    </div>
  );
}
