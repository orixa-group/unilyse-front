import type { UnilizeKeywordMonitoring } from "@/types/monitoring";

export interface MonitoringSummaryMetrics {
  keywordCount: number;
  targetCount: number;
  considerCount: number;
  avgCompetitors: number;
}

export function computeMonitoringSummary(
  rows: readonly UnilizeKeywordMonitoring[],
): MonitoringSummaryMetrics {
  let targetCount = 0;
  let considerCount = 0;
  let competitorSum = 0;

  for (const row of rows) {
    if (row.status === "target") {
      targetCount += 1;
    } else if (row.status === "consider") {
      considerCount += 1;
    }
    competitorSum += row.competitor_count;
  }

  return {
    keywordCount: rows.length,
    targetCount,
    considerCount,
    avgCompetitors: rows.length > 0 ? competitorSum / rows.length : 0,
  };
}
