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
  paidReason,
  organicReason,
  guidance,
}: {
  action: UnilizeRecommendationAction | string;
  paidReason?: string | null;
  organicReason?: string | null;
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

  const hasDetail = Boolean(
    paidReason?.trim() ||
      organicReason?.trim() ||
      guidance?.trim(),
  );
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
        <TooltipContent side="top" className="max-w-sm space-y-2.5 p-3 text-left">
          {paidReason?.trim() || organicReason?.trim() ? (
            <div className="space-y-1">
              <p className="text-foreground font-medium">Pourquoi</p>
              {paidReason?.trim() ? (
                <p>
                  <span className="font-medium text-chart-1">SEA</span>
                  <span className="text-muted-foreground"> — </span>
                  {paidReason}
                </p>
              ) : null}
              {organicReason?.trim() ? (
                <p>
                  <span className="font-medium text-chart-2">SEO</span>
                  <span className="text-muted-foreground"> — </span>
                  {organicReason}
                </p>
              ) : null}
            </div>
          ) : null}
          {guidance?.trim() ? (
            <div className="space-y-1">
              <p className="text-foreground font-medium">Comment appliquer</p>
              <p>{guidance}</p>
            </div>
          ) : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
