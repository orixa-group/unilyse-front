import type { UnilizePerformance } from "@/types/performance";

export interface PerformanceSummaryMetrics {
  keywordCount: number;
  totalImpressions: number;
  totalCost: number;
  budgetLostCount: number;
}

export function computePerformanceSummary(
  rows: readonly UnilizePerformance[],
): PerformanceSummaryMetrics {
  let totalImpressions = 0;
  let totalCost = 0;
  let budgetLostCount = 0;

  for (const row of rows) {
    const paid = row.paid_performances;
    if (!paid) {
      continue;
    }
    totalImpressions += paid.impressions;
    totalCost += paid.cost;
    if (paid.search_budget_lost_impression_share > 0.2) {
      budgetLostCount += 1;
    }
  }

  return {
    keywordCount: rows.length,
    totalImpressions,
    totalCost,
    budgetLostCount,
  };
}
