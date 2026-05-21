"use client";

import { Clock, MapPin, MessageCircle } from "lucide-react";
import { useActiveBranch, useBranch } from "@/store/branch";

export function FooterBranchInfo() {
  const branch = useActiveBranch();
  const hydrated = useBranch((s) => s.hydrated);

  // Show static default until hydration to avoid layout flicker
  if (!hydrated) {
    return (
      <div className="mt-4 space-y-2 text-xs text-[hsl(var(--brand-dark-muted))]">
        <p className="inline-flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" />
          Multiple branches across the UAE
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2 text-xs text-[hsl(var(--brand-dark-muted))]">
      <p className="inline-flex items-center gap-2">
        <MapPin className="h-3.5 w-3.5 text-[hsl(var(--brand-green-bright))]" />
        <span>
          <span className="font-semibold text-white">{branch.name} branch</span> ·{" "}
          {branch.address}
        </span>
      </p>
      <p className="inline-flex items-center gap-2">
        <Clock className="h-3.5 w-3.5" />
        {branch.hours}
      </p>
      <p className="inline-flex items-center gap-2">
        <MessageCircle className="h-3.5 w-3.5" />
        WhatsApp +{branch.whatsappNumber}
      </p>
    </div>
  );
}
