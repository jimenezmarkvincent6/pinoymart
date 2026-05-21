import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryPillProps {
  category: Category;
  active?: boolean;
  /** When true, renders as a larger card for homepage shortcuts. */
  variant?: "pill" | "tile";
}

export function CategoryPill({
  category,
  active,
  variant = "pill",
}: CategoryPillProps) {
  const href = `/products?cat=${category.slug}`;

  if (variant === "tile") {
    return (
      <Link
        href={href}
        className="group flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:gap-2 sm:p-4"
      >
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-2xl transition-transform group-hover:scale-110 sm:h-14 sm:w-14 sm:text-3xl">
          {category.emoji}
        </div>
        <span className="text-[11px] font-medium leading-tight sm:text-xs">{category.name}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-background text-foreground hover:bg-secondary"
      )}
    >
      <span aria-hidden>{category.emoji}</span>
      {category.name}
    </Link>
  );
}
