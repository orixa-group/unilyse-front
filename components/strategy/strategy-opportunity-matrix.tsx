"use client";

import {
  OPPORTUNITY_BUCKET_DESCRIPTIONS,
  OPPORTUNITY_BUCKET_LABELS,
  type OpportunityBucketKey,
} from "@/lib/strategy/format-recommendations";
import { formatNumber } from "@/lib/utils/formatting";
import { cn } from "@/lib/utils/cn";
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
    <div className="grid sm:grid-cols-2 lg:grid-cols-4">
      {BUCKET_ORDER.map((bucket, index) => {
        const data = matrix[bucket];
        return (
          <div
            key={bucket}
            className={cn(
              "flex min-h-[9.5rem] flex-col gap-3 px-5 py-5",
              "border-border",
              index < BUCKET_ORDER.length - 1 && "border-b sm:border-b-0",
              index < 2 && "sm:border-b lg:border-b-0",
              index % 2 === 1 && "sm:border-l",
              index > 0 && "lg:border-l",
            )}
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
            <p className="text-muted-foreground mt-auto text-xs leading-relaxed">
              {OPPORTUNITY_BUCKET_DESCRIPTIONS[bucket]}
            </p>
          </div>
        );
      })}
    </div>
  );
}
