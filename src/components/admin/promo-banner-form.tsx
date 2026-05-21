"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Loader2, Megaphone, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  saveHomepageBanner,
  type PromoBannerInput,
} from "@/lib/data/promos-mutations";
import type { PromoBannerDoc } from "@/lib/firebase/schema";

const schema = z.object({
  eyebrow: z.string().min(1, "Eyebrow required."),
  title: z.string().min(2, "Title required."),
  description: z.string().min(2, "Description required."),
  ctaLabel: z.string().min(1, "CTA label required."),
  ctaHref: z
    .string()
    .min(1, "CTA link required.")
    .regex(/^(\/|https?:\/\/)/, "Use a relative path (/...) or absolute URL."),
  active: z.boolean(),
});

type FormValues = z.input<typeof schema>;

export function PromoBannerForm({
  initialBanner,
}: {
  initialBanner: PromoBannerDoc;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      eyebrow: initialBanner.eyebrow,
      title: initialBanner.title,
      description: initialBanner.description,
      ctaLabel: initialBanner.ctaLabel,
      ctaHref: initialBanner.ctaHref,
      active: initialBanner.active,
    },
  });

  // Live preview values
  const watch = form.watch();

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setSaved(false);
    setBusy(true);
    try {
      const payload: PromoBannerInput = {
        eyebrow: values.eyebrow as string,
        title: values.title as string,
        description: values.description as string,
        ctaLabel: values.ctaLabel as string,
        ctaHref: values.ctaHref as string,
        active: Boolean(values.active),
      };
      await saveHomepageBanner(payload);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      const msg = (err as Error).message ?? "";
      if (msg.includes("permission-denied")) {
        setError("Permission denied. Are you signed in as super-admin?");
      } else {
        setError("Save failed. Check the console.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Promos</h1>
        <p className="text-sm text-muted-foreground">
          Edit the homepage promo banner. Product-level discounts are managed
          per-product in{" "}
          <a href="/admin/products" className="text-primary hover:underline">
            Products
          </a>
          .
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <Section title="Homepage banner content">
            <div className="grid gap-4">
              <Field
                id="eyebrow"
                label="Eyebrow"
                hint='Small label above the headline. e.g. "🔥 Weekly Promo"'
                error={form.formState.errors.eyebrow?.message}
              >
                <Input
                  id="eyebrow"
                  placeholder="🔥 Weekly Promo"
                  {...form.register("eyebrow")}
                />
              </Field>
              <Field
                id="title"
                label="Headline"
                error={form.formState.errors.title?.message}
              >
                <Input
                  id="title"
                  placeholder="Sulit Sunday — up to 20% off."
                  {...form.register("title")}
                />
              </Field>
              <Field
                id="description"
                label="Description"
                error={form.formState.errors.description?.message}
              >
                <Textarea
                  id="description"
                  rows={2}
                  placeholder="Hand-picked deals on the brands you love."
                  {...form.register("description")}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="ctaLabel"
                  label="Button label"
                  error={form.formState.errors.ctaLabel?.message}
                >
                  <Input
                    id="ctaLabel"
                    placeholder="See all promos"
                    {...form.register("ctaLabel")}
                  />
                </Field>
                <Field
                  id="ctaHref"
                  label="Button link"
                  hint='Relative path or full URL'
                  error={form.formState.errors.ctaHref?.message}
                >
                  <Input
                    id="ctaHref"
                    placeholder="/products?promo=1"
                    {...form.register("ctaHref")}
                  />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Visibility">
            <label className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3">
              <input
                type="checkbox"
                {...form.register("active")}
                className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <div>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Megaphone className="h-3.5 w-3.5 text-primary" />
                  Show this banner on the homepage
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Uncheck to hide it entirely (the slot collapses to nothing).
                </div>
              </div>
            </label>
          </Section>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              size="xl"
              className="rounded-full"
              disabled={busy}
            >
              {busy ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" /> Save banner
                </>
              )}
            </Button>
            {saved && (
              <span className="text-xs font-medium text-[hsl(var(--success))]">
                ✓ Saved. Live in ≤60s.
              </span>
            )}
          </div>
        </form>

        <aside className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Live preview
          </p>
          <div className="overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/15 via-[hsl(var(--yellow))]/20 to-primary/15 p-5">
            <p className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent backdrop-blur">
              {watch.eyebrow || "—"}
            </p>
            <h3 className="mt-3 text-lg font-bold leading-tight sm:text-xl">
              {watch.title || "—"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {watch.description || "—"}
            </p>
            <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background">
              {watch.ctaLabel || "—"} <ArrowRight className="h-3 w-3" />
            </div>
            {!watch.active && (
              <p className="mt-3 text-[11px] font-medium text-muted-foreground">
                Hidden — currently inactive.
              </p>
            )}
          </div>
        </aside>
      </div>
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
