"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronLeft,
  ExternalLink,
  Loader2,
  Save,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertBranch, type BranchWriteInput } from "@/lib/data/branches-mutations";
import type { Branch } from "@/data/branches";

const schema = z.object({
  id: z
    .string()
    .min(2, "ID required.")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only."),
  name: z.string().min(2, "Short name required."),
  fullName: z.string().min(2, "Full name required."),
  emirate: z.string().min(2, "Emirate required."),
  address: z.string().min(5, "Address required."),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  whatsappNumber: z
    .string()
    .min(7, "Enter a valid number.")
    .regex(/^[+0-9 ()-]+$/, "Numbers, spaces, + - ( ) only."),
  deliveryArea: z.string().min(2, "Delivery area required."),
  hours: z.string().min(2, "Hours required."),
  isMain: z.boolean().optional(),
});

type FormValues = z.input<typeof schema>;

interface BranchFormProps {
  initialBranch?: Branch;
  existingIds: string[];
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function BranchForm({ initialBranch, existingIds }: BranchFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialBranch);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: initialBranch?.id ?? "",
      name: initialBranch?.name ?? "",
      fullName: initialBranch?.fullName ?? "",
      emirate: initialBranch?.emirate ?? "",
      address: initialBranch?.address ?? "",
      lat: initialBranch?.lat ?? "",
      lng: initialBranch?.lng ?? "",
      whatsappNumber: initialBranch?.whatsappNumber ?? "",
      deliveryArea: initialBranch?.deliveryArea ?? "",
      hours: initialBranch?.hours ?? "Daily · 9:00 AM – 11:00 PM",
      isMain: initialBranch?.isMain ?? false,
    },
  });

  const watchName = form.watch("name");

  // Auto-slug ID + suggest fullName when creating
  useEffect(() => {
    if (isEdit) return;
    if (!watchName) return;
    if (!form.getValues("id")) form.setValue("id", slugify(watchName));
    if (!form.getValues("fullName")) {
      form.setValue("fullName", `Pinoy Mart – ${watchName}`);
    }
  }, [watchName, isEdit, form]);

  const watchLat = form.watch("lat");
  const watchLng = form.watch("lng");
  const mapsLink =
    Number(watchLat) && Number(watchLng)
      ? `https://www.google.com/maps?q=${watchLat},${watchLng}`
      : null;

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setBusy(true);
    try {
      // ID uniqueness check (creation only)
      if (!isEdit && existingIds.includes(values.id as string)) {
        form.setError("id", { message: "A branch with this ID already exists." });
        setBusy(false);
        return;
      }

      const payload: BranchWriteInput = {
        id: values.id as string,
        name: values.name as string,
        fullName: values.fullName as string,
        emirate: values.emirate as string,
        address: values.address as string,
        lat: Number(values.lat),
        lng: Number(values.lng),
        whatsappNumber: values.whatsappNumber as string,
        deliveryArea: values.deliveryArea as string,
        hours: values.hours as string,
        isMain: Boolean(values.isMain),
      };

      await upsertBranch(payload);
      router.push("/admin/branches");
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

  return (
    <div className="space-y-6">
      <Link
        href="/admin/branches"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back to branches
      </Link>

      <div>
        <h1 className="text-2xl font-bold">
          {isEdit ? "Edit branch" : "Add new branch"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? `Editing ${initialBranch?.name}. Changes propagate to the customer site immediately.`
            : "Fill in the details below. The ID auto-generates from the short name."}
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-6 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-6">
          <Section title="Identity">
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="name"
                  label="Short name"
                  hint='e.g. "Karama" — used in pills, breadcrumbs'
                  error={form.formState.errors.name?.message}
                >
                  <Input id="name" placeholder="Karama" {...form.register("name")} />
                </Field>
                <Field
                  id="id"
                  label="Branch ID"
                  hint="Used as the Firestore doc ID + URL slug. Lock after creation."
                  error={form.formState.errors.id?.message}
                >
                  <Input id="id" disabled={isEdit} {...form.register("id")} />
                </Field>
              </div>
              <Field
                id="fullName"
                label="Full name"
                hint='Used in WhatsApp messages. e.g. "Pinoy Mart – Al Karama (Dubai)"'
                error={form.formState.errors.fullName?.message}
              >
                <Input id="fullName" {...form.register("fullName")} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="emirate"
                  label="Emirate"
                  error={form.formState.errors.emirate?.message}
                >
                  <Input id="emirate" placeholder="Dubai" {...form.register("emirate")} />
                </Field>
                <Field
                  id="whatsappNumber"
                  label="WhatsApp number"
                  hint="Digits only (no +). e.g. 971501234567"
                  error={form.formState.errors.whatsappNumber?.message}
                >
                  <Input
                    id="whatsappNumber"
                    inputMode="tel"
                    placeholder="971501234567"
                    {...form.register("whatsappNumber")}
                  />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Location">
            <div className="grid gap-4">
              <Field
                id="address"
                label="Street address"
                error={form.formState.errors.address?.message}
              >
                <Input
                  id="address"
                  placeholder="Kuwait St, Al Karama, Dubai"
                  {...form.register("address")}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="lat"
                  label="Latitude"
                  hint="Decimal degrees, e.g. 25.2461"
                  error={form.formState.errors.lat?.message as string | undefined}
                >
                  <Input
                    id="lat"
                    type="number"
                    step="0.0001"
                    inputMode="decimal"
                    placeholder="25.2461"
                    {...form.register("lat")}
                  />
                </Field>
                <Field
                  id="lng"
                  label="Longitude"
                  hint="Decimal degrees, e.g. 55.3083"
                  error={form.formState.errors.lng?.message as string | undefined}
                >
                  <Input
                    id="lng"
                    type="number"
                    step="0.0001"
                    inputMode="decimal"
                    placeholder="55.3083"
                    {...form.register("lng")}
                  />
                </Field>
              </div>
              {mapsLink && (
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 self-start rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-primary hover:bg-secondary"
                >
                  <ExternalLink className="h-3 w-3" />
                  Verify on Google Maps
                </a>
              )}
            </div>
          </Section>

          <Section title="Operations">
            <div className="grid gap-4">
              <Field
                id="deliveryArea"
                label="Delivery area"
                hint='Free-form list. e.g. "Karama · Satwa · Bur Dubai"'
                error={form.formState.errors.deliveryArea?.message}
              >
                <Textarea
                  id="deliveryArea"
                  rows={2}
                  placeholder="Karama · Satwa · Bur Dubai · Oud Metha"
                  {...form.register("deliveryArea")}
                />
              </Field>
              <Field
                id="hours"
                label="Operating hours"
                error={form.formState.errors.hours?.message}
              >
                <Input
                  id="hours"
                  placeholder="Daily · 9:00 AM – 11:00 PM"
                  {...form.register("hours")}
                />
              </Field>
            </div>
          </Section>
        </div>

        <aside className="space-y-6">
          <Section title="Status">
            <label className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3">
              <input
                type="checkbox"
                {...form.register("isMain")}
                className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <div>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  Main branch
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Used as the default for new visitors before location detection.
                  Only one branch can be main — saving this will unset any others.
                </div>
              </div>
            </label>
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
                {isEdit ? "Save changes" : "Create branch"}
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
