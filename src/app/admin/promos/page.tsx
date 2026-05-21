import { DEFAULT_HOMEPAGE_BANNER, getHomepageBanner } from "@/lib/data/promos";
import { PromoBannerForm } from "@/components/admin/promo-banner-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Promos · Admin",
};

export default async function AdminPromosPage() {
  const banner = (await getHomepageBanner()) ?? DEFAULT_HOMEPAGE_BANNER;
  return <PromoBannerForm initialBanner={banner} />;
}
