import type {
  UnilizeStrategyRecommendation,
  UnilizeStrategySeaTier,
} from "@/types/strategy";

const RECOMMENDATION_LABELS: Record<UnilizeStrategyRecommendation, string> = {
  OPTIMIZE_ADS: "Optimiser Ads",
  MAINTAIN_ADS: "Maintenir Ads",
  LAUNCH_SEO: "Lancer SEO",
  DOUBLE_PRESENCE: "Double présence",
  REVIEW_STRATEGY: "Revoir la stratégie",
  HUMAN_ARBITRATION: "Arbitrage humain",
  UNKNOWN: "Indéterminé",
};

const TIER_LABELS: Record<string, string> = {
  below_average: "Faible",
  average: "Moyenne",
  above_average: "Haute",
  unspecified: "Non évalué",
  low: "Faible",
  medium: "Moyen",
  high: "Élevé",
};

/** Normalise les valeurs Google Ads (BELOW_AVERAGE → below_average). */
export function normalizeSeaTierKey(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }
  return value.toLowerCase().replace(/-/g, "_");
}

export const STRATEGY_COLUMN_LABELS = {
  keyword: "Mot-clé",
  recommendation: "Recommandation",
  search_volume: "Volume rech.",
  budget_lost: "Impr. perdues (budget)",
  rank_lost: "Impr. perdues (rank)",
  ad_relevance: "Pertinence annonce",
  expected_ctr: "CTR attendu",
  landing_page_ux: "Expérience landing",
  impression_share: "Part d'impressions",
  cpc: "CPC",
  conversion_rate: "Taux de conversion",
  authority_status: "Statut autorité",
  semantic_status: "Statut sémantique",
  position: "Position SEO",
  page_intent_match: "Correspondance d'intention",
} as const;

export const OPPORTUNITY_QUADRANT_LABELS = {
  high_impact: "Fort impact SEO",
  low_priority: "Priorité basse",
  balanced: "Équilibré",
  quick_wins: "Quick wins",
} as const;

export const OPPORTUNITY_QUADRANT_DESCRIPTIONS = {
  high_impact:
    "Volume élevé et score sémantique suffisant — prioriser l’investissement SEO.",
  low_priority:
    "Score sémantique faible — effort SEO élevé, privilégier le SEA à court terme.",
  balanced: "Volume et score moyens — approche hybride SEO / SEA.",
  quick_wins:
    "Déjà classé #1 ou #2 — maintenir et renforcer via le netlinking.",
} as const;

export function formatStrategyRecommendation(
  value: UnilizeStrategyRecommendation | string | null | undefined,
): string {
  if (!value) {
    return "—";
  }
  const key = value.toUpperCase() as UnilizeStrategyRecommendation;
  return RECOMMENDATION_LABELS[key] ?? String(value);
}

export function formatStrategySeaTier(
  value: UnilizeStrategySeaTier | string | null | undefined,
): string {
  const key = normalizeSeaTierKey(
    typeof value === "string" ? value : (value ?? null),
  );
  if (!key) {
    return "—";
  }
  return TIER_LABELS[key] ?? value ?? "—";
}

export function formatPageIntentMatch(value: boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return value ? "Oui" : "Non";
}
