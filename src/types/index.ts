/**
 * Category slugs are simple strings now — admin can create custom categories.
 * The seed data ships with a fixed set, but we don't lock TypeScript to those.
 */
export type CategorySlug = string;

export interface Category {
  slug: CategorySlug;
  name: string;
  emoji: string;
  description: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  description: string;
  price: number;          // AED
  oldPrice?: number;      // for promo display
  unit: string;           // e.g. "250g", "1L", "Pack of 6"
  image: string;          // image URL or local path
  category: CategorySlug;
  stock: number;
  rating?: number;
  tags?: string[];        // "new", "bestseller", "promo", "frozen"
  featured?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export type Fulfillment = "pickup" | "delivery";

export interface CheckoutInfo {
  fulfillment: Fulfillment;
  name: string;
  contact: string;            // UAE phone
  deliveryLocation?: string;  // required only when fulfillment === "delivery"
  notes?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerContact: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}
