import type { UnilizeStrategySeaTier } from "@/types/strategy";

export function competitorCountTone(count: number): string {
  if (count >= 8) {
    return "bg-destructive/30 text-destructive dark:text-destructive font-semibold";
  }
  if (count >= 4) {
    return "bg-warning/30 text-warning dark:text-warning font-medium";
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
    return "bg-destructive/30 text-destructive dark:text-destructive";
  }
  if (key === "above_average") {
    return "bg-success/30 text-success dark:text-success";
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
    return "bg-chart-4/30 font-medium dark:bg-chart-4/30";
  }
  if (value >= 1_000) {
    return "bg-chart-4/15 dark:bg-chart-4/20";
  }
  return "";
}

export function recommendationTone(
  recommendation: string,
): string {
  const key = recommendation.toUpperCase();
  if (key === "LAUNCH_SEO") {
    return "bg-info/30 text-info dark:text-info";
  }
  if (key === "OPTIMIZE_ADS" || key === "MAINTAIN_ADS") {
    return "bg-chart-1/30 text-chart-1 dark:text-chart-1";
  }
  if (key === "DOUBLE_PRESENCE") {
    return "bg-primary/20 text-primary dark:text-primary";
  }
  if (key === "REVIEW_STRATEGY") {
    return "bg-warning/30 text-warning dark:text-warning";
  }
  if (key === "HUMAN_ARBITRATION") {
    return "bg-secondary/30 text-secondary-foreground dark:text-secondary-foreground";
  }
  if (key === "UNKNOWN") {
    return "bg-muted/50 text-muted-foreground";
  }
  return "bg-muted/80 text-foreground dark:text-foreground";
}

export type ScoringLevelPolarity = "positive" | "cost";

/**
 * Tone pour low|medium|high.
 * - positive (statut SEA, gain) : high = bon
 * - cost (effort, délai) : high = coûteux / long
 */
export function scoringLevelTone(
  level: string | null | undefined,
  polarity: ScoringLevelPolarity = "positive",
): string {
  const key = level?.toLowerCase() ?? null;
  if (!key) {
    return "";
  }
  if (polarity === "cost") {
    if (key === "high") {
      return "bg-warning/30 text-warning dark:text-warning";
    }
    if (key === "medium") {
      return "bg-muted/80 text-foreground dark:text-foreground";
    }
    if (key === "low") {
      return "bg-success/30 text-success dark:text-success";
    }
    return "";
  }
  if (key === "high") {
    return "bg-success/30 text-success dark:text-success";
  }
  if (key === "medium") {
    return "bg-muted/80 text-foreground dark:text-foreground";
  }
  if (key === "low") {
    return "bg-warning/30 text-warning dark:text-warning";
  }
  return "";
}

export function optimizationStatusTone(
  status: "optimized" | "not_optimized" | string | null | undefined,
): string {
  const key =
    typeof status === "string"
      ? status.toLowerCase().replace(/-/g, "_")
      : status ?? null;
  if (key === "optimized") {
    return "bg-success/30 text-success dark:text-success";
  }
  if (key === "not_optimized" || key === "under_optimized") {
    return "bg-warning/30 text-warning dark:text-warning";
  }
  return "";
}
