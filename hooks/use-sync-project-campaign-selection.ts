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

interface SyncProjectCampaignSelectionParams {
  projectOptions: { value: string; label: string }[];
  campaignOptions: { value: string; label: string }[];
  selectedProjectId: string | null;
  selectedCampaignId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  setSelectedCampaignId: (id: string | null) => void;
  isProjectsLoading: boolean;
  isProjectsFetching: boolean;
  isProjectsError: boolean;
  isCampaignsLoading: boolean;
  isCampaignsFetching: boolean;
  isCampaignsError: boolean;
}

/**
 * Aligne projet/campagne sélectionnés avec les listes API.
 * Ne réinitialise pas la sélection pendant un chargement ou après une erreur
 * (évite de perdre le contexte sur un 404/500 transitoire).
 */
export function useSyncProjectCampaignSelection({
  projectOptions,
  campaignOptions,
  selectedProjectId,
  selectedCampaignId,
  setSelectedProjectId,
  setSelectedCampaignId,
  isProjectsLoading,
  isProjectsFetching,
  isProjectsError,
  isCampaignsLoading,
  isCampaignsFetching,
  isCampaignsError,
}: SyncProjectCampaignSelectionParams) {
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

  useEffect(() => {
    if (
      !selectedProjectId ||
      isCampaignsLoading ||
      isCampaignsFetching ||
      isCampaignsError
    ) {
      return;
    }
    const nextCampaignId = resolveSelectedId(campaignOptions, selectedCampaignId);
    if (nextCampaignId !== selectedCampaignId) {
      setSelectedCampaignId(nextCampaignId);
    }
  }, [
    campaignOptions,
    selectedCampaignId,
    setSelectedCampaignId,
    isCampaignsLoading,
    isCampaignsFetching,
    isCampaignsError,
    selectedProjectId,
  ]);
}
