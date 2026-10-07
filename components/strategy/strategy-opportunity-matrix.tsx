"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  OPPORTUNITY_MATRIX_DISPLAY_ORDER,
  OPPORTUNITY_BUCKET_DESCRIPTIONS,
  OPPORTUNITY_BUCKET_LABELS,
  type OpportunityBucketKey,
} from "@/lib/strategy/format-recommendations";
import type { UnilizeOpportunityMatrix } from "@/types/recommendations";
import { formatNumber } from "@/lib/utils/formatting";
import { cn } from "@/lib/utils/cn";

export function StrategyOpportunityMatrix({
  matrix,
}: {
  matrix: UnilizeOpportunityMatrix;
}) {
  const keys = OPPORTUNITY_MATRIX_DISPLAY_ORDER;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="divide-border grid divide-x divide-y sm:grid-cols-2 lg:grid-cols-4">
          {keys.map((bucket) => (
            <MatrixCell key={bucket} bucket={bucket} data={matrix[bucket]} />
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

function MatrixCell({
  bucket,
  data,
}: {
  bucket: OpportunityBucketKey;
  data: { keyword_count: number; volume: number };
}) {
  const description = OPPORTUNITY_BUCKET_DESCRIPTIONS[bucket];
  const label = OPPORTUNITY_BUCKET_LABELS[bucket];
  const isArbitration = bucket === "human_arbitration";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex min-h-[6.5rem] cursor-help flex-col gap-3 px-5 py-5 outline-none",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-inset",
            isArbitration && "bg-warning/10 dark:bg-warning/15",
          )}
          tabIndex={0}
          aria-label={`${label}. ${description}`}
        >
          <p
            className={cn(
              "text-xs font-medium tracking-wide uppercase",
              isArbitration ? "text-warning" : "text-muted-foreground",
            )}
          >
            {label}
          </p>
          <div className="space-y-1">
            <p
              className={cn(
                "text-2xl font-semibold tabular-nums",
                isArbitration ? "text-warning" : "text-foreground",
              )}
            >
              {data.keyword_count}
            </p>
            <p
              className={cn(
                "text-xs",
                isArbitration ? "text-warning" : "text-muted-foreground",
              )}
            >
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
}
