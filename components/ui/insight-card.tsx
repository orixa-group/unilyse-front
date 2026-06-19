import Link from "next/link";
import { Surface } from "@/components/ui/surface";
import type { Insight } from "@/lib/insights/compute-insights";
import { cn } from "@/lib/utils/cn";

const SEVERITY_STYLES = {
  info: "border-info/30 bg-info/5",
  warning: "border-warning/40 bg-warning/5",
  success: "border-success/30 bg-success/5",
  critical: "border-destructive/40 bg-destructive/5",
} as const;

export function InsightCard({ insight }: { insight: Insight }) {
  const content = (
    <Surface
      variant="muted"
      padding="md"
      className={cn(
        "min-w-[240px] max-w-sm shrink-0 space-y-1",
        SEVERITY_STYLES[insight.severity],
      )}
    >
      <p className="text-sm font-medium leading-snug">{insight.title}</p>
      {insight.detail ? (
        <p className="text-muted-foreground text-xs leading-relaxed">
          {insight.detail}
        </p>
      ) : null}
      {insight.href ? (
        <p className="text-primary text-xs font-medium">Voir le détail →</p>
      ) : null}
    </Surface>
  );

  if (insight.href) {
    return (
      <Link href={insight.href} className="block shrink-0">
        {content}
      </Link>
    );
  }

  return content;
}
