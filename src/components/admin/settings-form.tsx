"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, MessageCircle, Save, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
} from "@/components/shop/social-icons";
import {
  saveSiteSettings,
  type SiteSettingsInput,
} from "@/lib/data/settings-mutations";
import type { SiteSettings } from "@/lib/data/settings";

const urlOrEmpty = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\//.test(v), {
    message: "Must start with http:// or https:// (or leave empty).",
  });

const schema = z.object({
  supportEmail: z.email("Enter a valid email."),
  defaultWhatsappNumber: z
    .string()
    .min(7, "Enter a valid number.")
    .regex(/^[+0-9 ()-]+$/, "Numbers, spaces, + - ( ) only."),
  deliveryFeeNote: z.string().min(2, "Add a short delivery note."),
  facebookUrl: urlOrEmpty,
  instagramUrl: urlOrEmpty,
  tiktokUrl: urlOrEmpty,
});

type FormValues = z.input<typeof schema>;

export function SettingsForm({
  initialSettings,
}: {
  initialSettings: SiteSettings;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      supportEmail: initialSettings.supportEmail,
      defaultWhatsappNumber: initialSettings.defaultWhatsappNumber,
      deliveryFeeNote: initialSettings.deliveryFeeNote,
      facebookUrl: initialSettings.facebookUrl,
      instagramUrl: initialSettings.instagramUrl,
      tiktokUrl: initialSettings.tiktokUrl,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setSaved(false);
    setBusy(true);
    try {
      const payload: SiteSettingsInput = {
        supportEmail: values.supportEmail as string,
        defaultWhatsappNumber: values.defaultWhatsappNumber as string,
        deliveryFeeNote: values.deliveryFeeNote as string,
        facebookUrl: values.facebookUrl as string,
        instagramUrl: values.instagramUrl as string,
        tiktokUrl: values.tiktokUrl as string,
      };
      await saveSiteSettings(payload);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      const msg = (err as Error).message ?? "";
      if (msg.includes("permission-denied")) {
        setError("Permission denied. Are you signed in as super-admin?");
      } else if (msg.includes("Missing or insufficient permissions")) {
        setError(
          "Firestore rules don't allow writing to settings yet. Publish the updated rules (see deploy notes)."
        );
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
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Store-wide contact info, marketing copy, and social links. Branch
          phone numbers + hours are managed under{" "}
          <a href="/admin/branches" className="text-primary hover:underline">
            Branches
          </a>
          .
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid max-w-2xl gap-6"
      >
        <Section title="Contact" subtitle="Shown in the footer + hero.">
          <div className="grid gap-4">
            <Field
              id="supportEmail"
              label="Support email"
              icon={Mail}
              error={form.formState.errors.supportEmail?.message}
            >
              <Input
                id="supportEmail"
                type="email"
                placeholder="hello@pinoymart.ae"
                {...form.register("supportEmail")}
              />
            </Field>
            <Field
              id="defaultWhatsappNumber"
              label="Default WhatsApp number"
              icon={MessageCircle}
              hint="Used for the hero 'Chat us' button. Digits, e.g. 971501234567. (Branch orders still route to each branch's own number.)"
              error={form.formState.errors.defaultWhatsappNumber?.message}
            >
              <Input
                id="defaultWhatsappNumber"
                inputMode="tel"
                placeholder="971501234567"
                {...form.register("defaultWhatsappNumber")}
              />
            </Field>
          </div>
        </Section>

        <Section title="Marketing">
          <Field
            id="deliveryFeeNote"
            label="Delivery note"
            icon={Truck}
            hint="The line under the hero CTAs."
            error={form.formState.errors.deliveryFeeNote?.message}
          >
            <Input
              id="deliveryFeeNote"
              placeholder="Free delivery in Dubai for orders above AED 100"
              {...form.register("deliveryFeeNote")}
            />
          </Field>
        </Section>

        <Section
          title="Social links"
          subtitle="Footer icons link here. Leave empty to keep an icon non-clickable."
        >
          <div className="grid gap-4">
            <Field
              id="facebookUrl"
              label="Facebook URL"
              renderIcon={<FacebookIcon className="h-4 w-4" />}
              error={form.formState.errors.facebookUrl?.message}
            >
              <Input
                id="facebookUrl"
                placeholder="https://facebook.com/pinoymart"
                {...form.register("facebookUrl")}
              />
            </Field>
            <Field
              id="instagramUrl"
              label="Instagram URL"
              renderIcon={<InstagramIcon className="h-4 w-4" />}
              error={form.formState.errors.instagramUrl?.message}
            >
              <Input
                id="instagramUrl"
                placeholder="https://instagram.com/pinoymart"
                {...form.register("instagramUrl")}
              />
            </Field>
            <Field
              id="tiktokUrl"
              label="TikTok URL"
              renderIcon={<TiktokIcon className="h-4 w-4" />}
              error={form.formState.errors.tiktokUrl?.message}
            >
              <Input
                id="tiktokUrl"
                placeholder="https://tiktok.com/@pinoymart"
                {...form.register("tiktokUrl")}
              />
            </Field>
          </div>
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
                <Save className="h-5 w-5" /> Save settings
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
  icon: Icon,
  renderIcon,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  icon?: typeof Mail;
  renderIcon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {renderIcon}
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
