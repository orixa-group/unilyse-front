import {
  formatScoringLevel,
  normalizeScoringLevelKey,
} from "@/lib/strategy/format-strategy";
import {
  scoringLevelTone,
  type ScoringLevelPolarity,
} from "@/lib/ui/metric-tone";
import { cn } from "@/lib/utils/cn";

export function ScoringLevelBadge({
  level,
  polarity = "positive",
}: {
  level: string | null | undefined;
  polarity?: ScoringLevelPolarity;
}) {
  const key = normalizeScoringLevelKey(level);
  const label = formatScoringLevel(level);

  if (!key || label === "—") {
    return <>—</>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        scoringLevelTone(key, polarity),
      )}
    >
      {label}
    </span>
  );
}
