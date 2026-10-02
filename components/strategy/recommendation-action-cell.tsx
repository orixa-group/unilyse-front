"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatRecommendationAction,
  recommendationToneKey,
} from "@/lib/strategy/format-recommendations";
import { recommendationTone } from "@/lib/ui/metric-tone";
import { cn } from "@/lib/utils/cn";
import type { UnilizeRecommendationAction } from "@/types/recommendations";

export function RecommendationActionCell({
  action,
  reason,
  guidance,
}: {
  action: UnilizeRecommendationAction | string;
  reason?: string | null;
  guidance?: string | null;
}) {
  const label = formatRecommendationAction(action);
  const badge = (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-normal",
        recommendationTone(recommendationToneKey(action)),
      )}
    >
      {label}
    </span>
  );

  const hasDetail = Boolean(reason?.trim() || guidance?.trim());
  if (!hasDetail) {
    return badge;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "cursor-help rounded outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            {badge}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm space-y-2 p-3 text-left">
          {reason?.trim() ? (
            <p>
              <span className="text-foreground font-medium">Pourquoi — </span>
              {reason}
            </p>
          ) : null}
          {guidance?.trim() ? (
            <p>
              <span className="text-foreground font-medium">
                Comment appliquer —{" "}
              </span>
              {guidance}
            </p>
          ) : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
