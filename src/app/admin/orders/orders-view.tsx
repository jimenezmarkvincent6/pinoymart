"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { Inbox, Loader2, RefreshCw } from "lucide-react";
import { firebaseDb } from "@/lib/firebase/client";
import { COL, type OrderDoc } from "@/lib/firebase/schema";
import { useAuth } from "@/lib/firebase/auth-context";
import type { Branch } from "@/data/branches";
import { OrderCard } from "@/components/admin/order-card";
import { cn } from "@/lib/utils";

type OrderWithId = OrderDoc & { id: string };

type StatusFilter = "all" | OrderDoc["status"];

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrdersView({ branches }: { branches: Branch[] }) {
  const { ready, isSuperAdmin } = useAuth();
  const [orders, setOrders] = useState<OrderWithId[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [branchFilter, setBranchFilter] = useState<string>("");

  useEffect(() => {
    if (!ready || !isSuperAdmin) return;

    const q = query(
      collection(firebaseDb(), COL.orders),
      orderBy("createdAt", "desc"),
      limit(200)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: OrderWithId[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as OrderDoc),
        }));
        setOrders(next);
        setError(null);
      },
      (err) => {
        console.error("Order snapshot error:", err);
        setError(err.message || "Failed to load orders.");
      }
    );

    return () => unsub();
  }, [ready, isSuperAdmin]);

  const filtered = useMemo(() => {
    if (!orders) return null;
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (branchFilter && o.branchId !== branchFilter) return false;
      return true;
    });
  }, [orders, statusFilter, branchFilter]);

  const statusCounts = useMemo(() => {
    if (!orders) return {} as Record<StatusFilter, number>;
    const counts: Record<string, number> = { all: orders.length };
    for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1;
    return counts as Record<StatusFilter, number>;
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Live feed — new orders appear automatically.
          </p>
        </div>
        {orders && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
            <span className="relative grid h-2 w-2 place-items-center">
              <span className="absolute h-2 w-2 animate-ping rounded-full bg-primary opacity-50" />
              <span className="h-2 w-2 rounded-full bg-primary" />
            </span>
            {orders.length} order{orders.length === 1 ? "" : "s"} · syncing
          </div>
        )}
      </div>

      {/* Status tabs */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
        {statusTabs.map((tab) => {
          const active = statusFilter === tab.value;
          const count = statusCounts[tab.value] ?? 0;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Branch filter */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Branch:
        </label>
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.emirate})
            </option>
          ))}
        </select>
      </div>

      {/* Loading / error / empty / list */}
      {!orders && !error && (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card p-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">
            Connecting to live feed…
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-semibold text-destructive">Connection error</p>
          <p className="mt-1 text-xs text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      )}

      {filtered && filtered.length === 0 && !error && (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-medium">No orders to show</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            {orders && orders.length > 0
              ? "Try adjusting the status or branch filter."
              : "When customers send orders via WhatsApp, they'll appear here in real time."}
          </p>
        </div>
      )}

      {filtered && filtered.length > 0 && (
        <ul className="space-y-3">
          {filtered.map((order) => (
            <li key={order.id}>
              <OrderCard order={order} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
