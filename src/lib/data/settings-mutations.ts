"use client";

import { doc, setDoc } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import {
  COL,
  SITE_SETTINGS_ID,
  type SiteSettingsDoc,
} from "@/lib/firebase/schema";

export interface SiteSettingsInput {
  supportEmail: string;
  defaultWhatsappNumber: string;
  deliveryFeeNote: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
}

export async function saveSiteSettings(input: SiteSettingsInput) {
  const data: SiteSettingsDoc = {
    supportEmail: input.supportEmail.trim(),
    // Strip everything but digits so wa.me links stay valid.
    defaultWhatsappNumber: input.defaultWhatsappNumber.replace(/[^0-9]/g, ""),
    deliveryFeeNote: input.deliveryFeeNote.trim(),
    facebookUrl: input.facebookUrl.trim(),
    instagramUrl: input.instagramUrl.trim(),
    tiktokUrl: input.tiktokUrl.trim(),
    updatedAt: Date.now(),
  };
  await setDoc(doc(firebaseDb(), COL.settings, SITE_SETTINGS_ID), data);
}
