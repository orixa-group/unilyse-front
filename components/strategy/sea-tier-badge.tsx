import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  MinusSignIcon,
} from "@hugeicons/core-free-icons";
import {
  formatStrategySeaTier,
  normalizeSeaTierKey,
} from "@/lib/strategy/format-strategy";
import { seaTierTone } from "@/lib/ui/metric-tone";
import { cn } from "@/lib/utils/cn";
import type { UnilizeStrategySeaTier } from "@/types/strategy";

function resolveSeaTierIcon(key: string | null) {
  if (key === "above_average") {
    return ArrowUp01Icon;
  }
  if (key === "below_average") {
    return ArrowDown01Icon;
  }
  if (key === "average") {
    return MinusSignIcon;
  }
  return null;
}

export function SeaTierBadge({
  tier,
}: {
  tier: UnilizeStrategySeaTier | string | null;
}) {
  const key = normalizeSeaTierKey(typeof tier === "string" ? tier : (tier ?? null));
  const label = formatStrategySeaTier(tier);

  if (label === "—") {
    return <>{label}</>;
  }

  const Icon = resolveSeaTierIcon(key);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs",
        seaTierTone(tier),
      )}
    >
      {Icon ? (
        <HugeiconsIcon
          icon={Icon}
          size={12}
          color="currentColor"
          strokeWidth={2}
          aria-hidden
        />
      ) : null}
      {label}
    </span>
  );
}
