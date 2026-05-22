import Link from "next/link";
import { Mail } from "lucide-react";
import { SITE } from "@/lib/constants";
import { getSiteSettings } from "@/lib/data/settings";
import { Logo } from "./logo";
import { FacebookIcon, InstagramIcon, TiktokIcon } from "./social-icons";
import { FooterBranchInfo } from "./footer-branch-info";

const groups = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All products" },
      { href: "/products?promo=1", label: "Weekly promos" },
      { href: "/products?cat=filipino-favorites", label: "Filipino favorites" },
      { href: "/products?cat=frozen-foods", label: "Frozen foods" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/delivery", label: "Delivery info" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Business",
    links: [
      { href: "/admin", label: "Admin panel" },
      { href: "/about", label: "About Pinoy Mart" },
    ],
  },
];

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const socials = [
    { href: settings.facebookUrl, label: "Facebook", Icon: FacebookIcon },
    { href: settings.instagramUrl, label: "Instagram", Icon: InstagramIcon },
    { href: settings.tiktokUrl, label: "TikTok", Icon: TiktokIcon },
  ];

  return (
    <footer className="mt-20 border-t border-[hsl(var(--brand-dark-border))] bg-[hsl(var(--brand-dark))] text-[hsl(var(--brand-dark-foreground))] pb-24 md:pb-12">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo variant="on-dark" />
          <p className="mt-4 max-w-sm text-sm text-[hsl(var(--brand-dark-muted))]">
            {SITE.description}
          </p>
          <FooterBranchInfo />
          <a
            href={`mailto:${settings.supportEmail}`}
            className="mt-2 inline-flex items-center gap-2 text-xs text-[hsl(var(--brand-dark-muted))] transition-colors hover:text-white"
          >
            <Mail className="h-3.5 w-3.5" />
            {settings.supportEmail}
          </a>

          <div className="mt-5 flex gap-2">
            {socials.map(({ href, label, Icon }) =>
              href ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/15"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ) : (
                <span
                  key={label}
                  aria-label={`${label} (not set)`}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/5 bg-white/[0.03] text-white/30"
                >
                  <Icon className="h-4 w-4" />
                </span>
              )
            )}
          </div>
        </div>

        {groups.map((g) => (
          <div key={g.title}>
            <div className="text-sm font-semibold text-white">{g.title}</div>
            <ul className="mt-3 space-y-2 text-sm">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[hsl(var(--brand-dark-muted))] transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[hsl(var(--brand-dark-border))]">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-2 px-4 py-6 text-xs text-[hsl(var(--brand-dark-muted))] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Built with Next.js · Tailwind · Firebase</p>
        </div>
      </div>
    </footer>
  );
}
