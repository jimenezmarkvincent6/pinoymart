import Link from "next/link";
import {
  ArrowRight,
  Clock,
  MapPin,
  MessageCircle,
  Search,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/shop/page-hero";
import { getBranches } from "@/lib/data/branches";
import { getSiteSettings } from "@/lib/data/settings";

export const revalidate = 60;

export const metadata = {
  title: "Delivery & Pickup",
  description:
    "How delivery and pickup work at Pinoy Mart. Browse, order via WhatsApp, and choose delivery to your door or pickup at your nearest branch.",
};

const steps = [
  {
    icon: Search,
    title: "1. Browse",
    desc: "Explore our products by category or search for what you need.",
  },
  {
    icon: ShoppingBag,
    title: "2. Add to cart",
    desc: "Pick your items and quantities, then choose pickup or delivery.",
  },
  {
    icon: MessageCircle,
    title: "3. Send via WhatsApp",
    desc: "One tap sends your full order to your branch — no account needed.",
  },
  {
    icon: Truck,
    title: "4. Confirm & receive",
    desc: "Our staff confirms your order, total, and timing right on WhatsApp.",
  },
];

export default async function DeliveryPage() {
  const [branches, settings] = await Promise.all([
    getBranches(),
    getSiteSettings(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-6 sm:px-6 sm:py-10">
      <PageHero
        eyebrow="🚚 Delivery & Pickup"
        title="Quick, no-hassle ordering."
        subtitle="Order in seconds through WhatsApp, then choose delivery to your door or pickup at your nearest branch."
      />

      {settings.deliveryFeeNote && (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <Truck className="h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm font-medium">{settings.deliveryFeeNote}</p>
        </div>
      )}

      <section>
        <h2 className="text-xl font-bold">How it works</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-accent" />
            <h3 className="text-base font-semibold">Delivery</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            We deliver from your nearest branch to your home or office. Just
            share your address in the order, and our team will confirm the
            delivery fee and estimated time on WhatsApp.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">Pickup</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Prefer to collect it yourself? Choose pickup at checkout and we'll
            have your order ready at your selected branch — skip the queue and
            grab it when you arrive.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">Delivery areas by branch</h2>
        <div className="mt-4 space-y-2">
          {branches.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm font-semibold">{b.name}</span>
                <span className="text-xs text-muted-foreground">
                  · {b.emirate}
                </span>
              </div>
              <div className="text-xs text-muted-foreground sm:text-right">
                {b.deliveryArea}
                <span className="ml-2 inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {b.hours}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <h2 className="text-lg font-bold">Ready to order?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse our products and send your order in seconds.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/products">
            Start shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
