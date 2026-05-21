"use client";

import { useState } from "react";
import { Loader2, MapPin, Navigation, X } from "lucide-react";
import { useBranch, useActiveBranch } from "@/store/branch";
import { findNearestBranch, requestUserLocation } from "@/lib/geo";

export function LocationBanner() {
  const hydrated = useBranch((s) => s.hydrated);
  const dismissed = useBranch((s) => s.bannerDismissed);
  const setBranch = useBranch((s) => s.setBranch);
  const dismiss = useBranch((s) => s.dismissBanner);
  const active = useActiveBranch();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!hydrated || dismissed) return null;

  const detect = async () => {
    setError(null);
    setBusy(true);
    try {
      const coords = await requestUserLocation();
      const { branch } = findNearestBranch(coords);
      setBranch(branch.id, { autoDetected: true });
    } catch {
      setError("Couldn't get your location. You can pick a branch manually.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-b border-primary/15 bg-primary/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2.5 text-sm sm:px-6">
        <span className="inline-flex items-center gap-2 font-medium text-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          Delivering from <span className="font-semibold">{active.name}</span> · Find your nearest branch?
        </span>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={detect}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Locating…
              </>
            ) : (
              <>
                <Navigation className="h-3.5 w-3.5" /> Use my location
              </>
            )}
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {error && (
          <p className="basis-full text-xs text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
}
