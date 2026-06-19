import { InsightCard } from "@/components/ui/insight-card";
import type { Insight } from "@/lib/insights/compute-insights";

export function InsightStrip({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto pb-1">
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  );
}
