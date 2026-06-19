import { cn } from "@/lib/utils/cn";
import { competitorCountTone } from "@/lib/ui/metric-tone";
import { formatNumber } from "@/lib/utils/formatting";

export function CompetitorCountBadge({ count }: { count: number }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[2rem] justify-center rounded-full px-2 py-0.5 tabular-nums",
        competitorCountTone(count),
      )}
    >
      {formatNumber(count)}
    </span>
  );
}
