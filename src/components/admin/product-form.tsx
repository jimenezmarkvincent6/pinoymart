"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronLeft,
  Loader2,
  Save,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/format";
import {
  isSlugTaken,
  upsertProduct,
  type ProductWriteInput,
} from "@/lib/data/products-mutations";
import type { Branch } from "@/data/branches";
import type { Category, Product } from "@/types";
import type { CategorySlug } from "@/types";

const TAG_OPTIONS = ["bestseller", "new", "promo", "frozen"] as const;

const schema = z.object({
  id: z
    .string()
    .min(2, "ID required.")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only."),
  slug: z
    .string()
    .min(2, "Slug required.")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only."),
  name: z.string().min(2, "Name required."),
  brand: z.string().optional(),
  description: z.string().min(5, "Add at least 5 characters."),
  price: z.coerce.number().positive("Price must be positive."),
  oldPrice: z.union([z.coerce.number().positive(), z.literal(""), z.nan()]).optional(),
  unit: z.string().min(1, "Unit required (e.g. 180g)."),
  image: z.string().min(1, "Add an emoji or image URL."),
  category: z.string().min(1, "Pick a category."),
  rating: z.union([z.coerce.number().min(0).max(5), z.literal(""), z.nan()]).optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

// Use the *input* shape so RHF's resolver typing aligns —
// z.coerce.number() turns string inputs into numbers at parse time, but the
// form actually holds the raw strings.
type FormValues = z.input<typeof schema>;

interface ProductFormProps {
  branches: Branch[];
  categories: Category[];
  /** When provided, the form is in "edit" mode. */
  initialProduct?: Product & { stockByBranch?: Record<string, number> };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function ProductForm({
  branches,
  categories,
  initialProduct,
}: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialProduct);

  // Per-branch stock kept as separate state — RHF dynamic-key fields are awkward.
  const [stock, setStock] = useState<Record<string, number>>(() => {
    const seed: Record<string, number> = {};
    for (const b of branches) {
      seed[b.id] = initialProduct?.stockByBranch?.[b.id] ?? 0;
    }
    return seed;
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: initialProduct?.id ?? "",
      slug: initialProduct?.slug ?? "",
      name: initialProduct?.name ?? "",
      brand: initialProduct?.brand ?? "",
      description: initialProduct?.description ?? "",
      price: initialProduct?.price ?? "",
      oldPrice: initialProduct?.oldPrice ?? "",
      unit: initialProduct?.unit ?? "",
      image: initialProduct?.image ?? "🛒",
      category: initialProduct?.category ?? "",
      rating: initialProduct?.rating ?? "",
      featured: initialProduct?.featured ?? false,
      tags: initialProduct?.tags ?? [],
    },
  });

  const watchName = form.watch("name");
  const watchPrice = form.watch("price");
  const watchTags = form.watch("tags") ?? [];

  // Auto-slug + auto-id from name when creating a new product
  useEffect(() => {
    if (isEdit) return;
    if (!watchName) return;
    const next = slugify(watchName);
    if (!form.getValues("slug")) form.setValue("slug", next);
    if (!form.getValues("id")) form.setValue("id", next);
  }, [watchName, isEdit, form]);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setBusy(true);
    try {
      // Slug uniqueness check
      const slugClash = await isSlugTaken(values.slug, isEdit ? values.id : undefined);
      if (slugClash) {
        form.setError("slug", {
          message: "Another product already uses this slug.",
        });
        setBusy(false);
        return;
      }

      const oldPriceNum =
        typeof values.oldPrice === "number" && !Number.isNaN(values.oldPrice)
          ? values.oldPrice
          : undefined;
      if (oldPriceNum !== undefined && oldPriceNum <= Number(values.price)) {
        form.setError("oldPrice", {
          message: "Old price should be higher than current price.",
        });
        setBusy(false);
        return;
      }

      const ratingNum =
        typeof values.rating === "number" && !Number.isNaN(values.rating)
          ? values.rating
          : undefined;

      const payload: ProductWriteInput = {
        id: values.id,
        slug: values.slug,
        name: values.name,
        brand: values.brand?.trim() || undefined,
        description: values.description,
        price: Number(values.price),
        oldPrice: oldPriceNum,
        unit: values.unit,
        image: values.image,
        category: values.category as CategorySlug,
        stock,
        rating: ratingNum,
        tags: values.tags ?? [],
        featured: Boolean(values.featured),
      };

      await upsertProduct(payload, { isNew: !isEdit });
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error(err);
      const msg = (err as Error).message ?? "";
      if (msg.includes("permission-denied") || msg.includes("Missing or insufficient permissions")) {
        setError("Permission denied. Are you signed in as the super-admin?");
      } else {
        setError("Save failed. Check the console for details.");
      }
      setBusy(false);
    }
  };

  const toggleTag = (tag: string) => {
    const current = form.getValues("tags") ?? [];
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    form.setValue("tags", next);
  };

  const totalStock = Object.values(stock).reduce((s, n) => s + (Number(n) || 0), 0);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back to products
      </Link>

      <div>
        <h1 className="text-2xl font-bold">
          {isEdit ? "Edit product" : "Add new product"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? `Editing ${initialProduct?.name}. Changes propagate to the customer site within 60 seconds.`
            : "Fill in the details below. Slug + ID auto-generate from the name."}
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-6 lg:grid-cols-[1fr_360px]"
      >
        {/* Main column */}
        <div className="space-y-6">
          <Section title="Basic info">
            <div className="grid gap-4">
              <Field id="name" label="Product name" error={form.formState.errors.name?.message}>
                <Input id="name" placeholder="Lucky Me Pancit Canton" {...form.register("name")} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="slug" label="URL slug" error={form.formState.errors.slug?.message} hint="lucky-me-pancit-canton">
                  <Input id="slug" {...form.register("slug")} />
                </Field>
                <Field id="id" label="Product ID" error={form.formState.errors.id?.message} hint="Used as the Firestore document ID. Can't be changed later.">
                  <Input id="id" disabled={isEdit} {...form.register("id")} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="brand" label="Brand (optional)">
                  <Input id="brand" placeholder="Lucky Me!" {...form.register("brand")} />
                </Field>
                <Field id="unit" label="Unit" error={form.formState.errors.unit?.message} hint="180g, 1L, Pack of 6, etc.">
                  <Input id="unit" placeholder="180g" {...form.register("unit")} />
                </Field>
              </div>
              <Field
                id="category"
                label="Category"
                error={form.formState.errors.category?.message}
              >
                <select
                  id="category"
                  {...form.register("category")}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm"
                >
                  <option value="">— Select —</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                id="description"
                label="Description"
                error={form.formState.errors.description?.message}
              >
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="A short, mouth-watering description…"
                  {...form.register("description")}
                />
              </Field>
            </div>
          </Section>

          <Section title="Pricing">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="price" label="Price (AED)" error={form.formState.errors.price?.message}>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="6.50"
                  {...form.register("price")}
                />
              </Field>
              <Field
                id="oldPrice"
                label="Old price (AED)"
                hint="Set this to show a 'was X' strikethrough."
                error={form.formState.errors.oldPrice?.message as string | undefined}
              >
                <Input
                  id="oldPrice"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="—"
                  {...form.register("oldPrice")}
                />
              </Field>
            </div>
            {Number(watchPrice) > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Customers will see{" "}
                <span className="font-medium text-foreground">
                  {formatPrice(Number(watchPrice))}
                </span>
                .
              </p>
            )}
          </Section>

          <Section
            title="Per-branch stock"
            subtitle="Set how many units each branch has on hand."
          >
            <div className="space-y-2">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{b.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {b.emirate}
                    </div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={stock[b.id] ?? 0}
                    onChange={(e) =>
                      setStock((s) => ({
                        ...s,
                        [b.id]: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    className="h-10 w-24 rounded-md border border-input bg-background px-3 text-right text-sm font-semibold tabular-nums shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Total across all branches:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {totalStock} units
              </span>
            </p>
          </Section>
        </div>

        {/* Side column */}
        <aside className="space-y-6">
          <Section title="Visual identifier">
            <Field
              id="image"
              label="Emoji"
              error={form.formState.errors.image?.message}
              hint="Used as the product placeholder until you upload a real photo."
            >
              <Input
                id="image"
                placeholder="🍜"
                className="text-2xl"
                {...form.register("image")}
              />
            </Field>
          </Section>

          <Section title="Flags & badges">
            <label className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3">
              <input
                type="checkbox"
                {...form.register("featured")}
                className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <div>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  Featured on homepage
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Shows in the "Featured today" carousel.
                </div>
              </div>
            </label>

            <div className="mt-3 space-y-1.5">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1.5">
                {TAG_OPTIONS.map((tag) => {
                  const active = watchTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={
                        active
                          ? "inline-flex items-center gap-1 rounded-full border border-primary bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground"
                          : "inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary"
                      }
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <Field id="rating" label="Rating (optional)" hint="0–5">
              <Input
                id="rating"
                type="number"
                step="0.1"
                min={0}
                max={5}
                placeholder="4.5"
                {...form.register("rating")}
              />
            </Field>
          </Section>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" size="xl" className="w-full rounded-full" disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="h-5 w-5" /> {isEdit ? "Save changes" : "Create product"}
              </>
            )}
          </Button>

          {!isEdit && (
            <p className="text-center text-[11px] text-muted-foreground">
              <Sparkles className="mr-1 inline h-3 w-3" /> Created products go live within 60s.
            </p>
          )}
        </aside>
      </form>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
