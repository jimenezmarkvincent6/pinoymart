/**
 * Server-side category reads from Firestore.
 */
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import { COL, type CategoryDoc } from "@/lib/firebase/schema";
import type { Category } from "@/types";

function toCategory(data: CategoryDoc): Category & { sortOrder?: number } {
  return {
    slug: data.slug,
    name: data.name,
    emoji: data.emoji,
    description: data.description,
    sortOrder: data.sortOrder,
  };
}

export async function getCategories(): Promise<(Category & { sortOrder?: number })[]> {
  const q = query(collection(firebaseDb(), COL.categories), orderBy("sortOrder"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toCategory(d.data() as CategoryDoc));
}

export async function getCategoryBySlug(
  slug: string
): Promise<(Category & { sortOrder?: number }) | null> {
  const snap = await getDoc(doc(firebaseDb(), COL.categories, slug));
  if (!snap.exists()) return null;
  return toCategory(snap.data() as CategoryDoc);
}
