import { StatCard } from "@/components/ui/stat-card";
import { ROUTES } from "@/lib/constants/routes";
import { computePerformanceSummary } from "@/lib/performances/compute-summary";
import type { UnilizeKeywordMonitoring } from "@/types/monitoring";
import type { UnilizePerformance } from "@/types/performance";

export function PerformanceSummary({
  rows,
  monitoring = [],
}: {
  rows: readonly UnilizePerformance[];
  monitoring?: readonly UnilizeKeywordMonitoring[];
}) {
  const metrics = computePerformanceSummary(rows);
  const seaTargetCount = monitoring.filter((row) => row.status === "target").length;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label="Mots-clés" value={metrics.keywordCount} />
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
      <StatCard
        label="Opportunités SEA à cibler"
        value={seaTargetCount}
        tone={seaTargetCount > 0 ? "success" : "default"}
        hint={
          seaTargetCount > 0
            ? "Concurrence favorable sur ces mots-clés."
            : undefined
        }
        href={seaTargetCount > 0 ? ROUTES.MONITORING : undefined}
      />
    </div>
  );
}
