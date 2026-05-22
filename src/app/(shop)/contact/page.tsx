import { Clock, Mail, MapPin, MessageCircle, Star } from "lucide-react";
import { PageHero } from "@/components/shop/page-hero";
import { Badge } from "@/components/ui/badge";
import { getBranches } from "@/lib/data/branches";
import { getSiteSettings } from "@/lib/data/settings";

export const revalidate = 60;

export const metadata = {
  title: "Contact",
  description:
    "Get in touch with Pinoy Mart. Find your nearest branch, WhatsApp numbers, addresses, and opening hours across the UAE.",
};

export default async function ContactPage() {
  const [branches, settings] = await Promise.all([
    getBranches(),
    getSiteSettings(),
  ]);

  // Main branch first, then the rest.
  const sorted = [...branches].sort(
    (a, b) => Number(b.isMain ?? false) - Number(a.isMain ?? false)
  );

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-6 sm:px-6 sm:py-10">
      <PageHero
        eyebrow="📍 Get in touch"
        title="Contact Pinoy Mart"
        subtitle="Reach out to your nearest branch on WhatsApp, or email us — we're always happy to help our kababayan."
      />

      {settings.supportEmail && (
        <a
          href={`mailto:${settings.supportEmail}`}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              General inquiries
            </div>
            <div className="text-sm font-medium">{settings.supportEmail}</div>
          </div>
        </a>
      )}

      <section>
        <h2 className="text-xl font-bold">Our branches</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {branches.length} locations across the UAE. Tap a number to message
          that branch directly on WhatsApp.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {sorted.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">{b.name}</h3>
                {b.isMain && (
                  <Badge variant="soft" className="text-[10px]">
                    <Star className="h-3 w-3" /> Main
                  </Badge>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {b.emirate}
                </span>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {b.address}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0" />
                  {b.hours}
                </p>
                <p className="text-xs">
                  <span className="font-medium text-foreground">
                    Delivers to:
                  </span>{" "}
                  {b.deliveryArea}
                </p>
              </div>

              <a
                href={`https://wa.me/${b.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
              >
                <MessageCircle className="h-4 w-4" />
                Message {b.name} on WhatsApp
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
