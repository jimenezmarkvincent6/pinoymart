"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Loader2,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteBranch } from "@/lib/data/branches-mutations";
import type { Branch } from "@/data/branches";

export function BranchesListView({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const target = confirmDeleteId
    ? branches.find((b) => b.id === confirmDeleteId)
    : null;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteBranch(id);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Couldn't delete branch.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Branches</h1>
          <p className="text-sm text-muted-foreground">
            {branches.length} {branches.length === 1 ? "location" : "locations"} ·
            customers are routed by nearest branch.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/admin/branches/new">
            <Plus className="h-4 w-4" />
            Add branch
          </Link>
        </Button>
      </div>

      {branches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No branches yet. Add your first one to start receiving orders.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {branches.map((b) => (
            <li
              key={b.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-semibold">
                      {b.name}
                    </h3>
                    {b.isMain && (
                      <Badge variant="soft" className="text-[10px]">
                        <Star className="h-3 w-3" /> Main
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {b.emirate} · ID: <code className="font-mono">{b.id}</code>
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{b.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-3.5 w-3.5 shrink-0 text-[#25D366]" />
                  <span>+{b.whatsappNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{b.hours}</span>
                </div>
                <div className="text-[11px]">
                  <span className="font-medium text-foreground">Delivers to:</span>{" "}
                  {b.deliveryArea}
                </div>
              </div>

              <div className="mt-auto flex gap-2 pt-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-full"
                >
                  <Link href={`/admin/branches/${b.id}`}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
                <button
                  onClick={() => setConfirmDeleteId(b.id)}
                  aria-label="Delete branch"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {target && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-3 backdrop-blur-sm sm:items-center"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-destructive/15 text-destructive">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold leading-tight">
                  Delete this branch?
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {target.name}
                  </span>{" "}
                  will be removed. Customers currently routed to this branch
                  will fall back to the default.
                </p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setConfirmDeleteId(null)}
                disabled={!!deletingId}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 rounded-full"
                onClick={() => handleDelete(target.id)}
                disabled={!!deletingId}
              >
                {deletingId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" /> Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
