"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  Boxes,
  CheckCircle2,
  Clock3,
  Inbox,
  Loader2,
  MessageCircle,
  Package,
  ReceiptText,
  ShoppingCart,
  Store,
  Truck,
} from "lucide-react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/stat-card";
import { firebaseDb } from "@/lib/firebase/client";
import { useAuth } from "@/lib/firebase/auth-context";
import { COL, type OrderDoc } from "@/lib/firebase/schema";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

type OrderWithId = OrderDoc & { id: string };

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function startOfTodayLocal(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfYesterdayLocal(): number {
  return startOfTodayLocal() - 24 * 60 * 60 * 1000;
}

const statusBadge: Record<
  OrderDoc["status"],
  { label: string; variant: "soft" | "secondary" | "success" | "destructive" }
> = {
  pending: { label: "Pending", variant: "soft" },
  confirmed: { label: "Confirmed", variant: "secondary" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

export function DashboardView({ products }: { products: Product[] }) {
  const { ready, isSuperAdmin, user } = useAuth();
  const [orders, setOrders] = useState<OrderWithId[] | null>(null);

  useEffect(() => {
    if (!ready || !isSuperAdmin) return;
    const q = query(
      collection(firebaseDb(), COL.orders),
      orderBy("createdAt", "desc"),
      limit(500)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setOrders(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as OrderDoc) }))
        );
      },
      (err) => {
        console.error("Dashboard onSnapshot error:", err);
        setOrders([]);
      }
    );
    return () => unsub();
  }, [ready, isSuperAdmin]);

  const stats = useMemo(() => {
    const todayMs = startOfTodayLocal();
    const yesterdayMs = startOfYesterdayLocal();
    const all = orders ?? [];

    const today = all.filter((o) => o.createdAt >= todayMs);
    const yesterday = all.filter(
      (o) => o.createdAt >= yesterdayMs && o.createdAt < todayMs
    );

    const ordersToday = today.length;
    const salesToday = today.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const aovToday = ordersToday > 0 ? salesToday / ordersToday : 0;
    const pending = all.filter((o) => o.status === "pending").length;

    const deltaPct = (current: number, prev: number): number | undefined => {
      if (prev === 0) return undefined;
      return ((current - prev) / prev) * 100;
    };

    return {
      ordersToday,
      salesToday,
      aovToday,
      pending,
      ordersDelta: deltaPct(ordersToday, yesterday.length),
      salesDelta: deltaPct(
        salesToday,
        yesterday.reduce((s, o) => s + (o.subtotal || 0), 0)
      ),
      statusCounts: {
        pending: all.filter((o) => o.status === "pending").length,
        confirmed: all.filter((o) => o.status === "confirmed").length,
        completed: all.filter((o) => o.status === "completed").length,
        cancelled: all.filter((o) => o.status === "cancelled").length,
      },
      recent: all.slice(0, 6),
    };
  }, [orders]);

  const productStats = useMemo(() => {
    const featured = products
      .filter((p) => p.featured || p.tags?.includes("bestseller"))
      .slice(0, 5);
    const lowStock = products
      .filter((p) => p.stock <= 20)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);
    return { featured, lowStock };
  }, [products]);

  const loadingOrders = orders === null;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const adminName = user?.displayName || user?.email?.split("@")[0] || "Manager";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold capitalize">
            {greeting}, {adminName} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Here's how Pinoy Mart is doing today.
          </p>
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs",
            loadingOrders
              ? "bg-secondary text-muted-foreground"
              : "bg-primary/10 text-primary"
          )}
        >
          {loadingOrders ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading…
            </>
          ) : (
            <>
              <span className="relative grid h-2 w-2 place-items-center">
                <span className="absolute h-2 w-2 animate-ping rounded-full bg-primary opacity-50" />
                <span className="h-2 w-2 rounded-full bg-primary" />
              </span>
              Live · {orders?.length ?? 0} order{orders?.length === 1 ? "" : "s"} synced
            </>
          )}
        </div>
      </div>

      {/* Stat row */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ReceiptText}
          label="Orders today"
          value={loadingOrders ? "—" : `${stats.ordersToday}`}
          delta={loadingOrders ? undefined : stats.ordersDelta}
          tone="primary"
        />
        <StatCard
          icon={Banknote}
          label="Sales today"
          value={loadingOrders ? "—" : formatPrice(stats.salesToday)}
          delta={loadingOrders ? undefined : stats.salesDelta}
          tone="success"
        />
        <StatCard
          icon={ShoppingCart}
          label="Avg. order value"
          value={loadingOrders ? "—" : formatPrice(stats.aovToday)}
          tone="accent"
        />
        <StatCard
          icon={Clock3}
          label="Pending"
          value={loadingOrders ? "—" : `${stats.pending}`}
          tone="default"
        />
      </section>

      {/* Status breakdown */}
      {!loadingOrders && (orders?.length ?? 0) > 0 && (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatusTile
            label="Pending"
            count={stats.statusCounts.pending}
            tone="soft"
          />
          <StatusTile
            label="Confirmed"
            count={stats.statusCounts.confirmed}
            tone="secondary"
          />
          <StatusTile
            label="Completed"
            count={stats.statusCounts.completed}
            tone="success"
          />
          <StatusTile
            label="Cancelled"
            count={stats.statusCounts.cancelled}
            tone="destructive"
          />
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <section className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-semibold">Recent WhatsApp orders</h2>
              <p className="text-xs text-muted-foreground">
                Live feed of the latest incoming orders.
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all →
            </Link>
          </div>

          {loadingOrders ? (
            <div className="grid place-items-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : stats.recent.length === 0 ? (
            <div className="grid place-items-center py-12 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground/60" />
              <p className="mt-3 text-sm font-medium">No orders yet</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Once customers place orders via WhatsApp, they'll appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {stats.recent.map((o) => {
                const badge = statusBadge[o.status];
                const itemCount = (o.items ?? []).reduce(
                  (s, i) => s + i.quantity,
                  0
                );
                return (
                  <li
                    key={o.id}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <div
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                        o.fulfillment === "pickup"
                          ? "bg-primary/15 text-primary"
                          : "bg-accent/15 text-accent"
                      )}
                    >
                      {o.fulfillment === "pickup" ? (
                        <Store className="h-3.5 w-3.5" />
                      ) : (
                        <Truck className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {o.customerName}
                        </span>
                        <Badge variant={badge.variant} className="text-[10px]">
                          {badge.label}
                        </Badge>
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {itemCount} item{itemCount === 1 ? "" : "s"} ·{" "}
                        {o.branchName} · {relativeTime(o.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold tabular-nums">
                        {formatPrice(o.subtotal)}
                      </div>
                      {o.customerContact && (
                        <a
                          href={`https://wa.me/${o.customerContact.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#25D366] hover:underline"
                        >
                          <MessageCircle className="h-3 w-3" /> Reply
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="space-y-6">
          {/* Top products */}
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">Top products</h2>
              <Boxes className="h-4 w-4 text-muted-foreground" />
            </div>
            {productStats.featured.length === 0 ? (
              <div className="px-5 py-6 text-xs text-muted-foreground">
                Mark products as Featured in /admin/products to see them here.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {productStats.featured.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 px-5 py-3 text-sm"
                  >
                    <span aria-hidden className="text-xl">
                      {p.image}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatPrice(p.price)} · {p.unit}
                      </div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Low stock */}
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">Low stock</h2>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            {productStats.lowStock.length === 0 ? (
              <div className="px-5 py-6 text-xs text-muted-foreground">
                All stock levels look healthy.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {productStats.lowStock.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 px-5 py-3 text-sm"
                  >
                    <span aria-hidden className="text-xl">
                      {p.image}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="truncate font-medium hover:underline"
                      >
                        {p.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {p.stock} units across all branches
                      </div>
                    </div>
                    <Badge variant="destructive" className="text-[10px]">
                      Low
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusTile({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "soft" | "secondary" | "success" | "destructive";
}) {
  const colors = {
    soft: "bg-primary/10 text-primary",
    secondary: "bg-secondary text-foreground",
    success: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]",
    destructive: "bg-destructive/15 text-destructive",
  }[tone];
  return (
    <div className={cn("rounded-xl border border-border bg-card p-3 text-center")}>
      <div className={cn("inline-flex h-7 items-center justify-center rounded-full px-2 text-[10px] font-bold uppercase tracking-wider", colors)}>
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-bold tabular-nums">{count}</div>
    </div>
  );
}
