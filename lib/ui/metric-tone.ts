type UnilizeSeaDimensionScore = 1 | 2 | 3 | 4 | 5;
type UnilizeSeaScoringStatus =
  | "high"
  | "medium_high"
  | "medium_low"
  | "low";
type UnilizeStrategySeaTier =
  | "below_average"
  | "average"
  | "above_average"
  | "unspecified";

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
  const key = recommendation.toUpperCase().replace(/-/g, "_");
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
    return "bg-chart-5/25 text-chart-5 dark:text-chart-5";
  }
  if (key === "HUMAN_ARBITRATION") {
    return "bg-warning/20 text-warning dark:text-warning";
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
  status: string | null | undefined,
): string {
  const key =
    typeof status === "string"
      ? status.toLowerCase().replace(/-/g, "_")
      : status ?? null;
  if (!key) {
    return "";
  }
  if (key === "leader") {
    return "bg-success/30 text-success dark:text-success";
  }
  if (key === "optimized") {
    return "bg-muted/80 text-foreground dark:text-foreground";
  }
  if (key === "to_optimize" || key === "not_optimized" || key === "under_optimized") {
    return "bg-warning/30 text-warning dark:text-warning";
  }
  if (key === "fairly_degraded") {
    return "bg-warning/20 text-warning dark:text-warning";
  }
  if (key === "degraded") {
    return "bg-destructive/30 text-destructive dark:text-destructive";
  }
  return "";
}

export function delayStatusTone(status: string | null | undefined): string {
  const key = status?.toLowerCase() ?? null;
  if (!key) {
    return "";
  }
  if (key === "short") {
    return "bg-success/30 text-success dark:text-success";
  }
  if (key === "medium") {
    return "bg-muted/80 text-foreground dark:text-foreground";
  }
  if (key === "long" || key === "very_long") {
    return "bg-warning/30 text-warning dark:text-warning";
  }
  return "";
}

export function seaDimensionScoreTone(
  score: UnilizeSeaDimensionScore,
): string {
  switch (score) {
    case 5:
      return "bg-success/30 text-success dark:text-success";
    case 4:
      return "bg-success/15 text-success dark:text-success";
    case 3:
      return "bg-warning/15 text-warning dark:text-warning";
    case 2:
      return "bg-warning/30 text-warning dark:text-warning";
    case 1:
      return "bg-destructive/30 text-destructive dark:text-destructive";
    default:
      return "";
  }
}

/** Score 0–10 (reco SEA/SEO). */
export function numericScoreTone(score: number | null | undefined): string {
  if (score === null || score === undefined || !Number.isFinite(score)) {
    return "";
  }
  if (score >= 7) {
    return "bg-success/30 text-success dark:text-success";
  }
  if (score >= 4) {
    return "bg-muted/80 text-foreground dark:text-foreground";
  }
  return "bg-destructive/30 text-destructive dark:text-destructive";
}

export function semanticGapTone(gap: string | null | undefined): string {
  const key = gap?.toLowerCase();
  if (key === "leader" || key === "optimized") {
    return "bg-success/30 text-success dark:text-success";
  }
  if (key === "improvable") {
    return "bg-warning/30 text-warning dark:text-warning";
  }
  if (key === "degraded") {
    return "bg-destructive/30 text-destructive dark:text-destructive";
  }
  return "";
}

export function authorityGapTone(gap: string | null | undefined): string {
  const key = gap?.toLowerCase();
  if (key === "leader" || key === "optimized") {
    return "bg-success/30 text-success dark:text-success";
  }
  if (key === "improvable") {
    return "bg-warning/30 text-warning dark:text-warning";
  }
  if (key === "weakened") {
    return "bg-chart-5/25 text-chart-5 dark:text-chart-5";
  }
  if (key === "degraded") {
    return "bg-destructive/30 text-destructive dark:text-destructive";
  }
  return "";
}

export function paidConversionsTone(
  status: string | null | undefined,
): string {
  const key = status?.toLowerCase();
  if (key === "performing") {
    return "bg-success/30 text-success dark:text-success";
  }
  if (key === "inefficient") {
    return "bg-destructive/30 text-destructive dark:text-destructive";
  }
  if (key === "underfed") {
    return "bg-warning/30 text-warning dark:text-warning";
  }
  if (key === "none") {
    return "bg-muted/50 text-muted-foreground";
  }
  return "";
}

export function seaScoringStatusTone(
  status: UnilizeSeaScoringStatus,
): string {
  switch (status) {
    case "high":
      return "bg-success/30 text-success dark:text-success";
    case "medium_high":
      return "bg-success/15 text-success dark:text-success";
    case "medium_low":
      return "bg-warning/30 text-warning dark:text-warning";
    case "low":
      return "bg-destructive/30 text-destructive dark:text-destructive";
    default:
      return "";
  }
}
