import {
  formatDelayStatus,
  normalizeDelayStatusKey,
} from "@/lib/strategy/format-strategy";
import { delayStatusTone } from "@/lib/ui/metric-tone";
import { cn } from "@/lib/utils/cn";
import type { UnilizeDelayStatus } from "@/types/strategy";

export function DelayStatusBadge({
  status,
}: {
  status: UnilizeDelayStatus | string | null | undefined;
}) {
  const key = normalizeDelayStatusKey(status);
  const label = formatDelayStatus(status);

  if (!key || label === "—") {
    return <>—</>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        delayStatusTone(key),
      )}
    >
      {label}
    </span>
  );
}
