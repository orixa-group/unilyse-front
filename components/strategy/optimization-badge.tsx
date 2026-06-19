import { optimizationTone } from "@/lib/ui/metric-tone";
import { cn } from "@/lib/utils/cn";

export function OptimizationBadge({ label }: { label: string }) {
  const optimized = label === "Optimisé";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-normal",
        optimizationTone(optimized),
      )}
    >
      {label}
    </span>
  );
}
