"use client";

import { useMemo } from "react";
import { useSyncProjectSelection } from "@/hooks/use-sync-project-selection";
import { useProjects } from "@/hooks/use-unilize-api";
import { useSelectionHydrated } from "@/hooks/use-selection-hydrated";
import { normalizeProjectsFromQuery } from "@/lib/unilize/normalize";
import { useSelectionStore } from "@/stores/selection.store";
import type { UnilizePeriodQuery } from "@/types/unilize";

export function useProjectContext() {
  const hasHydrated = useSelectionHydrated();
  const selectedClientId = useSelectionStore((s) => s.selectedClientId);
  const selectedProjectId = useSelectionStore((s) => s.selectedProjectId);
  const setSelectedProjectId = useSelectionStore((s) => s.setSelectedProjectId);
  const periodFrom = useSelectionStore((s) => s.periodFrom);
  const periodTo = useSelectionStore((s) => s.periodTo);

  const {
    data: projectsResult,
    isLoading: isProjectsLoading,
    isFetching: isProjectsFetching,
    isError: isProjectsError,
  } = useProjects(hasHydrated ? selectedClientId : null);

  const projects = normalizeProjectsFromQuery(projectsResult);
  const projectOptions = useMemo(
    () =>
      projects.map((project) => ({
        value: project.id,
        label: project.name,
      })),
    [projects],
  );

  useSyncProjectSelection({
    projectOptions,
    selectedProjectId,
    setSelectedProjectId,
    isProjectsLoading,
    isProjectsFetching,
    isProjectsError,
  });

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const period: UnilizePeriodQuery | undefined = useMemo(() => {
    if (!periodFrom && !periodTo) return undefined;
    return {
      from: periodFrom ?? undefined,
      to: periodTo ?? undefined,
    };
  }, [periodFrom, periodTo]);

  const canFetchMetrics = Boolean(selectedProjectId);

  return {
    hasHydrated,
    selectedClientId,
    selectedProjectId,
    setSelectedProjectId,
    projectOptions,
    selectedProject,
    isSelectorsLoading: isProjectsLoading,
    isContextFetching: isProjectsFetching,
    canFetchMetrics,
    isProjectsError,
    period,
  };
}

/** @deprecated Utiliser `useProjectContext`. */
export const useProjectCampaignContext = useProjectContext;
