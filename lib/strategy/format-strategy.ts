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
  ad_relevance: "Pertinence annonce",
  expected_ctr: "CTR attendu",
  landing_page_ux: "Expérience landing",
  impression_share: "Part d'impressions",
  cpc: "CPC",
  conversion_rate: "Taux de conversion",
  sea_score: "Score SEA",
  sea_status: "Statut SEA",
  d1_volume: "Volume potentiel",
  d2_budget: "Budget injectable",
  d3_conversion: "Conversion",
  d4_ad: "Quality + conviv.",
  d5_ctr: "CTR incrémental",
  seo_position: "Position SEO",
  content_label: "Contenu",
  popularity_label: "Popularité",
  effort_status: "Effort SEO",
  e4_delay: "Délai",
  e5_gain: "Gain potentiel",
  time_to_value_status: "Délai SEO",
  potential_gain_status: "Gain SEO",
  s_seo_invest: "S_SEO_invest",
  note: "Note",
} as const;

export const OPPORTUNITY_BUCKET_LABELS = {
  launch_seo: "Lancer SEO",
  double_presence: "Double présence",
  maintain_ads: "Maintenir Ads",
  review_strategy: "Revoir la stratégie",
} as const;

export const OPPORTUNITY_BUCKET_DESCRIPTIONS = {
  launch_seo:
    "Mots-clés recommandés pour un investissement SEO organique.",
  double_presence:
    "Mots-clés à travailler à la fois en SEA et en SEO.",
  maintain_ads:
    "SEA performant — maintenir l’investissement publicitaire actuel.",
  review_strategy:
    "Ciblage à reconsidérer (SEA faible et effort SEO peu pertinent).",
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

/** Normalise low|medium|high (insensible à la casse). */
export function normalizeScoringLevelKey(
  value: string | null | undefined,
): "low" | "medium" | "high" | null {
  if (!value) {
    return null;
  }
  const key = value.toLowerCase();
  if (key === "low" || key === "medium" || key === "high") {
    return key;
  }
  return null;
}

export function formatScoringLevel(
  value: string | null | undefined,
): string {
  const key = normalizeScoringLevelKey(value);
  if (!key) {
    return "—";
  }
  return TIER_LABELS[key] ?? value ?? "—";
}
