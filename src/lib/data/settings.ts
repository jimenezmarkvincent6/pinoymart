/**
 * Server-side site settings read from Firestore, with fallback to the
 * compile-time constants so the storefront always has sensible defaults.
 */
import { doc, getDoc } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import {
  COL,
  SITE_SETTINGS_ID,
  type SiteSettingsDoc,
} from "@/lib/firebase/schema";
import { SITE } from "@/lib/constants";

export type SiteSettings = Omit<SiteSettingsDoc, "updatedAt">;

export const DEFAULT_SETTINGS: SiteSettings = {
  supportEmail: SITE.supportEmail,
  defaultWhatsappNumber: SITE.whatsappNumber,
  deliveryFeeNote: SITE.deliveryFeeNote,
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(doc(firebaseDb(), COL.settings, SITE_SETTINGS_ID));
    if (!snap.exists()) return DEFAULT_SETTINGS;
    const data = snap.data() as SiteSettingsDoc;
    // Merge over defaults so missing fields don't render blank.
    return {
      supportEmail: data.supportEmail || DEFAULT_SETTINGS.supportEmail,
      defaultWhatsappNumber:
        data.defaultWhatsappNumber || DEFAULT_SETTINGS.defaultWhatsappNumber,
      deliveryFeeNote: data.deliveryFeeNote || DEFAULT_SETTINGS.deliveryFeeNote,
      facebookUrl: data.facebookUrl ?? "",
      instagramUrl: data.instagramUrl ?? "",
      tiktokUrl: data.tiktokUrl ?? "",
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
