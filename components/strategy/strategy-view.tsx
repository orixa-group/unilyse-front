"use client";

import { DataTableShell } from "@/components/ui/data-table-shell";
import { InsightStrip } from "@/components/layout/insight-strip";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { StrategyColumnMenu } from "@/components/strategy/strategy-column-menu";
import { StrategyKeywordTable } from "@/components/strategy/strategy-keyword-table";
import { StrategyLensToggle } from "@/components/strategy/strategy-lens-bar";
import { StrategyNetlinkingTable } from "@/components/strategy/strategy-netlinking-table";
import { StrategyOpportunityMatrix } from "@/components/strategy/strategy-opportunity-matrix";
import { StrategySemanticGapsTable } from "@/components/strategy/strategy-semantic-gaps-table";
import { StatCard } from "@/components/ui/stat-card";
import { BffErrorAlert } from "@/components/common/bff-error-alert";
import { computeExpectedTotalTraffic } from "@/lib/strategy/compute-summary";
import {
  computeHybridInsights,
  computeSeoInsights,
} from "@/lib/insights/compute-insights";
import { formatNumber } from "@/lib/utils/formatting";
import { useStrategy } from "@/hooks/use-strategy-api";
import { useProjectContext } from "@/hooks/use-project-context";
import { useSelectionStore } from "@/stores/selection.store";
import { useMemo } from "react";

export function StrategyView() {
  const analysisLens = useSelectionStore((s) => s.analysisLens);
  const strategyExtraColumns = useSelectionStore((s) => s.strategyExtraColumns);
  const setStrategyExtraColumn = useSelectionStore(
    (s) => s.setStrategyExtraColumn,
  );
  const { canFetchMetrics, selectedProjectId, period } =
    useProjectContext();

  const extraColumns = useMemo(
    () => new Set(strategyExtraColumns?.[analysisLens] ?? []),
    [strategyExtraColumns, analysisLens],
  );

  const handleToggleColumn = (columnId: string, checked: boolean) => {
    setStrategyExtraColumn(analysisLens, columnId, checked);
  };

  const {
    data: strategyResult,
    isLoading: isStrategyLoading,
    isFetching: isStrategyFetching,
    isError: isStrategyError,
    error: strategyError,
  } = useStrategy(
    canFetchMetrics ? selectedProjectId : null,
    period,
  );

  const strategy = strategyResult?.strategy;

  const insights = useMemo(() => {
    if (!strategy) {
      return [];
    }
    if (analysisLens === "seo") {
      return computeSeoInsights([], strategy);
    }
    return computeHybridInsights(strategy).slice(0, 2);
  }, [strategy, analysisLens]);

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

  const showSeoSections = analysisLens !== "sea";

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
    (card) => card.alwaysShow || (typeof card.value === "number" && card.value > 0),
  );

  const keywordCount = strategy.keyword_comparisons.length;

  return (
    <div className="space-y-6">
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
        description={`${keywordCount} mot${keywordCount > 1 ? "s" : ""}-clé${isStrategyFetching ? " — actualisation…" : ""}`}
        actions={
          <div className="flex items-center gap-2">
            <StrategyColumnMenu
              lens={analysisLens}
              extraColumns={extraColumns}
              onToggleColumn={handleToggleColumn}
            />
            <StrategyLensToggle />
          </div>
        }
      >
        <StrategyKeywordTable
          rows={strategy.keyword_comparisons}
          lens={analysisLens}
          extraColumns={extraColumns}
        />
      </DataTableShell>

      {showSeoSections ? (
        <>
          <DataTableShell
            title="Écarts de netlinking"
            description="Backlinks à acquérir pour gagner des positions."
          >
            <StrategyNetlinkingTable rows={strategy.netlinking_gaps} />
          </DataTableShell>

          <DataTableShell
            title="Écarts sémantiques"
            description="Mots-clés dont la couverture sémantique n’est pas optimisée vs concurrents."
          >
            <StrategySemanticGapsTable
              rows={strategy.semantic_gaps}
              keywordComparisons={strategy.keyword_comparisons}
            />
          </DataTableShell>

          <DataTableShell
            title="Matrice d'opportunités"
            description="Répartition des mots-clés selon volume, score sémantique et position organique."
          >
            <StrategyOpportunityMatrix matrix={strategy.opportunity_matrix} />
          </DataTableShell>
        </>
      ) : null}
    </div>
  );
}
