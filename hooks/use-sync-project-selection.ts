"use client";

import { useEffect } from "react";

function resolveSelectedId(
  options: { value: string }[],
  currentId: string | null,
): string | null {
  if (!currentId) {
    return null;
  }
  return options.some((option) => option.value === currentId)
    ? currentId
    : null;
}

interface SyncProjectSelectionParams {
  projectOptions: { value: string; label: string }[];
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  /** Faux tant que le store n'est pas réhydraté ou que la requête projets n'est pas lancée. */
  enabled: boolean;
  isProjectsLoading: boolean;
  isProjectsFetching: boolean;
  isProjectsError: boolean;
}

/**
 * Aligne le projet sélectionné avec la liste API.
 * Ne réinitialise pas la sélection pendant un chargement ou après une erreur.
 */
export function useSyncProjectSelection({
  projectOptions,
  selectedProjectId,
  setSelectedProjectId,
  enabled,
  isProjectsLoading,
  isProjectsFetching,
  isProjectsError,
}: SyncProjectSelectionParams) {
  useEffect(() => {
    if (
      !enabled ||
      isProjectsLoading ||
      isProjectsFetching ||
      isProjectsError
    ) {
      return;
    }
    const nextProjectId = resolveSelectedId(projectOptions, selectedProjectId);
    if (nextProjectId !== selectedProjectId) {
      setSelectedProjectId(nextProjectId);
    }
  }, [
    enabled,
    projectOptions,
    selectedProjectId,
    setSelectedProjectId,
    isProjectsLoading,
    isProjectsFetching,
    isProjectsError,
  ]);
}
