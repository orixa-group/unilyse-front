"use client";

import { useEffect, useMemo, useState } from "react";
import { BffErrorAlert } from "@/components/common/bff-error-alert";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { DataRefreshingOverlay } from "@/components/ui/data-refreshing-overlay";
import { DataTableShell } from "@/components/ui/data-table-shell";
import {
  StrategyFunnelFilters,
  themeOptionsFromKeywords,
} from "@/components/strategy/strategy-funnel-filters";
import { StatCard } from "@/components/ui/stat-card";
import { StrategyOpportunityMatrix } from "@/components/strategy/strategy-opportunity-matrix";
import { StrategyRecommendationFilter } from "@/components/strategy/strategy-recommendation-filter";
import type { StrategyRecommendationFilterValue } from "@/lib/strategy/format-recommendations";
import { StrategyRecommendationsTable } from "@/components/strategy/strategy-recommendations-table";
import { StrategySection } from "@/components/strategy/strategy-section";
import {
  StrategyTableViewToggle,
  type StrategyTableViewMode,
} from "@/components/strategy/strategy-table-view-toggle";
import { StrategyWorkPanels } from "@/components/strategy/strategy-work-panels";
import { useRecommendations } from "@/hooks/use-recommendations-api";
import { useProjectContext } from "@/hooks/use-project-context";
import {
  buildKeywordThemeMap,
  filterRowsByThemeAndKeyword,
} from "@/lib/projects/funnel-filter";
import { useProjectThemes } from "@/hooks/use-themes-api";
import { useProjectsDetails } from "@/hooks/use-unilize-api";
import { useSelectionStore } from "@/stores/selection.store";
import { formatKeywordLabel } from "@/lib/projects/keywords";
import { computeExpectedTotalTraffic } from "@/lib/strategy/compute-summary";
import { computeOpportunityChannelShares } from "@/lib/strategy/incremental-clicks";
import { mapRecommendationGapsToWorkRows } from "@/lib/strategy/map-recommendation-gaps";
import { shouldShowProjectSkeleton } from "@/lib/unilize/query-loading";
import { formatNumber } from "@/lib/utils/formatting";

