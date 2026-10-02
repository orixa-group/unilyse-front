"use client";

import { useMemo, useState } from "react";
import { BffErrorAlert } from "@/components/common/bff-error-alert";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { TableSkeleton } from "@/components/common/table-skeleton";
import {
  STRATEGY_CONTENT_COLUMNS,
  STRATEGY_NETLINKING_COLUMNS,
  StrategyWorkPanel,
} from "@/components/strategy/strategy-work-panel";
import { KeywordTableFilter } from "@/components/ui/keyword-table-filter";
import { useRecommendations } from "@/hooks/use-recommendations-api";
import { useProjectContext } from "@/hooks/use-project-context";
import { filterRowsByKeywordQuery } from "@/lib/projects/keywords";
import { mapRecommendationGapsToWorkRows } from "@/lib/strategy/map-recommendation-gaps";
import { shouldShowProjectSkeleton } from "@/lib/unilize/query-loading";

export type StrategyWorkMode = "semantic" | "netlinking";

export function StrategyWorkPage({ mode }: { mode: StrategyWorkMode }) {
  const {
    canFetchMetrics,
    selectedProjectId,
    period,
    recommendationAsOfDate,
  } = useProjectContext();
  const [keywordQuery, setKeywordQuery] = useState("");

  const dateContext = useMemo(
    () => ({
      recommendationAsOfDate,
      period,
    }),
    [recommendationAsOfDate, period],
  );

  const {
    data: recommendationsResult,
    isLoading,
    isFetching,
    isError,
    error,
  } = useRecommendations(
    canFetchMetrics ? selectedProjectId : null,
    dateContext,
  );

  const payload = recommendationsResult?.projectRecommendations;
  const showSkeleton = shouldShowProjectSkeleton(
    selectedProjectId,
    recommendationsResult,
    isLoading,
    isFetching,
  );

  const rows = useMemo(() => {
    const gaps =
      mode === "semantic"
        ? (payload?.semantic_gaps ?? [])
        : (payload?.netlinking_gaps ?? []);
    const built = mapRecommendationGapsToWorkRows(gaps);
    return filterRowsByKeywordQuery(built, (row) => row.keyword, keywordQuery);
  }, [mode, payload?.semantic_gaps, payload?.netlinking_gaps, keywordQuery]);

  const columns =
    mode === "semantic" ? STRATEGY_CONTENT_COLUMNS : STRATEGY_NETLINKING_COLUMNS;
  const title =
    mode === "semantic"
      ? "Mots-clés à travailler — contenu"
      : "Mots-clés à travailler — netlinking";

  if (showSkeleton) {
    return (
      <div className="space-y-3" aria-busy="true">
        <LoadingSkeleton className="h-8 w-64" />
        <TableSkeleton rows={8} />
      </div>
    );
  }

  if (isError) {
    return (
      <BffErrorAlert
        error={error}
        fallback="Impossible de charger les recommandations."
        title="Stratégie indisponible"
      />
    );
  }

  return (
    <div className="space-y-3">
      <KeywordTableFilter value={keywordQuery} onChange={setKeywordQuery} />
      <StrategyWorkPanel title={title} columns={columns} rows={rows} />
    </div>
  );
}
