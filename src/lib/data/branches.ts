/**
 * Server-side branch reads from Firestore.
 */
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import { COL, type BranchDoc } from "@/lib/firebase/schema";
import type { Branch } from "@/data/branches";

function toBranch(data: BranchDoc): Branch {
  return {
    id: data.id,
    name: data.name,
    fullName: data.fullName,
    emirate: data.emirate,
    address: data.address,
    lat: data.lat,
    lng: data.lng,
    whatsappNumber: data.whatsappNumber,
    deliveryArea: data.deliveryArea,
    hours: data.hours,
    isMain: data.isMain,
  };
}

export async function getBranches(): Promise<Branch[]> {
  const snap = await getDocs(collection(firebaseDb(), COL.branches));
  return snap.docs.map((d) => toBranch(d.data() as BranchDoc));
}

export async function getBranchById(id: string): Promise<Branch | null> {
  const snap = await getDoc(doc(firebaseDb(), COL.branches, id));
  if (!snap.exists()) return null;
  return toBranch(snap.data() as BranchDoc);
}
