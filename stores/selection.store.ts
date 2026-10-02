import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PERFORMANCE_VISIBLE_COLUMNS } from "@/lib/performances/column-presets";

interface SelectionState {
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  /** Colonnes Performances visibles (`null` = défaut essentielles). */
  performanceVisibleColumns: string[] | null;
  setPerformanceVisibleColumn: (columnId: string, checked: boolean) => void;
  setPerformanceVisibleColumns: (columnIds: readonly string[]) => void;
  resetPerformanceVisibleColumns: () => void;
  /** Période analytics optionnelle (YYYY-MM-DD). */
  periodFrom: string | null;
  periodTo: string | null;
  setPeriod: (from: string | null, to: string | null) => void;
  /** Date de lecture des analyses reco (YYYY-MM-DD). */
  recommendationAsOfDate: string | null;
  setRecommendationAsOfDate: (date: string | null) => void;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
}

export const useSelectionStore = create<SelectionState>()(
  persist(
    (set) => ({
      selectedClientId: null,
      setSelectedClientId: (id) =>
        set({
          selectedClientId: id,
          selectedProjectId: null,
        }),
      selectedProjectId: null,
      setSelectedProjectId: (id) => set({ selectedProjectId: id }),
      performanceVisibleColumns: null,
      setPerformanceVisibleColumn: (columnId, checked) =>
        set((state) => {
          const current =
            state.performanceVisibleColumns ??
            [...DEFAULT_PERFORMANCE_VISIBLE_COLUMNS];
          const next = checked
            ? current.includes(columnId)
              ? current
              : [...current, columnId]
            : current.filter((id) => id !== columnId);
          return { performanceVisibleColumns: next };
        }),
      setPerformanceVisibleColumns: (columnIds) =>
        set({ performanceVisibleColumns: [...columnIds] }),
      resetPerformanceVisibleColumns: () =>
        set({ performanceVisibleColumns: null }),
      periodFrom: null,
      periodTo: null,
      setPeriod: (from, to) => set({ periodFrom: from, periodTo: to }),
      recommendationAsOfDate: null,
      setRecommendationAsOfDate: (date) =>
        set({ recommendationAsOfDate: date }),
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "unilyse-selection",
      partialize: (state) => ({
        selectedClientId: state.selectedClientId,
        selectedProjectId: state.selectedProjectId,
        performanceVisibleColumns: state.performanceVisibleColumns,
        periodFrom: state.periodFrom,
        periodTo: state.periodTo,
        recommendationAsOfDate: state.recommendationAsOfDate,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.performanceVisibleColumns === undefined) {
            state.performanceVisibleColumns = null;
          }
          state.setHasHydrated(true);
        }
      },
    },
  ),
);
