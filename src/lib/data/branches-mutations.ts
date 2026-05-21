"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import { COL, type BranchDoc } from "@/lib/firebase/schema";

export interface BranchWriteInput {
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
  isMain: boolean;
}

function clean<T extends Record<string, unknown>>(obj: T): T {
  const out = {} as T;
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

/**
 * Create or replace a branch.
 * When `isMain` is true, this also flips every OTHER branch's `isMain` flag
 * to false in the same batch — "main" is mutually exclusive.
 */
export async function upsertBranch(input: BranchWriteInput) {
  const db = firebaseDb();
  const data: BranchDoc = clean({
    id: input.id,
    name: input.name,
    fullName: input.fullName,
    emirate: input.emirate,
    address: input.address,
    lat: input.lat,
    lng: input.lng,
    whatsappNumber: input.whatsappNumber.replace(/[^0-9]/g, ""),
    deliveryArea: input.deliveryArea,
    hours: input.hours,
    isMain: input.isMain ? true : undefined,
  });

  if (input.isMain) {
    // Batch: unset isMain on all others, then set this one.
    const all = await getDocs(collection(db, COL.branches));
    const batch = writeBatch(db);
    all.docs.forEach((d) => {
      if (d.id !== input.id) {
        batch.update(d.ref, { isMain: false });
      }
    });
    batch.set(doc(db, COL.branches, input.id), data);
    await batch.commit();
  } else {
    await setDoc(doc(db, COL.branches, input.id), data);
  }
}

export async function deleteBranch(id: string) {
  await deleteDoc(doc(firebaseDb(), COL.branches, id));
}

export function isBranchIdTaken(id: string, existingIds: string[]): boolean {
  return existingIds.includes(id);
}
