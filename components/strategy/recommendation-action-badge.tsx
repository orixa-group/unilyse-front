import {
  formatRecommendationAction,
  recommendationToneKey,
} from "@/lib/strategy/format-recommendations";
import { recommendationTone } from "@/lib/ui/metric-tone";
import { cn } from "@/lib/utils/cn";
import type { UnilizeRecommendationAction } from "@/types/recommendations";

export function RecommendationActionBadge({
  action,
}: {
  action: UnilizeRecommendationAction | string;
}) {
  const label = formatRecommendationAction(action);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-normal",
        recommendationTone(recommendationToneKey(action)),
      )}
    >
      {label}
    </span>
  );
}
