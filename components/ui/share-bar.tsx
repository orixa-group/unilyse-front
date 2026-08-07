import { cn } from "@/lib/utils/cn";
import {
  getShareSeverity,
  getWonShareSeverity,
  SHARE_BAR_CLASS,
  SHARE_TEXT_CLASS,
  WON_SHARE_BAR_CLASS,
  WON_SHARE_TEXT_CLASS,
  type ShareBarVariant,
} from "@/lib/ui/table-visual";
import { formatPercentValue } from "@/lib/utils/formatting";

export function ShareBar({
  value,
  variant = "lost",
  className,
}: {
  /** Part entre 0 et 1 (ex. 0.25 = 25 %). */
  value: number | null | undefined;
  /**
   * `lost` = impr. perdues (élevé = rouge, Performances).
   * `won` = part obtenue (élevé = vert, Stratégie).
   */
  variant?: ShareBarVariant;
  className?: string;
}) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  const severity =
    variant === "won" ? getWonShareSeverity(value) : getShareSeverity(value);
  const percent = value * 100;
  const label = formatPercentValue(percent, "fr-FR");
  const barClass = variant === "won" ? WON_SHARE_BAR_CLASS : SHARE_BAR_CLASS;
  const textClass = variant === "won" ? WON_SHARE_TEXT_CLASS : SHARE_TEXT_CLASS;

  if (!severity) {
    return <span>{label}</span>;
  }

  return (
    <div
      className={cn(
        "flex min-w-[7rem] items-center justify-center gap-2",
        className,
      )}
    >
      <div
        className="bg-muted h-1.5 w-14 overflow-hidden rounded-full"
        role="presentation"
        aria-hidden
      >
        <div
          className={cn("h-full rounded-full transition-all", barClass[severity])}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <span className={cn("tabular-nums text-xs font-medium", textClass[severity])}>
        {label}
      </span>
    </div>
  );
}
