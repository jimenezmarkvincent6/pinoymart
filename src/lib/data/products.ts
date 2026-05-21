/**
 * Server-side product reads from Firestore.
 * Replaces the static `src/data/products.ts` for runtime use.
 * (That file is still imported by the seed script.)
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import { COL, type ProductDoc } from "@/lib/firebase/schema";
import type { Product } from "@/types";

function sumStock(stock: ProductDoc["stock"] | undefined): number {
  if (!stock) return 0;
  return Object.values(stock).reduce((sum, n) => sum + (Number(n) || 0), 0);
}

/**
 * Map a raw Firestore product doc back into the app's Product shape.
 * `stock` is summed across all branches for legacy single-number callers;
 * the per-branch map is preserved at `stockByBranch` for newer UIs.
 */
function toProduct(id: string, data: ProductDoc): Product & {
  stockByBranch?: Record<string, number>;
} {
  return {
    id,
    slug: data.slug,
    name: data.name,
    brand: data.brand,
    description: data.description,
    price: data.price,
    oldPrice: data.oldPrice,
    unit: data.unit,
    image: data.image,
    category: data.category,
    stock: sumStock(data.stock),
    rating: data.rating,
    tags: data.tags,
    featured: data.featured,
    stockByBranch: data.stock,
  };
}

export async function getProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(firebaseDb(), COL.products));
  return snap.docs.map((d) => toProduct(d.id, d.data() as ProductDoc));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const q = query(
    collection(firebaseDb(), COL.products),
    where("slug", "==", slug)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return toProduct(docSnap.id, docSnap.data() as ProductDoc);
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(firebaseDb(), COL.products, id));
  if (!snap.exists()) return null;
  return toProduct(snap.id, snap.data() as ProductDoc);
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const q = query(
    collection(firebaseDb(), COL.products),
    where("category", "==", slug)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toProduct(d.id, d.data() as ProductDoc));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const q = query(
    collection(firebaseDb(), COL.products),
    where("featured", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toProduct(d.id, d.data() as ProductDoc));
}

/**
 * Promo products = anything with `oldPrice` set OR a "promo" tag.
 * Firestore doesn't easily express OR queries, so we fetch all and filter.
 * Cheap given our catalog size.
 */
export async function getPromoProducts(): Promise<Product[]> {
  const all = await getProducts();
  return all.filter(
    (p) => Boolean(p.oldPrice) || (p.tags ?? []).includes("promo")
  );
}
