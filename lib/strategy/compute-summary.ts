import type { UnilizeKeywordRecommendation } from "@/types/recommendations";

export function computeExpectedTotalTraffic(
  rows: readonly UnilizeKeywordRecommendation[],
): number {
  return rows.reduce((sum, row) => {
    const volume = row.recommendation?.search_volume;
    if (volume == null || !Number.isFinite(volume) || volume <= 0) {
      return sum;
    }
    return sum + volume;
  }, 0);
}
