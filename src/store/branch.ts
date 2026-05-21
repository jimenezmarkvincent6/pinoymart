"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  branches,
  DEFAULT_BRANCH_ID,
  getBranchById,
  type Branch,
} from "@/data/branches";

interface BranchState {
  /** Selected branch id. */
  branchId: string;
  /** True once the user (or geolocation) has explicitly set the branch. */
  isAutoDetected: boolean;
  /** True after Zustand persist rehydration on the client. */
  hydrated: boolean;
  /** True once we've shown (and dismissed) the location banner. */
  bannerDismissed: boolean;

  setHydrated: () => void;
  setBranch: (id: string, opts?: { autoDetected?: boolean }) => void;
  dismissBanner: () => void;
}

export const useBranch = create<BranchState>()(
  persist(
    (set) => ({
      branchId: DEFAULT_BRANCH_ID,
      isAutoDetected: false,
      hydrated: false,
      bannerDismissed: false,
      setHydrated: () => set({ hydrated: true }),
      setBranch: (id, opts) => {
        if (!getBranchById(id)) return;
        set({
          branchId: id,
          isAutoDetected: opts?.autoDetected ?? false,
          bannerDismissed: true,
        });
      },
      dismissBanner: () => set({ bannerDismissed: true }),
    }),
    {
      name: "pinoymart-branch",
      onRehydrateStorage: () => (state) => state?.setHydrated(),
      partialize: (state) => ({
        branchId: state.branchId,
        isAutoDetected: state.isAutoDetected,
        bannerDismissed: state.bannerDismissed,
      }),
    }
  )
);

/**
 * Convenience: get the currently selected Branch object, falling back
 * to the default if the stored id is somehow invalid.
 */
export function useActiveBranch(): Branch {
  const branchId = useBranch((s) => s.branchId);
  return getBranchById(branchId) ?? branches[0];
}
