"use client";

import { useSelectionStore } from "@/stores/selection.store";

/** Attend la réhydratation Zustand (localStorage) avant d'utiliser selectedClientId. */
export function useSelectionHydrated(): boolean {
  return useSelectionStore((s) => s.hasHydrated);
}
