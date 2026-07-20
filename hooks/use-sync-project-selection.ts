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
  isProjectsLoading,
  isProjectsFetching,
  isProjectsError,
}: SyncProjectSelectionParams) {
  useEffect(() => {
    if (isProjectsLoading || isProjectsFetching || isProjectsError) {
      return;
    }
    const nextProjectId = resolveSelectedId(projectOptions, selectedProjectId);
    if (nextProjectId !== selectedProjectId) {
      setSelectedProjectId(nextProjectId);
    }
  }, [
    projectOptions,
    selectedProjectId,
    setSelectedProjectId,
    isProjectsLoading,
    isProjectsFetching,
    isProjectsError,
  ]);
}
