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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {keys.map((bucket, index) => (
            <MatrixCell
              key={bucket}
              bucket={bucket}
              data={matrix[bucket]}
              index={index}
              total={keys.length}
            />
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

function MatrixCell({
  bucket,
  data,
  index,
  total,
}: {
  bucket: OpportunityBucketKey;
  data: { keyword_count: number; volume: number };
  index: number;
  total: number;
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
            "border-border focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-inset",
            isArbitration && "bg-warning/10 dark:bg-warning/15",
            index < total - 1 && "border-b sm:border-b-0",
            index < 4 && "sm:border-b lg:border-b-0",
            index < 3 && "lg:border-b xl:border-b-0",
            index % 2 === 1 && "sm:border-l lg:border-l-0",
            index % 3 !== 0 && "lg:border-l xl:border-l-0",
            index > 0 && "xl:border-l",
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
            <p className={cn(
              "text-2xl font-semibold tabular-nums",
              isArbitration ? "text-warning" : "text-foreground",
            )}>
              {data.keyword_count}
            </p>
            <p className={cn(
              "text-xs",
              isArbitration ? "text-warning" : "text-muted-foreground",
            )}>
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
