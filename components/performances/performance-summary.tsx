import { StatCard } from "@/components/ui/stat-card";
import { computePerformanceSummary } from "@/lib/performances/compute-summary";
import { formatCurrencyEur, formatNumber } from "@/lib/utils/formatting";
import type { UnilizePerformance } from "@/types/performance";

export function PerformanceSummary({
  rows,
}: {
  rows: readonly UnilizePerformance[];
}) {
  const metrics = computePerformanceSummary(rows);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Mots-clés" value={metrics.keywordCount} />
      <StatCard
        label="Impressions SEA"
        value={formatNumber(metrics.totalImpressions)}
      />
      <StatCard
        label="Dépense SEA"
        value={formatCurrencyEur(metrics.totalCost)}
      />
      <StatCard
        label="Impr. perdues (budget)"
        value={metrics.budgetLostCount}
        tone={metrics.budgetLostCount > 0 ? "warning" : "default"}
        hint={
          metrics.budgetLostCount > 0
            ? "Mots-clés avec perte budget > 20 %"
            : undefined
        }
      />
    </div>
  );
}
