"use client";

/**
 * Client-side product mutations. Called from the admin UI after auth has
 * established a session — Firestore Security Rules verify the writer is a
 * super-admin via the /admins/{uid} doc.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import { COL, type ProductDoc } from "@/lib/firebase/schema";

export interface ProductWriteInput {
  id: string;                                 // doc id (also product id in app)
  slug: string;
  name: string;
  brand?: string;
  description: string;
  price: number;
  oldPrice?: number;
  unit: string;
  image: string;
  category: ProductDoc["category"];
  stock: Record<string, number>;
  rating?: number;
  tags: string[];
  featured: boolean;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out = {} as T;
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

/** Create or replace a product doc. `id` becomes the Firestore doc ID. */
export async function upsertProduct(input: ProductWriteInput, opts: { isNew: boolean }) {
  const now = Date.now();
  const data: Partial<ProductDoc> = stripUndefined({
    slug: input.slug,
    name: input.name,
    brand: input.brand,
    description: input.description,
    price: input.price,
    oldPrice: input.oldPrice,
    unit: input.unit,
    image: input.image,
    category: input.category,
    stock: input.stock,
    rating: input.rating,
    tags: input.tags,
    featured: input.featured,
    updatedAt: now,
    ...(opts.isNew ? { createdAt: now } : {}),
  });

  await setDoc(doc(firebaseDb(), COL.products, input.id), data, { merge: !opts.isNew });
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(firebaseDb(), COL.products, id));
}

/** Returns true if the slug is already taken by a different product. */
export async function isSlugTaken(slug: string, excludingId?: string): Promise<boolean> {
  const q = query(
    collection(firebaseDb(), COL.products),
    where("slug", "==", slug)
  );
  const snap = await getDocs(q);
  if (snap.empty) return false;
  if (!excludingId) return true;
  return snap.docs.some((d) => d.id !== excludingId);
}

/** Returns true if a product ID is already in use. */
export async function isIdTaken(id: string): Promise<boolean> {
  const snap = await getDocs(
    query(collection(firebaseDb(), COL.products), where("__name__", "==", id))
  );
  return !snap.empty;
}
