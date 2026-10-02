import type { UnilizeRecommendationGap } from "@/types/recommendations";
import type { StrategyWorkGapRow } from "@/types/strategy-work";

export function mapRecommendationGapToWorkRow(
  gap: UnilizeRecommendationGap,
): StrategyWorkGapRow {
  return {
    keyword: gap.keyword,
    volume: gap.volume,
    current_score: gap.current_score,
    target_score: gap.target_score,
    gap: gap.gap,
    page_url: null,
  };
}

export function mapRecommendationGapsToWorkRows(
  gaps: readonly UnilizeRecommendationGap[],
): StrategyWorkGapRow[] {
  return gaps.map(mapRecommendationGapToWorkRow);
}
