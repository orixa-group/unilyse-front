import { ROUTES } from "@/lib/constants/routes";
import { resolveStrategyAuthorityLabel } from "@/lib/strategy/resolve-bas-label";
import type { UnilizeKeywordMonitoring } from "@/types/monitoring";
import type { UnilizePerformance } from "@/types/performance";
import type { UnilizeStrategy } from "@/types/strategy";

export type InsightSeverity = "info" | "warning" | "success" | "critical";

export type Insight = {
  id: string;
  severity: InsightSeverity;
  title: string;
  detail?: string;
  href?: string;
};

const BUDGET_LOST_THRESHOLD = 0.2;

export function computeSeaInsights(
  performances: UnilizePerformance[],
  monitoring: UnilizeKeywordMonitoring[] = [],
): Insight[] {
  const insights: Insight[] = [];

  const highBudgetLoss = performances.filter(
    (row) =>
      (row.sea?.search_budget_lost_impression_share ?? 0) > BUDGET_LOST_THRESHOLD,
  ).length;
  if (highBudgetLoss > 0) {
    insights.push({
      id: "sea-budget-loss",
      severity: "warning",
      title: `${highBudgetLoss} mot${highBudgetLoss > 1 ? "s" : ""}-clé avec >20 % d'impressions perdues (budget)`,
      detail: "Augmentez le budget ou réduisez les enchères sur les mots-clés peu performants.",
    });
  }

  const noQualityScore = performances.filter(
    (row) => row.sea && row.sea.quality_score === 0,
  ).length;
  if (noQualityScore > 0) {
    insights.push({
      id: "sea-quality-score",
      severity: "info",
      title: `${noQualityScore} mot${noQualityScore > 1 ? "s" : ""}-clé sans quality score Google`,
      detail: "Le quality score influence le CPC et la part d'impressions.",
    });
  }

  const targets = monitoring.filter((row) => row.status === "target").length;
  if (targets > 0) {
    insights.push({
      id: "sea-monitoring-target",
      severity: "success",
      title: `${targets} opportunité${targets > 1 ? "s" : ""} SEA à cibler`,
      detail: "Concurrence favorable sur ces mots-clés.",
      href: ROUTES.MONITORING,
    });
  }

  return insights.slice(0, 4);
}

export function computeSeoInsights(
  performances: UnilizePerformance[],
  strategy: UnilizeStrategy | null,
): Insight[] {
  const insights: Insight[] = [];

  const underOptimized = performances.filter((row) => {
    const label = resolveStrategyAuthorityLabel(
      strategy?.keyword_comparisons.find((k) => k.keyword === row.keyword)?.seo ??
        null,
    );
    return label === "Sous-optimisé";
  }).length;

  if (underOptimized > 0) {
    insights.push({
      id: "seo-bas",
      severity: "warning",
      title: `${underOptimized} mot${underOptimized > 1 ? "s" : ""}-clé sous-optimisé${underOptimized > 1 ? "s" : ""} (BAS)`,
      detail: "Renforcez l'autorité de la page sur ces requêtes.",
      href: ROUTES.STRATEGY,
    });
  }

  const noSeoData = performances.filter((row) => !row.seo?.impressions).length;
  if (noSeoData > 0) {
    insights.push({
      id: "seo-missing",
      severity: "info",
      title: `${noSeoData} mot${noSeoData > 1 ? "s" : ""}-clé sans impressions SEO`,
      detail: "Vérifiez le positionnement organique ou l'indexation.",
    });
  }

  const semanticGapCount = strategy?.semantic_gaps.length ?? 0;
  if (semanticGapCount > 0) {
    insights.push({
      id: "seo-semantic-gaps",
      severity: "warning",
      title: `${semanticGapCount} écart${semanticGapCount > 1 ? "s" : ""} sémantique${semanticGapCount > 1 ? "s" : ""}`,
      detail: "Enrichissez le contenu par rapport aux concurrents.",
      href: ROUTES.STRATEGY,
    });
  }

  const quickWins = strategy?.opportunity_matrix.quick_wins.length ?? 0;
  if (quickWins > 0) {
    insights.push({
      id: "seo-quick-wins",
      severity: "success",
      title: `${quickWins} quick win${quickWins > 1 ? "s" : ""} SEO identifié${quickWins > 1 ? "s" : ""}`,
      detail: "Positions #1–2 à consolider via netlinking.",
      href: ROUTES.STRATEGY,
    });
  }

  return insights.slice(0, 4);
}

export function computeHybridInsights(strategy: UnilizeStrategy | null): Insight[] {
  if (!strategy) {
    return [];
  }

  const insights: Insight[] = [];
  const { summary } = strategy;

  if (summary.sea_keywords_count > summary.seo_keywords_count) {
    insights.push({
      id: "hybrid-sea-heavy",
      severity: "warning",
      title: "Portefeuille orienté SEA",
      detail: `${summary.sea_keywords_count} recommandations SEA vs ${summary.seo_keywords_count} SEO.`,
    });
  } else if (summary.seo_keywords_count > summary.sea_keywords_count) {
    insights.push({
      id: "hybrid-seo-heavy",
      severity: "success",
      title: "Portefeuille orienté SEO",
      detail: `${summary.seo_keywords_count} recommandations SEO vs ${summary.sea_keywords_count} SEA.`,
    });
  }

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

export function computeMonitoringInsights(
  monitoring: UnilizeKeywordMonitoring[],
): Insight[] {
  const insights: Insight[] = [];
  const targets = monitoring.filter((m) => m.status === "target");
  const consider = monitoring.filter((m) => m.status === "consider");

  if (targets.length > 0) {
    insights.push({
      id: "mon-target",
      severity: "success",
      title: `${targets.length} mot${targets.length > 1 ? "s" : ""}-clé à cibler en priorité`,
      detail: "Forte opportunité SEA selon la concurrence.",
    });
  }

  if (consider.length > 0) {
    insights.push({
      id: "mon-consider",
      severity: "info",
      title: `${consider.length} mot${consider.length > 1 ? "s" : ""}-clé à évaluer`,
      detail: "Opportunité modérée — à arbitrer avec le budget.",
    });
  }

  if (monitoring.length > 0) {
    const avgCompetitors = Math.round(
      monitoring.reduce((sum, m) => sum + m.competitor_count, 0) /
        monitoring.length,
    );
    insights.push({
      id: "mon-avg-competitors",
      severity: "info",
      title: `${avgCompetitors} concurrent${avgCompetitors > 1 ? "s" : ""} en moyenne`,
      detail: "Nombre moyen d'annonceurs actifs sur le portefeuille.",
    });
  }

  return insights.slice(0, 4);
}
