/**
 * Server-side promo banner read from Firestore.
 */
import { doc, getDoc } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import {
  COL,
  HOMEPAGE_BANNER_ID,
  type PromoBannerDoc,
} from "@/lib/firebase/schema";

export const DEFAULT_HOMEPAGE_BANNER: PromoBannerDoc = {
  eyebrow: "🔥 Weekly Promo",
  title: "Sulit Sunday — up to 20% off.",
  description: "Hand-picked deals on the brands you love. Refreshed every Sunday.",
  ctaLabel: "See all promos",
  ctaHref: "/products?promo=1",
  active: true,
  updatedAt: 0,
};

export async function getHomepageBanner(): Promise<PromoBannerDoc | null> {
  const snap = await getDoc(doc(firebaseDb(), COL.promos, HOMEPAGE_BANNER_ID));
  if (!snap.exists()) return null;
  return snap.data() as PromoBannerDoc;
}
