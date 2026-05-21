import Link from "next/link";
import { ArrowRight, Tag, Truck, Clock, ShieldCheck } from "lucide-react";
import { HeroBanner } from "@/components/shop/hero-banner";
import { CategoryPill } from "@/components/shop/category-pill";
import { ProductGrid } from "@/components/shop/product-grid";
import { getCategories } from "@/lib/data/categories";
import {
  getFeaturedProducts,
  getPromoProducts,
  getProducts,
} from "@/lib/data/products";
import { DEFAULT_HOMEPAGE_BANNER, getHomepageBanner } from "@/lib/data/promos";

// Re-fetch from Firestore every 60s so admin edits propagate quickly.
export const revalidate = 60;

const perks = [
  {
    icon: Truck,
    title: "Same-day delivery",
    desc: "Order before 6PM, get it tonight.",
  },
  {
    icon: ShieldCheck,
    title: "Authentic Pinoy brands",
    desc: "Direct from trusted importers.",
  },
  {
    icon: Clock,
    title: "Open daily 9AM–11PM",
    desc: "Even on weekends and holidays.",
  },
  {
    icon: Tag,
    title: "Weekly promos",
    desc: "Sulit deals on top items.",
  },
];

export default async function HomePage() {
  const [categories, allProducts, featured, promos, bannerFromDb] = await Promise.all([
    getCategories(),
    getProducts(),
    getFeaturedProducts(),
    getPromoProducts(),
    getHomepageBanner(),
  ]);
  const newProducts = allProducts.slice(-6);
  const banner = bannerFromDb ?? DEFAULT_HOMEPAGE_BANNER;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-5 sm:space-y-12 sm:px-6 sm:py-10">
      <HeroBanner />

      {/* Perk strip */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {perks.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section>
        <SectionHeader
          title="Shop by category"
          subtitle="Pinoy essentials, organized for one-tap browsing."
        />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
          {categories.map((c) => (
            <CategoryPill key={c.slug} category={c} variant="tile" />
          ))}
        </div>
      </section>

      {/* Featured */}
      <section>
        <SectionHeader
          title="Featured today"
          subtitle="Hand-picked favorites flying off the shelves."
          href="/products"
        />
        <ProductGrid products={featured} />
      </section>

      {/* Promo strip — content sourced from Firestore (with default fallback) */}
      {banner.active && (
        <section className="overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/15 via-[hsl(var(--yellow))]/20 to-primary/15 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent backdrop-blur">
                {banner.eyebrow}
              </p>
              <h3 className="mt-2 text-2xl font-bold sm:text-3xl">
                {banner.title}
              </h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {banner.description}
              </p>
            </div>
            <Link
              href={banner.ctaHref}
              className="inline-flex items-center gap-1 self-start rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-foreground/90 sm:self-auto"
            >
              {banner.ctaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {promos.length > 0 && (
            <div className="mt-6">
              <ProductGrid products={promos} />
            </div>
          )}
        </section>
      )}

      {/* New */}
      <section>
        <SectionHeader
          title="Just in"
          subtitle="Latest arrivals in our pantry."
          href="/products"
        />
        <ProductGrid products={newProducts} />
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

