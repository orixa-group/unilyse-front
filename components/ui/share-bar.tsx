import { cn } from "@/lib/utils/cn";
import {
  getShareSeverity,
  SHARE_BAR_CLASS,
  SHARE_TEXT_CLASS,
} from "@/lib/ui/table-visual";
import { formatDecimal, formatPercentValue } from "@/lib/utils/formatting";

export function ShareBar({
  value,
  className,
}: {
  /** Part entre 0 et 1 (ex. 0.25 = 25 %). */
  value: number | null | undefined;
  className?: string;
}) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  const severity = getShareSeverity(value);
  const percent = value * 100;
  const label = formatPercentValue(percent, "fr-FR");

  if (!severity) {
    return <span>{label}</span>;
  }

  return (
    <div className={cn("flex min-w-[7rem] items-center justify-end gap-2", className)}>
      <div
        className="bg-muted h-1.5 w-14 overflow-hidden rounded-full"
        role="presentation"
        aria-hidden
      >
        <div
          className={cn("h-full rounded-full transition-all", SHARE_BAR_CLASS[severity])}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <span className={cn("tabular-nums text-xs font-medium", SHARE_TEXT_CLASS[severity])}>
        {label}
      </span>
    </div>
  );
}
