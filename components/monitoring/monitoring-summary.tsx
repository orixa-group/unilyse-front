import { StatCard } from "@/components/ui/stat-card";
import { computeMonitoringSummary } from "@/lib/monitoring/compute-summary";
import { formatNumber } from "@/lib/utils/formatting";
import type { UnilizeKeywordMonitoring } from "@/types/monitoring";

export function MonitoringSummary({
  rows,
}: {
  rows: readonly UnilizeKeywordMonitoring[];
}) {
  const metrics = computeMonitoringSummary(rows);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Mots-clés surveillés" value={metrics.keywordCount} />
      <StatCard
        label="À cibler"
        value={metrics.targetCount}
        tone={metrics.targetCount > 0 ? "warning" : "default"}
      />
      <StatCard label="À évaluer" value={metrics.considerCount} />
      <StatCard
        label="Concurrents (moy.)"
        value={formatNumber(Number(metrics.avgCompetitors.toFixed(1)))}
      />
    </div>
  );
}
