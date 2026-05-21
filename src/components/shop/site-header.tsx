import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "./logo";
import { CartButton } from "./cart-button";
import { BranchPicker } from "./branch-picker";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/products?promo=1", label: "Promos" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[hsl(var(--brand-green-border))] bg-brand-green-gradient text-white shadow-[0_2px_20px_-8px_rgba(0,0,0,0.4)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
        <Logo variant="on-dark" showTagline={false} />

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/products"
            aria-label="Search products"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 sm:inline-flex lg:hidden"
          >
            <Search className="h-4 w-4" />
          </Link>
          <Link
            href="/products"
            className="hidden h-10 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-sm text-white/85 transition-colors hover:bg-white/20 hover:text-white lg:inline-flex"
          >
            <Search className="h-4 w-4" />
            Search products…
          </Link>
          <BranchPicker variant="on-dark" />
          {/* On mobile the bottom nav carries the cart icon, so hide it here */}
          <CartButton variant="on-dark" className="hidden md:inline-flex" />
        </div>
      </div>
    </header>
  );
}
