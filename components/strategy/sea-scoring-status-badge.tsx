import {
  formatSeaScoringStatus,
  normalizeSeaScoringStatusKey,
} from "@/lib/strategy/format-strategy";
import { seaScoringStatusTone } from "@/lib/ui/metric-tone";
import { cn } from "@/lib/utils/cn";
import type { UnilizeSeaScoringStatus } from "@/types/strategy";

export function SeaScoringStatusBadge({
  status,
}: {
  status: UnilizeSeaScoringStatus | string | null | undefined;
}) {
  const key = normalizeSeaScoringStatusKey(status);
  const label = formatSeaScoringStatus(status);

  if (!key || label === "—") {
    return <>—</>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        seaScoringStatusTone(key),
      )}
    >
      {label}
    </span>
  );
}
