"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Store,
  Truck,
  XCircle,
  CheckCheck,
  Undo2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  deleteOrder,
  updateOrderStatus,
  type OrderStatus,
} from "@/lib/data/orders-mutations";
import type { OrderDoc } from "@/lib/firebase/schema";

type OrderWithId = OrderDoc & { id: string };

const statusBadge: Record<
  OrderStatus,
  { label: string; variant: "soft" | "secondary" | "success" | "destructive" }
> = {
  pending: { label: "Pending", variant: "soft" },
  confirmed: { label: "Confirmed", variant: "secondary" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

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

export function OrderCard({ order }: { order: OrderWithId }) {
  const [expanded, setExpanded] = useState(order.status === "pending");
  const [busy, setBusy] = useState<OrderStatus | "delete" | null>(null);

  const badge = statusBadge[order.status];
  const items = order.items ?? [];
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const setStatus = async (s: OrderStatus) => {
    setBusy(s);
    try {
      await updateOrderStatus(order.id, s);
    } catch (err) {
      console.error(err);
      alert("Couldn't update status. Check the console.");
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!confirm("Permanently delete this order? This can't be undone.")) return;
    setBusy("delete");
    try {
      await deleteOrder(order.id);
    } catch (err) {
      console.error(err);
      alert("Couldn't delete order.");
      setBusy(null);
    }
  };

  const whatsappPhone = order.customerContact.replace(/[^0-9]/g, "");
  const whatsappReply = whatsappPhone
    ? `https://wa.me/${whatsappPhone}`
    : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Summary row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-secondary/30"
      >
        <div
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-full",
            order.fulfillment === "pickup"
              ? "bg-primary/15 text-primary"
              : "bg-accent/15 text-accent"
          )}
        >
          {order.fulfillment === "pickup" ? (
            <Store className="h-4 w-4" />
          ) : (
            <Truck className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{order.customerName}</span>
            <Badge variant={badge.variant} className="text-[10px]">
              {badge.label}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              · {order.fulfillment === "pickup" ? "Pickup" : "Delivery"} ·{" "}
              {order.branchName}
            </span>
          </div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">
            {itemCount} item{itemCount === 1 ? "" : "s"} · #{order.id.slice(0, 6)} · {relativeTime(order.createdAt)}
          </div>
        </div>

        <div className="text-right">
          <div className="text-base font-bold tabular-nums">
            {formatPrice(order.subtotal)}
          </div>
          <div className="mt-0.5 inline-flex items-center text-[11px] text-muted-foreground">
            {expanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border bg-secondary/20 p-4">
          {/* Customer + delivery info */}
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Customer" value={order.customerName} />
            <Info
              label="Contact"
              value={
                whatsappReply ? (
                  <a
                    href={whatsappReply}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-foreground hover:text-[#25D366] hover:underline"
                  >
                    <Phone className="h-3 w-3" />
                    {order.customerContact}
                  </a>
                ) : (
                  order.customerContact
                )
              }
            />
            {order.fulfillment === "delivery" && order.deliveryLocation && (
              <Info
                className="sm:col-span-2"
                label="Delivery location"
                value={
                  <span className="inline-flex items-start gap-1">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                    {order.deliveryLocation}
                  </span>
                }
              />
            )}
            {order.fulfillment === "pickup" && (
              <Info
                className="sm:col-span-2"
                label="Pickup branch"
                value={`${order.branchName}`}
              />
            )}
            {order.notes && (
              <Info className="sm:col-span-2" label="Notes" value={order.notes} />
            )}
          </div>

          {/* Items list */}
          <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
            <div className="border-b border-border bg-secondary/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Items
            </div>
            <ul className="divide-y divide-border text-sm">
              {items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{item.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {item.unit} · {formatPrice(item.price)} × {item.quantity}
                    </div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums">
                    {formatPrice(item.lineTotal)}
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-border bg-secondary/40 px-3 py-2 text-sm">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold tabular-nums">
                {formatPrice(order.subtotal)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            {whatsappReply && (
              <a
                href={whatsappReply}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Reply on WhatsApp
              </a>
            )}

            {order.status === "pending" && (
              <>
                <StatusButton
                  onClick={() => setStatus("confirmed")}
                  busy={busy === "confirmed"}
                  icon={CheckCircle2}
                  label="Confirm"
                  tone="primary"
                />
                <StatusButton
                  onClick={() => setStatus("cancelled")}
                  busy={busy === "cancelled"}
                  icon={XCircle}
                  label="Cancel"
                  tone="destructive"
                />
              </>
            )}

            {order.status === "confirmed" && (
              <>
                <StatusButton
                  onClick={() => setStatus("completed")}
                  busy={busy === "completed"}
                  icon={CheckCheck}
                  label="Mark completed"
                  tone="primary"
                />
                <StatusButton
                  onClick={() => setStatus("cancelled")}
                  busy={busy === "cancelled"}
                  icon={XCircle}
                  label="Cancel"
                  tone="destructive"
                />
              </>
            )}

            {(order.status === "completed" || order.status === "cancelled") && (
              <StatusButton
                onClick={() => setStatus("pending")}
                busy={busy === "pending"}
                icon={Undo2}
                label="Reopen"
                tone="outline"
              />
            )}

            <button
              onClick={remove}
              disabled={busy !== null}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            >
              {busy === "delete" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusButton({
  onClick,
  busy,
  icon: Icon,
  label,
  tone,
}: {
  onClick: () => void;
  busy: boolean;
  icon: typeof CheckCircle2;
  label: string;
  tone: "primary" | "destructive" | "outline";
}) {
  const cls =
    tone === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : tone === "destructive"
      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      : "border border-border bg-background text-foreground hover:bg-secondary";
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold shadow-sm transition disabled:opacity-60",
        cls
      )}
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

function Info({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card px-3 py-2",
        className
      )}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm">{value}</div>
    </div>
  );
}