export function StrategyHubView() {
  const {
    canFetchMetrics,
    selectedProjectId,
    recommendationAsOfDate,
    recommendationDate,
  } = useProjectContext();

  const [recommendationFilter, setRecommendationFilter] = useState<
    Set<StrategyRecommendationFilterValue>
  >(() => new Set());
  const [tableViewMode, setTableViewMode] =
    useState<StrategyTableViewMode>("full");
  const selectedTheme = useSelectionStore((s) => s.selectedTheme);
  const selectedKeyword = useSelectionStore((s) => s.selectedKeyword);

  const projectDetailsQuery = useProjectsDetails(
    selectedProjectId ? [selectedProjectId] : [],
    { enabled: canFetchMetrics },
  );
  const projectKeywords =
    projectDetailsQuery[0]?.data?.project?.keywords ?? [];
  const themeMap = useMemo(
    () => buildKeywordThemeMap(projectKeywords),
    [projectKeywords],
  );

  const { data: themesResult } = useProjectThemes(
    canFetchMetrics ? selectedProjectId : null,
  );
  const themeOptions = useMemo(() => {
    const fromApi = (themesResult?.themes ?? []).map((theme) => ({
      value: theme,
      label: formatKeywordLabel(theme),
    }));
    if (fromApi.length > 0) {
      return fromApi;
    }
    return themeOptionsFromKeywords(projectKeywords);
  }, [themesResult?.themes, projectKeywords]);

  const dateContext = useMemo(
    () => ({
      recommendationAsOfDate,
    }),
    [recommendationAsOfDate],
  );

  const {
    data: recommendationsResult,
    isLoading: isRecommendationsLoading,
    isFetching: isRecommendationsFetching,
    isError: isRecommendationsError,
    error: recommendationsError,
  } = useRecommendations(
    canFetchMetrics ? selectedProjectId : null,
    dateContext,
  );

  const payload = recommendationsResult?.projectRecommendations;
  const keywords = payload?.keywords ?? [];
  const summary = payload?.summary;
  const opportunityMatrix = payload?.opportunity_matrix;

  useEffect(() => {
    if (!recommendationsResult?.projectRecommendations) {
      return;
    }
    console.log("[Stratégie] GET /recommendations — réponse brute", {
      requestUrl: recommendationsResult.requestUrl,
      dateParam: recommendationDate,
      recommendationAsOfDate,
      projectRecommendations: recommendationsResult.projectRecommendations,
    });
  }, [
    recommendationsResult,
    recommendationDate,
    recommendationAsOfDate,
  ]);

  const semanticRows = useMemo(
    () => mapRecommendationGapsToWorkRows(payload?.semantic_gaps ?? []),
    [payload?.semantic_gaps],
  );
  const netlinkingRows = useMemo(
    () => mapRecommendationGapsToWorkRows(payload?.netlinking_gaps ?? []),
    [payload?.netlinking_gaps],
  );

  const isRefreshing =
    isRecommendationsFetching && Boolean(recommendationsResult);

  const showSkeleton = shouldShowProjectSkeleton(
    selectedProjectId,
    recommendationsResult,
    isRecommendationsLoading,
    isRecommendationsFetching,
  );

  const expectedTotalTraffic = useMemo(
    () => computeExpectedTotalTraffic(keywords),
    [keywords],
  );

  const filteredRecommendations = useMemo(() => {
    const byAction =
      recommendationFilter.size === 0
        ? keywords
        : keywords.filter((row) => {
            const action = row.recommendation?.action;
            if (!action) return false;
            return recommendationFilter.has(
              action as StrategyRecommendationFilterValue,
            );
          });
    return filterRowsByThemeAndKeyword(
      byAction,
      (row) => row.keyword,
      themeMap,
      selectedTheme,
      selectedKeyword,
      "",
    );
  }, [
    keywords,
    recommendationFilter,
    themeMap,
    selectedTheme,
    selectedKeyword,
  ]);

  if (showSkeleton) {
    return (
      <div className="space-y-3" aria-busy="true">
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="h-48 w-full" />
        <div className="grid gap-4 lg:grid-cols-2">
          <LoadingSkeleton className="h-64 w-full" />
          <LoadingSkeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isRecommendationsError) {
    return (
      <BffErrorAlert
        error={recommendationsError}
        fallback="Impossible de charger les recommandations."
        title="Stratégie indisponible"
      />
    );
  }

  if (!summary || !opportunityMatrix) {
    return (
      <p className="text-muted-foreground text-sm">
        Aucune donnée stratégique pour ce contexte.
      </p>
    );
  }

  const channels = computeOpportunityChannelShares(
    opportunityMatrix,
    expectedTotalTraffic,
  );

  const summaryCards = [
    {
      label: "Volume de recherche en jeu",
      value: formatNumber(expectedTotalTraffic),
      hint: "Volume agrégé (reco)",
    },
    {
      label: "Mots-clés SEO",
      value: formatNumber(summary.seo_keywords_count),
      hint: `Volume ${formatNumber(channels.seo.volume)}`,
    },
    {
      label: "Mots-clés SEA",
      value: formatNumber(summary.sea_keywords_count),
      hint: `Volume ${formatNumber(channels.sea.volume)}`,
    },
    {
      label: "Mots-clés hybrides",
      value: formatNumber(summary.hybrid_keywords_count),
      hint: `Volume ${formatNumber(channels.hybrid.volume)} · SEA et SEO`,
    },
  ];

  const keywordCount = filteredRecommendations.length;
  const totalKeywordCount = keywords.length;
  const filterActive =
    recommendationFilter.size > 0 ||
    Boolean(selectedTheme) ||
    Boolean(selectedKeyword);

  const tableMeta = `${keywordCount} mot${keywordCount > 1 ? "s" : ""}-clé${
    filterActive ? ` sur ${totalKeywordCount}` : ""
  } · lecture au ${recommendationDate}${
    isRefreshing ? " — actualisation…" : ""
  }`;

  return (
    <DataRefreshingOverlay active={isRefreshing} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            hint={"hint" in card ? card.hint : undefined}
          />
        ))}
      </div>

      <StrategySection
        title="Matrice d'opportunités"
        description="Répartition des mots-clés par recommandation actionnable (volume agrégé)."
      >
        <StrategyOpportunityMatrix matrix={opportunityMatrix} />
      </StrategySection>

      <StrategySection title="Recommandations par mot-clé">
        <StrategyFunnelFilters
          keywords={projectKeywords}
          themeOptions={themeOptions}
          disabled={isRefreshing}
        />

        <DataTableShell
          description={tableMeta}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <StrategyTableViewToggle
                value={tableViewMode}
                onChange={setTableViewMode}
                disabled={isRefreshing}
              />
              <StrategyRecommendationFilter
                selected={recommendationFilter}
                onChange={setRecommendationFilter}
              />
            </div>
          }
        >
          {filteredRecommendations.length === 0 ? (
            <p className="text-muted-foreground px-4 py-6 text-sm">
              Aucun mot-clé ne correspond aux filtres.
            </p>
          ) : (
            <StrategyRecommendationsTable
              rows={filteredRecommendations}
              viewMode={tableViewMode}
            />
          )}
        </DataTableShell>
      </StrategySection>

      <StrategyWorkPanels
        netlinkingRows={netlinkingRows}
        semanticRows={semanticRows}
      />
    </DataRefreshingOverlay>
  );
}
