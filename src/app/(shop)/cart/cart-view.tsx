"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Clock,
  Loader2,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProductImage } from "@/components/shop/product-image";
import { useCart, resolveCart } from "@/store/cart";
import { useActiveBranch } from "@/store/branch";
import { formatPrice } from "@/lib/format";
import { buildWhatsAppMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import { createOrder } from "@/lib/data/orders-mutations";
import type { CheckoutInfo } from "@/types";

const schema = z
  .object({
    fulfillment: z.enum(["pickup", "delivery"]),
    name: z.string().min(2, "Please enter your name."),
    contact: z
      .string()
      .min(7, "Enter a valid UAE phone number.")
      .regex(/^[+0-9 ()-]+$/, "Numbers, spaces, + - ( ) only."),
    deliveryLocation: z.string().optional(),
    notes: z.string().max(300).optional(),
  })
  .refine(
    (data) =>
      data.fulfillment === "pickup" ||
      Boolean(data.deliveryLocation && data.deliveryLocation.trim().length >= 5),
    {
      path: ["deliveryLocation"],
      message: "Please add your delivery address.",
    }
  );

export function CartView() {
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const setQty = useCart((s) => s.setQty);
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  const { lines, subtotal, itemCount } = useMemo(
    () => resolveCart(items),
    [items]
  );

  const branch = useActiveBranch();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [generated, setGenerated] = useState<
    { link: string; message: string; checkoutInfo: CheckoutInfo } | null
  >(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const form = useForm<CheckoutInfo>({
    resolver: zodResolver(schema),
    defaultValues: {
      fulfillment: "delivery",
      name: "",
      contact: "",
      deliveryLocation: "",
      notes: "",
    },
  });

  const fulfillment = form.watch("fulfillment");

  const onSubmit = (data: CheckoutInfo) => {
    const message = buildWhatsAppMessage({ lines, subtotal, info: data, branch });
    const link = buildWhatsAppLink(message, branch.whatsappNumber);
    setGenerated({ link, message, checkoutInfo: data });
    setPreviewOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (!generated) return;
    setConfirmBusy(true);

    // Try to capture the order in Firestore first. If it fails, we still open
    // WhatsApp — the customer's WA message reaches the branch either way, and
    // we don't want a flaky network to block the order.
    try {
      await createOrder({
        branchId: branch.id,
        branchName: branch.name,
        fulfillment: generated.checkoutInfo.fulfillment,
        customerName: generated.checkoutInfo.name,
        customerContact: generated.checkoutInfo.contact,
        deliveryLocation: generated.checkoutInfo.deliveryLocation,
        notes: generated.checkoutInfo.notes,
        items: lines.map((l) => ({
          productId: l.productId,
          productSlug: l.slug,
          name: l.name,
          unit: l.unit,
          quantity: l.quantity,
          price: l.price,
          lineTotal: l.lineTotal,
        })),
        subtotal,
        whatsappLink: generated.link,
      });
    } catch (err) {
      console.error("Failed to capture order in Firestore:", err);
    }

    // Open WhatsApp in a new tab, then clear cart and close the preview.
    window.open(generated.link, "_blank", "noopener,noreferrer");
    clear();
    setPreviewOpen(false);
    setConfirmBusy(false);
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 text-center text-muted-foreground sm:px-6">
        Loading cart…
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-primary/10 text-5xl">
          🛒
        </div>
        <h1 className="mt-6 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add some Pinoy favorites to get started.
        </p>
        <Button asChild size="lg" className="mt-6 rounded-full">
          <Link href="/products">
            <ShoppingBag className="h-4 w-4" />
            Browse products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-40 pt-6 sm:px-6 sm:pb-10 sm:pt-10">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Keep shopping
        </Link>
        <button
          onClick={clear}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear cart
        </button>
      </div>

      <h1 className="text-2xl font-bold sm:text-3xl">
        Your cart{" "}
        <span className="text-muted-foreground">
          · {itemCount} item{itemCount === 1 ? "" : "s"}
        </span>
      </h1>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
          <MapPin className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">
            Ordering from {branch.name} branch
          </p>
          <p className="text-xs text-muted-foreground">
            {branch.address} · Delivers to {branch.deliveryArea}
          </p>
        </div>
        <Link
          href="/products"
          className="hidden text-xs font-medium text-primary hover:underline sm:inline"
        >
          Use header to switch
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-3">
          {lines.map((line) => (
            <li
              key={line.productId}
              className="flex gap-3 rounded-xl border border-border bg-card p-2.5 shadow-sm sm:p-3"
            >
              <div className="h-20 w-20 shrink-0 sm:h-24 sm:w-24">
                <ProductImage
                  emoji={line.image}
                  name={line.name}
                  size="sm"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/products/${line.slug}`}
                      className="line-clamp-2 text-sm font-medium hover:underline"
                    >
                      {line.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {line.brand} · {line.unit}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(line.productId)}
                    aria-label="Remove from cart"
                    className="-mt-1.5 -mr-1.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive sm:h-8 sm:w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2">
                  <div className="inline-flex items-center rounded-full border border-input bg-background p-0.5 shadow-sm">
                    <button
                      onClick={() => decrement(line.productId)}
                      aria-label="Decrease quantity"
                      className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-secondary sm:h-8 sm:w-8"
                    >
                      <Minus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                    </button>
                    <input
                      value={line.quantity}
                      onChange={(e) =>
                        setQty(line.productId, Math.max(0, Number(e.target.value) || 0))
                      }
                      inputMode="numeric"
                      className="w-9 bg-transparent text-center text-base font-semibold tabular-nums focus:outline-none sm:w-10 sm:text-sm"
                    />
                    <button
                      onClick={() => increment(line.productId)}
                      aria-label="Increase quantity"
                      className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-secondary sm:h-8 sm:w-8"
                    >
                      <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold tabular-nums">
                      {formatPrice(line.lineTotal)}
                    </div>
                    <div className="text-[10px] text-muted-foreground sm:text-[11px]">
                      {formatPrice(line.price)} each
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <h2 className="text-base font-semibold">Order summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              <Row
                label={fulfillment === "pickup" ? "Pickup" : "Delivery"}
                value={
                  fulfillment === "pickup"
                    ? "Free · in-store"
                    : "Confirmed on WhatsApp"
                }
                muted
              />
              <div className="border-t border-border pt-3">
                <Row
                  label="Estimated total"
                  value={formatPrice(subtotal)}
                  emphasis
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {fulfillment === "pickup"
                ? "We'll prep your order and confirm your ready time on WhatsApp."
                : "Final pricing and delivery fees confirmed by our team on WhatsApp."}
            </p>
          </div>

          <form
            id="checkout-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
          >
            <div>
              <h2 className="text-base font-semibold">How would you like it?</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose pickup or delivery — we'll prefill it into your WhatsApp message.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FulfillmentCard
                icon={Store}
                title="Pickup"
                subtitle="Ready when you arrive"
                active={fulfillment === "pickup"}
                onClick={() => form.setValue("fulfillment", "pickup")}
              />
              <FulfillmentCard
                icon={Truck}
                title="Delivery"
                subtitle="Quick & hassle-free"
                active={fulfillment === "delivery"}
                onClick={() => form.setValue("fulfillment", "delivery")}
              />
            </div>

            {fulfillment === "pickup" && (
              <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">
                    Pickup at {branch.name} — {branch.address}
                  </p>
                  <p className="mt-0.5 text-muted-foreground">
                    {branch.hours} · We'll confirm your ready time on WhatsApp.
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-3">
              <Field
                id="name"
                label="Name"
                error={form.formState.errors.name?.message}
              >
                <Input id="name" placeholder="Juan dela Cruz" {...form.register("name")} />
              </Field>
              <Field
                id="contact"
                label="UAE contact number"
                error={form.formState.errors.contact?.message}
              >
                <Input
                  id="contact"
                  placeholder="+971 50 123 4567"
                  inputMode="tel"
                  {...form.register("contact")}
                />
              </Field>
              {fulfillment === "delivery" && (
                <Field
                  id="deliveryLocation"
                  label="Delivery location"
                  error={form.formState.errors.deliveryLocation?.message}
                >
                  <Input
                    id="deliveryLocation"
                    placeholder="Bldg, street, area, emirate"
                    {...form.register("deliveryLocation")}
                  />
                </Field>
              )}
              <Field id="notes" label="Notes (optional)">
                <Textarea
                  id="notes"
                  placeholder="Anything we should know?"
                  rows={2}
                  {...form.register("notes")}
                />
              </Field>
            </div>

            {/* Desktop submit — mobile users get the sticky bar below */}
            <Button
              type="submit"
              variant="whatsapp"
              size="xl"
              className="hidden w-full rounded-full md:inline-flex"
            >
              <MessageCircle className="h-5 w-5" />
              Order via WhatsApp
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              Sends to <span className="font-medium text-foreground">{branch.name}</span> branch · +{branch.whatsappNumber}
            </p>
          </form>
        </aside>
      </div>

      {/* Sticky mobile checkout bar — pinned above the bottom nav */}
      <CartCheckoutBar subtotal={subtotal} fulfillment={fulfillment} />

      {previewOpen && generated && (
        <CheckoutPreview
          link={generated.link}
          message={generated.message}
          busy={confirmBusy}
          onClose={() => !confirmBusy && setPreviewOpen(false)}
          onConfirm={handleConfirmOrder}
        />
      )}
    </div>
  );
}

function CartCheckoutBar({
  subtotal,
  fulfillment,
}: {
  subtotal: number;
  fulfillment: "pickup" | "delivery";
}) {
  return (
    <div
      className="fixed inset-x-0 bottom-[64px] z-30 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {fulfillment === "pickup" ? "Pickup total" : "Delivery total"}
          </div>
          <div className="text-lg font-bold leading-none tabular-nums">
            {formatPrice(subtotal)}
          </div>
        </div>
        <button
          type="submit"
          form="checkout-form"
          className="ml-auto inline-flex h-12 items-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-bold text-white shadow-lg shadow-[#25D366]/30 transition-transform active:scale-[0.98]"
        >
          <MessageCircle className="h-5 w-5" />
          Order via WhatsApp
        </button>
      </div>
    </div>
  );
}

function FulfillmentCard({
  icon: Icon,
  title,
  subtitle,
  active,
  onClick,
}: {
  icon: typeof Store;
  title: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "group flex flex-col items-start gap-1 rounded-xl border-2 border-primary bg-primary/5 p-3 text-left transition"
          : "group flex flex-col items-start gap-1 rounded-xl border-2 border-border bg-background p-3 text-left transition hover:border-primary/40 hover:bg-secondary/40"
      }
    >
      <div
        className={
          active
            ? "grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"
            : "grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground"
        }
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-1 text-sm font-semibold leading-tight">{title}</div>
      <div className="text-[11px] text-muted-foreground">{subtitle}</div>
    </button>
  );
}

function Row({
  label,
  value,
  muted,
  emphasis,
}: {
  label: string;
  value: string;
  muted?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={
          emphasis ? "text-sm font-medium" : "text-sm text-muted-foreground"
        }
      >
        {label}
      </span>
      <span
        className={
          emphasis
            ? "text-base font-bold"
            : muted
            ? "text-sm text-muted-foreground"
            : "text-sm font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function CheckoutPreview({
  link,
  message,
  busy,
  onClose,
  onConfirm,
}: {
  link: string;
  message: string;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-3 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#25D366] text-white">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight">
              Order ready to send
            </h3>
            <p className="text-xs text-muted-foreground">
              We'll open WhatsApp with this message prefilled.
            </p>
          </div>
        </div>

        <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-secondary/40 p-3 text-xs leading-relaxed text-foreground">
          {message}
        </pre>

        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-full"
            onClick={onClose}
            disabled={busy}
          >
            Edit details
          </Button>
          <Button
            type="button"
            variant="whatsapp"
            className="flex-1 rounded-full"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending…
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4" />
                Send on WhatsApp
              </>
            )}
          </Button>
        </div>

        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block break-all text-center text-[10px] text-muted-foreground underline-offset-2 hover:underline"
        >
          {link.length > 100 ? `${link.slice(0, 100)}…` : link}
        </a>
      </div>
    </div>
  );
}
