import Link from "next/link";
import { ArrowRight, MessageCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-accent/10 px-5 py-8 shadow-[0_0_40px_-12px_rgba(0,0,0,0.6)] sm:rounded-3xl sm:px-10 sm:py-14">
      <div className="absolute inset-0 bg-warm-grid opacity-60" aria-hidden />
      <div className="absolute -right-10 -top-10 hidden h-72 w-72 rounded-full bg-primary/15 blur-3xl md:block" />
      <div className="absolute -bottom-10 -left-10 hidden h-72 w-72 rounded-full bg-accent/15 blur-3xl md:block" />

      <div className="relative grid items-center gap-8 md:grid-cols-[1.1fr_1fr]">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur">
            🇵🇭 Proudly Pinoy · Delivered across UAE
          </span>
          <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Home of <span className="text-primary">quality Filipino</span>{" "}
            <span className="text-accent">products.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
            Browse hundreds of Pinoy favorites. Tap to order. Confirm on
            WhatsApp. No accounts, no checkout chaos — sarap na lang.
          </p>

          <div className="mt-6 grid gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link href="/products">
                Start shopping <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="whatsapp" className="w-full sm:w-auto">
              <Link href={`https://wa.me/${SITE.whatsappNumber}`} target="_blank">
                <MessageCircle className="h-4 w-4" />
                Chat us
              </Link>
            </Button>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4 text-primary" />
            {SITE.deliveryFeeNote}
          </div>
        </div>

        <div className="relative hidden md:block">
          <div className="relative mx-auto grid h-72 w-72 grid-cols-3 gap-3 [transform:rotate(-4deg)]">
            {["🍜", "🥫", "🍚", "🍌", "🥢", "🌶️", "☕", "🐟", "🥥"].map((e, i) => (
              <div
                key={i}
                className="grid place-items-center rounded-2xl border border-border bg-card text-5xl shadow-sm"
                style={{
                  animation: `fade-up 0.6s ease-out both`,
                  animationDelay: `${i * 60}ms`,
                }}
              >
                {e}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
