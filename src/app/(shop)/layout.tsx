import { Suspense } from "react";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";
import { MobileBottomNav } from "@/components/shop/mobile-bottom-nav";
import { CartHydrator } from "@/components/shop/cart-hydrator";
import { BranchHydrator } from "@/components/shop/branch-hydrator";
import { LocationBanner } from "@/components/shop/location-banner";
import { MiniCartBar } from "@/components/shop/mini-cart-bar";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CartHydrator />
      <BranchHydrator />
      <SiteHeader />
      <LocationBanner />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <MiniCartBar />
      <SiteFooter />
      <Suspense fallback={null}>
        <MobileBottomNav />
      </Suspense>
    </>
  );
}
