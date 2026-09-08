import {
  formatSeaDimensionScore,
  normalizeSeaDimensionScore,
} from "@/lib/strategy/format-strategy";
import { seaDimensionScoreTone } from "@/lib/ui/metric-tone";
import { cn } from "@/lib/utils/cn";

export function SeaDimensionScoreBadge({
  score,
}: {
  score: number | null | undefined;
}) {
  const level = normalizeSeaDimensionScore(score);
  const label = formatSeaDimensionScore(score);

  if (!level || label === "—") {
    return <>—</>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        seaDimensionScoreTone(level),
      )}
    >
      {label}
    </span>
  );
}
