"use client";

import { KeywordTableFilter } from "@/components/ui/keyword-table-filter";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { DataRefreshingOverlay } from "@/components/ui/data-refreshing-overlay";
import { InsightStrip } from "@/components/layout/insight-strip";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { StrategyKeywordTable } from "@/components/strategy/strategy-keyword-table";
import { StrategyOpportunityMatrix } from "@/components/strategy/strategy-opportunity-matrix";
import {
  StrategyRecommendationFilter,
  type StrategyRecommendationFilterValue,
} from "@/components/strategy/strategy-recommendation-filter";
import { StrategyWorkPanels } from "@/components/strategy/strategy-work-panels";
import { StatCard } from "@/components/ui/stat-card";
import { BffErrorAlert } from "@/components/common/bff-error-alert";
import { computeExpectedTotalTraffic } from "@/lib/strategy/compute-summary";
import { filterRowsByKeywordQuery } from "@/lib/projects/keywords";
import { computeHybridInsights } from "@/lib/insights/compute-insights";
import { formatNumber } from "@/lib/utils/formatting";
import { useStrategy } from "@/hooks/use-strategy-api";
import { useProjectContext } from "@/hooks/use-project-context";
import { useMemo, useState } from "react";

export function StrategyView() {
  const { canFetchMetrics, selectedProjectId, period } = useProjectContext();
  const [recommendationFilter, setRecommendationFilter] = useState<
    Set<StrategyRecommendationFilterValue>
  >(() => new Set());
  const [keywordQuery, setKeywordQuery] = useState("");

  const {
    data: strategyResult,
    isLoading: isStrategyLoading,
    isFetching: isStrategyFetching,
    isError: isStrategyError,
    error: strategyError,
  } = useStrategy(canFetchMetrics ? selectedProjectId : null, period);

  const strategy = strategyResult?.strategy;
  const isRefreshing = isStrategyFetching && Boolean(strategyResult);

  const insights = useMemo(() => {
    if (!strategy) {
      return [];
    }
    return computeHybridInsights(strategy).slice(0, 2);
  }, [strategy]);

  const filteredComparisons = useMemo(() => {
    if (!strategy) {
      return [];
    }
    const byRecommendation =
      recommendationFilter.size === 0
        ? strategy.keyword_comparisons
        : strategy.keyword_comparisons.filter((row) =>
            recommendationFilter.has(
              row.recommendation as StrategyRecommendationFilterValue,
            ),
          );
    return filterRowsByKeywordQuery(
      byRecommendation,
      (row) => row.keyword,
      keywordQuery,
    );
  }, [strategy, recommendationFilter, keywordQuery]);

  if (isStrategyLoading && !strategyResult) {
    return (
      <div className="space-y-3" aria-busy="true">
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isStrategyError) {
    return (
      <BffErrorAlert
        error={strategyError}
        fallback="Impossible de charger la stratégie."
        title="Stratégie indisponible"
      />
    );
  }

  if (!strategy) {
    return (
      <p className="text-muted-foreground text-sm">
        Aucune donnée stratégique pour ce contexte.
      </p>
    );
  }

  const expectedTotalTraffic = computeExpectedTotalTraffic(
    strategy.keyword_comparisons,
  );

  const summaryCards = [
    {
      label: "Mots-clés SEO",
      value: strategy.summary.seo_keywords_count,
    },
    {
      label: "Mots-clés SEA",
      value: strategy.summary.sea_keywords_count,
    },
    {
      label: "SEO + SEA",
      value: strategy.summary.hybrid_keywords_count,
    },
    {
      label: "Trafic total espéré",
      value: formatNumber(expectedTotalTraffic),
      alwaysShow: true,
      hint: "Mensuel",
    },
  ].filter(
    (card) =>
      card.alwaysShow || (typeof card.value === "number" && card.value > 0),
  );

  const keywordCount = filteredComparisons.length;
  const totalKeywordCount = strategy.keyword_comparisons.length;
  const filterActive =
    recommendationFilter.size > 0 || keywordQuery.trim().length > 0;

  return (
    <DataRefreshingOverlay active={isRefreshing} className="space-y-6">
      <InsightStrip insights={insights} />

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

      <DataTableShell
        title="Recommandations par mot-clé"
        description={`${keywordCount} mot${keywordCount > 1 ? "s" : ""}-clé${
          filterActive ? ` sur ${totalKeywordCount}` : ""
        }${isRefreshing ? " — actualisation…" : ""}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <KeywordTableFilter
              value={keywordQuery}
              onChange={setKeywordQuery}
              disabled={isRefreshing}
            />
            <StrategyRecommendationFilter
              selected={recommendationFilter}
              onChange={setRecommendationFilter}
            />
          </div>
        }
      >
        {filteredComparisons.length === 0 ? (
          <p className="text-muted-foreground px-4 py-6 text-sm">
            Aucun mot-clé ne correspond aux filtres.
          </p>
        ) : (
          <StrategyKeywordTable rows={filteredComparisons} />
        )}
      </DataTableShell>

      <StrategyWorkPanels
        netlinkingGaps={strategy.netlinking_gaps}
        semanticGaps={strategy.semantic_gaps}
      />

      <DataTableShell
        title="Matrice d'opportunités"
        description="Répartition des mots-clés par recommandation actionnable (volume agrégé)."
      >
        <StrategyOpportunityMatrix matrix={strategy.opportunity_matrix} />
      </DataTableShell>
    </DataRefreshingOverlay>
  );
}
