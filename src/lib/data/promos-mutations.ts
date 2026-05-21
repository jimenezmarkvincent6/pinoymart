"use client";

import { doc, setDoc } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import {
  COL,
  HOMEPAGE_BANNER_ID,
  type PromoBannerDoc,
} from "@/lib/firebase/schema";

export interface PromoBannerInput {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
}

export async function saveHomepageBanner(input: PromoBannerInput) {
  const data: PromoBannerDoc = {
    eyebrow: input.eyebrow,
    title: input.title,
    description: input.description,
    ctaLabel: input.ctaLabel,
    ctaHref: input.ctaHref,
    active: input.active,
    updatedAt: Date.now(),
  };
  await setDoc(doc(firebaseDb(), COL.promos, HOMEPAGE_BANNER_ID), data);
}
