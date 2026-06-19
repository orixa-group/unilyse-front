import type { UnilizeKeywordComparison } from "@/types/strategy";

export function computeExpectedTotalTraffic(
  rows: readonly UnilizeKeywordComparison[],
): number {
  return rows.reduce((sum, row) => {
    const volume = row.search_volume;
    if (volume == null || !Number.isFinite(volume) || volume <= 0) {
      return sum;
    }
    return sum + volume;
  }, 0);
}
