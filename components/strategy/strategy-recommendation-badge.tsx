import { formatStrategyRecommendation } from "@/lib/strategy/format-strategy";
import { recommendationTone } from "@/lib/ui/metric-tone";
import { cn } from "@/lib/utils/cn";
import type { UnilizeStrategyRecommendation } from "@/types/strategy";

export function StrategyRecommendationBadge({
  recommendation,
}: {
  recommendation: UnilizeStrategyRecommendation | string;
}) {
  const normalized = recommendation.toLowerCase() as UnilizeStrategyRecommendation;
  const label = formatStrategyRecommendation(normalized);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-normal",
        recommendationTone(normalized),
      )}
    >
      {label}
    </span>
  );
}
