"use client";

import { useMemo, useState } from "react";
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
import { mapRecommendationGapsToWorkRows } from "@/lib/strategy/map-recommendation-gaps";
import { shouldShowProjectSkeleton } from "@/lib/unilize/query-loading";
import { formatNumber } from "@/lib/utils/formatting";

export function StrategyHubView() {
  const {
    canFetchMetrics,
    selectedProjectId,
    period,
    recommendationAsOfDate,
    recommendationDate,
  } = useProjectContext();

  const [recommendationFilter, setRecommendationFilter] = useState<
    Set<StrategyRecommendationFilterValue>
  >(() => new Set());
  const [keywordQuery, setKeywordQuery] = useState("");
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
      period,
    }),
    [recommendationAsOfDate, period],
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
      keywordQuery,
    );
  }, [
    keywords,
    recommendationFilter,
    keywordQuery,
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

  const summaryCards = [
    {
      label: "Mots-clés SEO",
      value: summary.seo_keywords_count,
    },
    {
      label: "Mots-clés SEA",
      value: summary.sea_keywords_count,
    },
    {
      label: "SEO + SEA",
      value: summary.hybrid_keywords_count,
    },
    {
      label: "Trafic total espéré",
      value: formatNumber(expectedTotalTraffic),
      alwaysShow: true,
      hint: "Volume agrégé (reco)",
    },
  ].filter(
    (card) =>
      ("alwaysShow" in card && card.alwaysShow) ||
      (typeof card.value === "number" && card.value > 0),
  );

  const keywordCount = filteredRecommendations.length;
  const totalKeywordCount = keywords.length;
  const filterActive =
    recommendationFilter.size > 0 ||
    keywordQuery.trim().length > 0 ||
    Boolean(selectedTheme) ||
    Boolean(selectedKeyword);

  return (
    <DataRefreshingOverlay active={isRefreshing} className="space-y-6">
      {summaryCards.length > 0 ? (
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
      ) : null}

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">
            Matrice d&apos;opportunités
          </h3>
          <p className="text-muted-foreground text-xs">
            Répartition des mots-clés par recommandation actionnable (volume
            agrégé).
          </p>
        </div>
        <StrategyOpportunityMatrix matrix={opportunityMatrix} />
      </div>

      <StrategyFunnelFilters
        keywords={projectKeywords}
        themeOptions={themeOptions}
        keywordQuery={keywordQuery}
        onKeywordQueryChange={setKeywordQuery}
        disabled={isRefreshing}
      />

      <DataTableShell
        title="Recommandations par mot-clé"
        description={`${keywordCount} mot${keywordCount > 1 ? "s" : ""}-clé${
          filterActive ? ` sur ${totalKeywordCount}` : ""
        } · lecture au ${recommendationDate}${
          isRefreshing ? " — actualisation…" : ""
        }`}
        actions={
          <StrategyRecommendationFilter
            selected={recommendationFilter}
            onChange={setRecommendationFilter}
          />
        }
      >
        {filteredRecommendations.length === 0 ? (
          <p className="text-muted-foreground px-4 py-6 text-sm">
            Aucun mot-clé ne correspond aux filtres.
          </p>
        ) : (
          <StrategyRecommendationsTable
            rows={filteredRecommendations}
            readAsOf={recommendationDate}
          />
        )}
      </DataTableShell>

      <StrategyWorkPanels
        netlinkingRows={netlinkingRows}
        semanticRows={semanticRows}
      />
    </DataRefreshingOverlay>
  );
}
