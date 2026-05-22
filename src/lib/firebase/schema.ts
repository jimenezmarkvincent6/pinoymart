/**
 * Firestore collection names and shared shape definitions.
 *
 * Collection layout
 * ─────────────────
 *   categories/{categorySlug}          — Category docs (slug as ID)
 *   branches/{branchId}                — Branch docs
 *   products/{productId}               — Product docs (auto-id), stock per branch as map
 *   promos/{promoId}                   — Promo banners/discount entries
 *   orders/{orderId}                   — Captured WhatsApp orders
 *   admins/{uid}                       — Mirror of Firebase Auth users with admin role
 */

import type { CategorySlug } from "@/types";

// ── Collection names ────────────────────────────────────────────────────────
export const COL = {
  categories: "categories",
  branches: "branches",
  products: "products",
  promos: "promos",
  orders: "orders",
  admins: "admins",
  settings: "settings",
} as const;

// ── Document shapes (Firestore-native) ──────────────────────────────────────

export interface CategoryDoc {
  slug: CategorySlug;
  name: string;
  emoji: string;
  description: string;
  sortOrder?: number;
}

export interface BranchDoc {
  id: string;
  name: string;
  fullName: string;
  emirate: string;
  address: string;
  lat: number;
  lng: number;
  whatsappNumber: string;
  deliveryArea: string;
  hours: string;
  isMain?: boolean;
}

/**
 * Stock per branch lives inline as a map for cheap reads:
 *   stock: { karama: 50, sharjah: 30, "abu-dhabi": 20 }
 * Each product doc carries its own per-branch availability.
 */
export interface ProductDoc {
  slug: string;
  name: string;
  brand?: string;
  description: string;
  price: number;
  oldPrice?: number;
  unit: string;
  /** Either a Storage URL for a real image, or an emoji used by ProductImage placeholder. */
  image: string;
  category: CategorySlug;
  stock: Record<string, number>; // branchId -> units
  rating?: number;
  tags?: string[];
  featured?: boolean;
  createdAt: number; // ms epoch
  updatedAt: number; // ms epoch
}

/**
 * The homepage promo banner. Stored at `promos/homepage-banner` (singleton).
 * Product-level promos (discount markdowns) live on the product doc itself
 * via `oldPrice` and the `promo` tag.
 */
export interface PromoBannerDoc {
  /** e.g. "🔥 Weekly Promo" — small label above the headline. */
  eyebrow: string;
  /** Main headline, e.g. "Sulit Sunday — up to 20% off." */
  title: string;
  /** One-line supporting copy. */
  description: string;
  /** CTA button label, e.g. "See all promos". */
  ctaLabel: string;
  /** CTA href, e.g. "/products?promo=1". */
  ctaHref: string;
  /** When false, homepage falls back to no banner. */
  active: boolean;
  updatedAt: number;
}

export const HOMEPAGE_BANNER_ID = "homepage-banner";

/**
 * Store-wide settings. Stored at `settings/site` (singleton).
 * Branch-specific contact details live on each branch doc; these are the
 * store-level defaults + marketing copy + social links.
 */
export interface SiteSettingsDoc {
  supportEmail: string;
  /** Fallback WhatsApp (E.164 digits) for the hero "Chat us" button. */
  defaultWhatsappNumber: string;
  /** Marketing line shown under the hero CTAs. */
  deliveryFeeNote: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  updatedAt: number;
}

export const SITE_SETTINGS_ID = "site";

/** Document body for an order. Firestore manages the `id` separately —
 *  consumers should use `doc.id` (combined as `OrderDoc & { id: string }`). */
export interface OrderDoc {
  branchId: string;
  branchName: string;
  fulfillment: "pickup" | "delivery";
  customerName: string;
  customerContact: string;
  deliveryLocation?: string;
  notes?: string;
  items: Array<{
    productId: string;
    productSlug: string;
    name: string;
    unit: string;
    quantity: number;
    price: number;
    lineTotal: number;
  }>;
  subtotal: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  whatsappLink: string;
  createdAt: number;
  updatedAt: number;
}

export interface AdminDoc {
  uid: string;
  email: string;
  displayName?: string;
  /** Phase 2: "super" only. Phase 3 may add "branch-manager" + branchId. */
  role: "super";
  createdAt: number;
}
