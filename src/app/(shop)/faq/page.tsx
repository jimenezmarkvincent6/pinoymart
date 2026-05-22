import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/shop/page-hero";

export const metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about ordering from Pinoy Mart — accounts, payment, delivery, pickup, and more.",
};

const faqs = [
  {
    q: "Do I need to create an account to order?",
    a: "No. That's the whole point — just browse, add items to your cart, and send your order through WhatsApp. No sign-up, no passwords, no hassle.",
  },
  {
    q: "How do I place an order?",
    a: "Browse our products, tap to add what you want to your cart, choose pickup or delivery, fill in your name and contact, then tap 'Order via WhatsApp'. Your complete order is sent to your branch — already typed out with items, quantities, and total.",
  },
  {
    q: "How do I pay?",
    a: "Payment is arranged directly with our staff when they confirm your order on WhatsApp — typically cash or card on delivery or at pickup. No online payment or card details needed on the website.",
  },
  {
    q: "Which areas do you deliver to?",
    a: "We deliver from multiple branches across Dubai, Sharjah, Abu Dhabi, and Ajman. Each branch covers nearby areas — see the full list on our Delivery page.",
  },
  {
    q: "Can I pick up my order instead of delivery?",
    a: "Yes! Choose 'Pickup' at checkout and we'll have your order ready at your selected branch so you can grab it when you arrive.",
  },
  {
    q: "How does the website know which branch to send my order to?",
    a: "It automatically suggests your nearest branch based on your location (with your permission), and you can switch branches anytime using the location pin at the top of the page. Your order always goes to the branch you've selected.",
  },
  {
    q: "What happens if an item is out of stock?",
    a: "Our staff will let you know on WhatsApp when they confirm your order, and can suggest an alternative or adjust your total. Stock shown on the site is kept up to date by each branch.",
  },
  {
    q: "How fast is delivery?",
    a: "It depends on your area and the branch, but many orders are fulfilled the same day. Your branch will confirm the estimated timing on WhatsApp.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-6 sm:px-6 sm:py-10">
      <PageHero
        eyebrow="❓ Help Center"
        title="Frequently asked questions"
        subtitle="Everything you need to know about ordering from Pinoy Mart."
      />

      <section className="space-y-3">
        {faqs.map((item, i) => (
          <details
            key={i}
            className="group rounded-2xl border border-border bg-card p-5 shadow-sm [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold">
              {item.q}
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {item.a}
            </p>
          </details>
        ))}
      </section>

      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <h2 className="text-lg font-bold">Still have a question?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Reach your nearest branch directly on WhatsApp.
          </p>
        </div>
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <Link href="/contact">
            Contact us <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
