"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import { COL, type CategoryDoc } from "@/lib/firebase/schema";

export interface CategoryWriteInput {
  slug: string;
  name: string;
  emoji: string;
  description: string;
  sortOrder?: number;
}

function clean<T extends Record<string, unknown>>(obj: T): T {
  const out = {} as T;
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

export async function upsertCategory(input: CategoryWriteInput) {
  const data: CategoryDoc = clean({
    slug: input.slug,
    name: input.name,
    emoji: input.emoji,
    description: input.description,
    sortOrder: input.sortOrder,
  });
  await setDoc(doc(firebaseDb(), COL.categories, input.slug), data);
}

/**
 * Deleting a category leaves products that referenced it dangling — the
 * category dropdown on the storefront just won't list them under any category.
 * Callers should check for in-use categories before allowing delete.
 */
export async function deleteCategory(slug: string) {
  await deleteDoc(doc(firebaseDb(), COL.categories, slug));
}

/** Returns the number of products currently tagged with this category. */
export async function countProductsInCategory(slug: string): Promise<number> {
  const snap = await getDocs(
    query(collection(firebaseDb(), COL.products), where("category", "==", slug))
  );
  return snap.size;
}

/** Reassign every product in `fromSlug` to `toSlug` in a single batch. */
export async function reassignProducts(fromSlug: string, toSlug: string) {
  const db = firebaseDb();
  const snap = await getDocs(
    query(collection(db, COL.products), where("category", "==", fromSlug))
  );
  if (snap.empty) return 0;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { category: toSlug }));
  await batch.commit();
  return snap.size;
}
