"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Loader2, MapPin, Navigation } from "lucide-react";
import { useBranch, useActiveBranch } from "@/store/branch";
import { branches } from "@/data/branches";
import { findNearestBranch, requestUserLocation, formatDistance } from "@/lib/geo";
import { cn } from "@/lib/utils";

interface BranchPickerProps {
  className?: string;
  variant?: "default" | "on-dark";
}

export function BranchPicker({ className, variant = "default" }: BranchPickerProps) {
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hydrated = useBranch((s) => s.hydrated);
  const setBranch = useBranch((s) => s.setBranch);
  const branch = useActiveBranch();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const detect = async () => {
    setError(null);
    setLocating(true);
    try {
      const coords = await requestUserLocation();
      const { branch } = findNearestBranch(coords);
      setBranch(branch.id, { autoDetected: true });
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof GeolocationPositionError && err.code === 1
          ? "Location permission denied. Pick a branch manually below."
          : "Couldn't get your location. Pick a branch manually below."
      );
    } finally {
      setLocating(false);
    }
  };

  const triggerStyle =
    variant === "on-dark"
      ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
      : "border-border bg-background text-foreground hover:bg-secondary";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Change branch"
        className={cn(
          "inline-flex h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors sm:h-10 sm:px-3",
          triggerStyle,
          className
        )}
      >
        <MapPin className="h-4 w-4" />
        <span className="hidden sm:inline">{hydrated ? branch.name : "Karama"}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-3 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold leading-tight">
                  Choose your nearest branch
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your order goes straight to that branch on WhatsApp.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={detect}
              disabled={locating}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
            >
              {locating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Finding nearest branch…
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" /> Use my current location
                </>
              )}
            </button>

            {error && (
              <p className="mt-2 text-center text-xs text-destructive">{error}</p>
            )}

            <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or pick manually
              <span className="h-px flex-1 bg-border" />
            </div>

            <ul className="max-h-72 space-y-1.5 overflow-auto pr-1">
              {branches.map((b) => {
                const active = b.id === branch.id;
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setBranch(b.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-start justify-between gap-3 rounded-xl border p-3 text-left transition-colors",
                        active
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30 hover:bg-secondary/50"
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {b.fullName.replace("Pinoy Mart – ", "")}
                          </span>
                          {b.isMain && (
                            <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              Main
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {b.address}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Delivers to: {b.deliveryArea}
                        </p>
                      </div>
                      {active && (
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

export function ActiveBranchDistance({ coords }: { coords?: { lat: number; lng: number } }) {
  const branch = useActiveBranch();
  if (!coords) return null;
  const km = Math.hypot(coords.lat - branch.lat, coords.lng - branch.lng);
  return <span>{formatDistance(km)}</span>;
}
