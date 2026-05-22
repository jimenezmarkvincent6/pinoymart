import Link from "next/link";
import { ArrowRight, Heart, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/shop/page-hero";
import { getCategories } from "@/lib/data/categories";
import { getBranches } from "@/lib/data/branches";

export const revalidate = 60;

export const metadata = {
  title: "About",
  description:
    "Pinoy Mart — home of quality Filipino products across the UAE. Authentic Pinoy groceries, ordered the easy way through WhatsApp.",
};

const values = [
  {
    icon: ShieldCheck,
    title: "Authentic Pinoy brands",
    desc: "The labels you grew up with — sourced from trusted importers, never imitations.",
  },
  {
    icon: MessageCircle,
    title: "Ordering made simple",
    desc: "No accounts, no complicated checkout. Browse, tap, and send your order on WhatsApp.",
  },
  {
    icon: Truck,
    title: "Across the UAE",
    desc: "Multiple branches mean faster delivery and pickup wherever you are.",
  },
  {
    icon: Heart,
    title: "For the kababayan",
    desc: "Built to bring a little taste of home to every Filipino household in the Emirates.",
  },
];

export default async function AboutPage() {
  const [categories, branches] = await Promise.all([
    getCategories(),
    getBranches(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-6 sm:px-6 sm:py-10">
      <PageHero
        eyebrow="🇵🇭 Proudly Pinoy"
        title="Home of quality Filipino products."
        subtitle="Pinoy Mart brings authentic Filipino groceries to kababayan and food lovers across the UAE — the same brands and flavors from home, now just a few taps away."
      />

      <section className="grid gap-4 sm:grid-cols-2">
        {values.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold">Our story</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Living far from home shouldn't mean giving up the flavors you love.
            Pinoy Mart started with a simple goal: make it easy for Filipinos in
            the UAE to find the brands, snacks, and pantry staples that taste
            like home — from Lucky Me and Century Tuna to Datu Puti, Boy Bawang,
            and Goldilocks polvoron.
          </p>
          <p>
            We know how ordering usually goes: long back-and-forth chats trying
            to describe what you want. So we built this website to make it
            effortless — browse everything we carry, add what you need, and send
            a complete, organized order straight to our WhatsApp. No account, no
            hassle.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">What we carry</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {categories.length} categories of Filipino favorites and daily
          essentials.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/products?cat=${c.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm transition-colors hover:border-primary/40 hover:bg-secondary"
            >
              <span aria-hidden>{c.emoji}</span>
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <h2 className="text-lg font-bold">
            {branches.length} branches across the UAE
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Find your nearest store and start your order in seconds.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="lg" className="rounded-full">
            <Link href="/products">
              Start shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link href="/contact">Our branches</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
