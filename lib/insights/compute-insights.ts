import { ROUTES } from "@/lib/constants/routes";
import type { UnilizeStrategy } from "@/types/strategy";

export type InsightSeverity = "info" | "warning" | "success" | "critical";

export type Insight = {
  id: string;
  severity: InsightSeverity;
  title: string;
  detail?: string;
  href?: string;
};

export function computeHybridInsights(strategy: UnilizeStrategy | null): Insight[] {
  if (!strategy) {
    return [];
  }

  const insights: Insight[] = [];

  const netlinking = strategy.netlinking_gaps.length;
  if (netlinking > 0) {
    insights.push({
      id: "hybrid-netlinking",
      severity: "info",
      title: `${netlinking} mot${netlinking > 1 ? "s" : ""}-clé avec écart de netlinking`,
      href: ROUTES.STRATEGY,
    });
  }

  return insights.slice(0, 4);
}
