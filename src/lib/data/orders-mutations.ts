"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import { COL, type OrderDoc } from "@/lib/firebase/schema";

export type OrderStatus = OrderDoc["status"];

export interface CreateOrderInput {
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
  whatsappLink: string;
}

function clean<T extends Record<string, unknown>>(obj: T): T {
  const out = {} as T;
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== "") (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

/**
 * Anyone (no auth required) can create an order — Security Rules enforce
 * the document shape + that status starts as "pending".
 * Returns the new Firestore doc ID.
 */
export async function createOrder(input: CreateOrderInput): Promise<string> {
  const now = Date.now();
  const payload = clean({
    branchId: input.branchId,
    branchName: input.branchName,
    fulfillment: input.fulfillment,
    customerName: input.customerName,
    customerContact: input.customerContact,
    deliveryLocation: input.deliveryLocation,
    notes: input.notes,
    items: input.items,
    subtotal: Number(input.subtotal.toFixed(2)),
    status: "pending" as const,
    whatsappLink: input.whatsappLink,
    createdAt: now,
  });
  const ref = await addDoc(collection(firebaseDb(), COL.orders), payload);
  return ref.id;
}

/** Admin-only — Security Rules enforce isSuperAdmin(). */
export async function updateOrderStatus(id: string, status: OrderStatus) {
  await updateDoc(doc(firebaseDb(), COL.orders, id), {
    status,
    updatedAt: Date.now(),
  });
}

/** Admin-only. */
export async function deleteOrder(id: string) {
  await deleteDoc(doc(firebaseDb(), COL.orders, id));
}
