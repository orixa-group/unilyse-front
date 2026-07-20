import type { UnilizeStrategySeaTier } from "@/types/strategy";

export function competitorCountTone(count: number): string {
  if (count >= 8) {
    return "bg-destructive/20 text-destructive dark:text-destructive font-semibold";
  }
  if (count >= 4) {
    return "bg-warning/20 text-warning dark:text-warning font-medium";
  }
  return "";
}

export function seaTierTone(
  tier: UnilizeStrategySeaTier | string | null | undefined,
): string {
  const key =
    typeof tier === "string"
      ? tier.toLowerCase().replace(/-/g, "_")
      : tier ?? null;
  if (!key) {
    return "";
  }
  if (key === "below_average") {
    return "bg-destructive/20 text-destructive dark:text-destructive";
  }
  if (key === "above_average") {
    return "bg-success/20 text-success dark:text-success";
  }
  if (key === "average") {
    return "bg-muted/80 text-foreground dark:text-foreground";
  }
  if (key === "unspecified") {
    return "bg-muted/50 text-muted-foreground";
  }
  return "";
}

export function volumeTone(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (value >= 10_000) {
    return "bg-chart-4/20 font-medium dark:bg-chart-4/25";
  }
  if (value >= 1_000) {
    return "bg-chart-4/10 dark:bg-chart-4/15";
  }
  return "";
}

export function pageIntentTone(match: boolean): string {
  return match
    ? "bg-success/20 text-success dark:text-success"
    : "bg-destructive/20 text-destructive dark:text-destructive";
}

export function seoPositionTone(position: number): string {
  if (position <= 3) {
    return "bg-success/20 text-success dark:text-success font-medium";
  }
  if (position > 10) {
    return "bg-warning/20 text-warning dark:text-warning";
  }
  return "";
}

export function optimizationTone(optimized: boolean): string {
  return optimized
    ? "bg-success/20 text-success dark:text-success"
    : "bg-warning/20 text-warning dark:text-warning";
}

export function recommendationTone(
  recommendation: string,
): string {
  const key = recommendation.toUpperCase();
  if (key === "LAUNCH_SEO") {
    return "bg-info/20 text-info dark:text-info";
  }
  if (key === "OPTIMIZE_ADS" || key === "MAINTAIN_ADS") {
    return "bg-chart-1/20 text-chart-1 dark:text-chart-1";
  }
  if (key === "DOUBLE_PRESENCE") {
    return "bg-primary/15 text-primary dark:text-primary";
  }
  if (key === "REVIEW_STRATEGY") {
    return "bg-warning/20 text-warning dark:text-warning";
  }
  if (key === "HUMAN_ARBITRATION") {
    return "bg-secondary/20 text-secondary-foreground dark:text-secondary-foreground";
  }
  if (key === "UNKNOWN") {
    return "bg-muted/50 text-muted-foreground";
  }
  return "bg-muted/80 text-foreground dark:text-foreground";
}
