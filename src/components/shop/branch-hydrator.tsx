"use client";

import { useEffect } from "react";
import { useBranch } from "@/store/branch";

export function BranchHydrator() {
  const setHydrated = useBranch((s) => s.setHydrated);
  useEffect(() => {
    setHydrated();
  }, [setHydrated]);
  return null;
}
