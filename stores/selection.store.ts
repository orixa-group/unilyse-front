import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AnalysisLens } from "@/types/workspace";

interface SelectionState {
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  analysisLens: AnalysisLens;
  setAnalysisLens: (lens: AnalysisLens) => void;
  strategyExtraColumns: Record<AnalysisLens, string[]>;
  setStrategyExtraColumn: (
    lens: AnalysisLens,
    columnId: string,
    checked: boolean,
  ) => void;
  /** Période analytics optionnelle (YYYY-MM-DD). */
  periodFrom: string | null;
  periodTo: string | null;
  setPeriod: (from: string | null, to: string | null) => void;
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
      analysisLens: "sea",
      setAnalysisLens: (lens) => set({ analysisLens: lens }),
      strategyExtraColumns: { sea: [], seo: [] },
      setStrategyExtraColumn: (lens, columnId, checked) =>
        set((state) => {
          const current = state.strategyExtraColumns[lens];
          const next = checked
            ? current.includes(columnId)
              ? current
              : [...current, columnId]
            : current.filter((id) => id !== columnId);
          return {
            strategyExtraColumns: {
              ...state.strategyExtraColumns,
              [lens]: next,
            },
          };
        }),
      periodFrom: null,
      periodTo: null,
      setPeriod: (from, to) => set({ periodFrom: from, periodTo: to }),
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "unilyse-selection",
      partialize: (state) => ({
        selectedClientId: state.selectedClientId,
        selectedProjectId: state.selectedProjectId,
        analysisLens: state.analysisLens,
        strategyExtraColumns: state.strategyExtraColumns,
        periodFrom: state.periodFrom,
        periodTo: state.periodTo,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const stored = state.analysisLens as string;
          if (stored === "hybrid" || (stored !== "sea" && stored !== "seo")) {
            state.setAnalysisLens("sea");
          }
          if (!state.strategyExtraColumns) {
            state.strategyExtraColumns = { sea: [], seo: [] };
          }
          state.setHasHydrated(true);
        }
      },
    },
  ),
);
