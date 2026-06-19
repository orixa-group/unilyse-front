"use client";

import { useMemo } from "react";
import { useSyncProjectCampaignSelection } from "@/hooks/use-sync-project-campaign-selection";
import { useCampaigns, useProjects } from "@/hooks/use-unilize-api";
import { useSelectionHydrated } from "@/hooks/use-selection-hydrated";
import { normalizeProjectsFromQuery } from "@/lib/unilize/normalize";
import { useSelectionStore } from "@/stores/selection.store";

export function useProjectCampaignContext() {
  const hasHydrated = useSelectionHydrated();
  const selectedClientId = useSelectionStore((s) => s.selectedClientId);
  const selectedProjectId = useSelectionStore((s) => s.selectedProjectId);
  const selectedCampaignId = useSelectionStore((s) => s.selectedCampaignId);
  const setSelectedProjectId = useSelectionStore((s) => s.setSelectedProjectId);
  const setSelectedCampaignId = useSelectionStore(
    (s) => s.setSelectedCampaignId,
  );

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

  const {
    data: campaignsResult,
    isLoading: isCampaignsLoading,
    isFetching: isCampaignsFetching,
    isError: isCampaignsError,
  } = useCampaigns(hasHydrated ? selectedProjectId : null);

  const campaignOptions = useMemo(
    () =>
      (campaignsResult?.campaigns ?? []).map((campaign) => ({
        value: campaign.id,
        label: campaign.name,
      })),
    [campaignsResult?.campaigns],
  );

  useSyncProjectCampaignSelection({
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
  });

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const selectedCampaign = useMemo(
    () =>
      (campaignsResult?.campaigns ?? []).find(
        (c) => c.id === selectedCampaignId,
      ) ?? null,
    [campaignsResult?.campaigns, selectedCampaignId],
  );

  const isSelectorsLoading = isProjectsLoading || isCampaignsLoading;
  const isContextFetching = isProjectsFetching || isCampaignsFetching;
  const canFetchMetrics = Boolean(selectedProjectId && selectedCampaignId);

  return {
    hasHydrated,
    selectedClientId,
    selectedProjectId,
    selectedCampaignId,
    setSelectedProjectId,
    setSelectedCampaignId,
    projectOptions,
    campaignOptions,
    selectedProject,
    selectedCampaign,
    isSelectorsLoading,
    isContextFetching,
    canFetchMetrics,
    isProjectsError,
    isCampaignsError,
  };
}
