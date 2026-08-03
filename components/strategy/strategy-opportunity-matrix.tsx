"use client";

import { StatCard } from "@/components/ui/stat-card";
import {
  OPPORTUNITY_BUCKET_DESCRIPTIONS,
  OPPORTUNITY_BUCKET_LABELS,
} from "@/lib/strategy/format-strategy";
import { formatNumber } from "@/lib/utils/formatting";
import type { UnilizeOpportunityMatrix } from "@/types/strategy";

type BucketKey = keyof UnilizeOpportunityMatrix;

const BUCKET_ORDER: BucketKey[] = [
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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {BUCKET_ORDER.map((bucket) => {
        const data = matrix[bucket];
        return (
          <div key={bucket} className="space-y-1">
            <StatCard
              label={OPPORTUNITY_BUCKET_LABELS[bucket]}
              value={data.keyword_count}
              hint={`${formatNumber(data.volume)} vol.`}
            />
            <p className="text-muted-foreground px-1 text-xs">
              {OPPORTUNITY_BUCKET_DESCRIPTIONS[bucket]}
            </p>
          </div>
        );
      })}
    </div>
  );
}
