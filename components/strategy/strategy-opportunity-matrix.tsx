"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  OPPORTUNITY_BUCKET_DESCRIPTIONS,
  OPPORTUNITY_BUCKET_LABELS,
  type OpportunityBucketKey,
} from "@/lib/strategy/format-recommendations";
import { formatNumber } from "@/lib/utils/formatting";
import type { UnilizeOpportunityMatrix } from "@/types/recommendations";

const BUCKET_ORDER: OpportunityBucketKey[] = [
  "launch_seo",
  "double_presence",
  "maintain_ads",
  "review_strategy",
];

export function StrategyOpportunityMatrix({
  matrix,
}: {
  matrix: UnilizeOpportunityMatrix;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {BUCKET_ORDER.map((bucket) => {
          const data = matrix[bucket];
          const description = OPPORTUNITY_BUCKET_DESCRIPTIONS[bucket];
          return (
            <Tooltip key={bucket}>
              <TooltipTrigger asChild>
                <div
                  className="border-border bg-card flex min-h-[6.5rem] cursor-help flex-col gap-3 rounded-xl border px-5 py-5 outline-none focus-visible:ring-ring focus-visible:ring-2"
                  tabIndex={0}
                  aria-label={`${OPPORTUNITY_BUCKET_LABELS[bucket]}. ${description}`}
                >
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {OPPORTUNITY_BUCKET_LABELS[bucket]}
                  </p>
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold tabular-nums">
                      {data.keyword_count}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatNumber(data.volume)} vol.
                    </p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs text-left text-sm leading-relaxed"
              >
                {description}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
