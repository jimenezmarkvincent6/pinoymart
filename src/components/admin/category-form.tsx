"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  upsertCategory,
  type CategoryWriteInput,
} from "@/lib/data/categories-mutations";
import type { Category } from "@/types";

const schema = z.object({
  slug: z
    .string()
    .min(2, "Slug required.")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only."),
  name: z.string().min(2, "Name required."),
  emoji: z.string().min(1, "Pick an emoji."),
  description: z.string().min(5, "Add at least 5 characters."),
  sortOrder: z.union([z.coerce.number().int().min(0), z.literal(""), z.nan()]).optional(),
});

type FormValues = z.input<typeof schema>;

interface CategoryFormProps {
  initialCategory?: Category & { sortOrder?: number };
  existingSlugs: string[];
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function CategoryForm({
  initialCategory,
  existingSlugs,
}: CategoryFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialCategory);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: initialCategory?.slug ?? "",
      name: initialCategory?.name ?? "",
      emoji: initialCategory?.emoji ?? "📦",
      description: initialCategory?.description ?? "",
      sortOrder: initialCategory?.sortOrder ?? "",
    },
  });

  const watchName = form.watch("name");

  useEffect(() => {
    if (isEdit) return;
    if (!watchName) return;
    if (!form.getValues("slug")) form.setValue("slug", slugify(watchName));
  }, [watchName, isEdit, form]);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setBusy(true);
    try {
      // Slug uniqueness check (creation only)
      if (!isEdit && existingSlugs.includes(values.slug as string)) {
        form.setError("slug", {
          message: "A category with this slug already exists.",
        });
        setBusy(false);
        return;
      }

      const sortOrderNum =
        typeof values.sortOrder === "number" && !Number.isNaN(values.sortOrder)
          ? values.sortOrder
          : undefined;

      const payload: CategoryWriteInput = {
        slug: values.slug as string,
        name: values.name as string,
        emoji: values.emoji as string,
        description: values.description as string,
        sortOrder: sortOrderNum,
      };

      await upsertCategory(payload);
      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      console.error(err);
      const msg = (err as Error).message ?? "";
      if (msg.includes("permission-denied")) {
        setError("Permission denied. Are you signed in as super-admin?");
      } else {
        setError("Save failed. Check the console.");
      }
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/categories"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back to categories
      </Link>

      <div>
        <h1 className="text-2xl font-bold">
          {isEdit ? "Edit category" : "Add new category"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? `Editing ${initialCategory?.name}. Changes propagate immediately.`
            : "Fill in the details below. Slug auto-generates from the name."}
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-6 lg:grid-cols-[1fr_300px]"
      >
        <div className="space-y-6">
          <Section title="Identity">
            <div className="grid gap-4">
              <Field
                id="name"
                label="Name"
                hint="What customers will see on the shop."
                error={form.formState.errors.name?.message}
              >
                <Input
                  id="name"
                  placeholder="Canned Goods"
                  {...form.register("name")}
                />
              </Field>
              <Field
                id="slug"
                label="Slug"
                hint="URL + Firestore ID. Lock after creation."
                error={form.formState.errors.slug?.message}
              >
                <Input
                  id="slug"
                  disabled={isEdit}
                  placeholder="canned-goods"
                  {...form.register("slug")}
                />
              </Field>
              <Field
                id="description"
                label="Description"
                hint="One sentence shown under the category name."
                error={form.formState.errors.description?.message}
              >
                <Textarea
                  id="description"
                  rows={2}
                  placeholder="Pantry essentials — corned beef, tuna, sardines & more."
                  {...form.register("description")}
                />
              </Field>
              <Field
                id="sortOrder"
                label="Sort order"
                hint="Lower numbers appear first on the homepage tile row. Leave empty to sort last."
              >
                <Input
                  id="sortOrder"
                  type="number"
                  step="1"
                  min={0}
                  inputMode="numeric"
                  placeholder="0"
                  {...form.register("sortOrder")}
                />
              </Field>
            </div>
          </Section>
        </div>

        <aside className="space-y-6">
          <Section title="Visual">
            <Field
              id="emoji"
              label="Emoji"
              hint="Shown on the homepage tile and filter chip."
              error={form.formState.errors.emoji?.message}
            >
              <Input
                id="emoji"
                className="text-3xl"
                placeholder="🥫"
                {...form.register("emoji")}
              />
            </Field>
          </Section>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="xl"
            className="w-full rounded-full"
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />{" "}
                {isEdit ? "Save changes" : "Create category"}
              </>
            )}
          </Button>
        </aside>
      </form>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
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
