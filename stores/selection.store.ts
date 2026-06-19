import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AnalysisLens } from "@/types/workspace";

interface SelectionState {
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  selectedCampaignId: string | null;
  setSelectedCampaignId: (id: string | null) => void;
  analysisLens: AnalysisLens;
  setAnalysisLens: (lens: AnalysisLens) => void;
  strategyExtraColumns: Record<AnalysisLens, string[]>;
  setStrategyExtraColumn: (
    lens: AnalysisLens,
    columnId: string,
    checked: boolean,
  ) => void;
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
          selectedCampaignId: null,
        }),
      selectedProjectId: null,
      setSelectedProjectId: (id) =>
        set({
          selectedProjectId: id,
          selectedCampaignId: null,
        }),
      selectedCampaignId: null,
      setSelectedCampaignId: (id) => set({ selectedCampaignId: id }),
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
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "unilyse-selection",
      partialize: (state) => ({
        selectedClientId: state.selectedClientId,
        selectedProjectId: state.selectedProjectId,
        selectedCampaignId: state.selectedCampaignId,
        analysisLens: state.analysisLens,
        strategyExtraColumns: state.strategyExtraColumns,
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
