import type { UnilizePerformance } from "@/types/performance";

export interface PerformanceSummaryMetrics {
  keywordCount: number;
  totalImpressions: number;
  totalSpend: number;
  budgetLostCount: number;
}

export function computePerformanceSummary(
  rows: readonly UnilizePerformance[],
): PerformanceSummaryMetrics {
  let totalImpressions = 0;
  let totalSpend = 0;
  let budgetLostCount = 0;

  for (const row of rows) {
    if (!row.sea) {
      continue;
    }
    totalImpressions += row.sea.impressions;
    totalSpend += row.sea.spend;
    if (row.sea.search_budget_lost_impression_share > 0.2) {
      budgetLostCount += 1;
    }
  }

  return {
    keywordCount: rows.length,
    totalImpressions,
    totalSpend,
    budgetLostCount,
  };
}
