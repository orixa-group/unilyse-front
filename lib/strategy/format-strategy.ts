import type {
  UnilizeRecommendationTrigger,
  UnilizeSeaDimensionScore,
  UnilizeSeaScoringStatus,
  UnilizeStrategyRecommendation,
  UnilizeStrategySeaTier,
} from "@/types/strategy";

const TRIGGER_LABELS: Record<UnilizeRecommendationTrigger, string> = {
  quality_score: "Quality Score",
  no_data: "Données insuffisantes",
  no_conversions: "Sans conversion",
  matrix: "Matrice",
};

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
  delay_status: "Délai SEO",
  potential_gain_status: "Gain SEO",
  s_seo_invest: "S_SEO_invest",
  note: "Règle",
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

export function formatRecommendationTrigger(
  value: UnilizeRecommendationTrigger | string | null | undefined,
): string {
  if (!value) {
    return "—";
  }
  const key = value.toLowerCase().replace(/-/g, "_") as UnilizeRecommendationTrigger;
  return TRIGGER_LABELS[key] ?? String(value);
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

const DELAY_STATUS_LABELS: Record<string, string> = {
  short: "Court",
  medium: "Moyen",
  long: "Long",
};

/** Normalise short|medium|long (insensible à la casse). */
export function normalizeDelayStatusKey(
  value: string | null | undefined,
): "short" | "medium" | "long" | null {
  if (!value) {
    return null;
  }
  const key = value.toLowerCase();
  if (key === "short" || key === "medium" || key === "long") {
    return key;
  }
  return null;
}

export function formatDelayStatus(
  value: string | null | undefined,
): string {
  const key = normalizeDelayStatusKey(value);
  if (!key) {
    return "—";
  }
  return DELAY_STATUS_LABELS[key] ?? value ?? "—";
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

const SEA_DIMENSION_SCORES: UnilizeSeaDimensionScore[] = [1, 2, 3, 4, 5];

const SEA_DIMENSION_SCORE_LABELS: Record<UnilizeSeaDimensionScore, string> = {
  1: "Très faible",
  2: "Faible",
  3: "Moyen",
  4: "Bien",
  5: "Très bien",
};

/** Valide un score dimension SEA sur l'échelle 1–5. */
export function normalizeSeaDimensionScore(
  value: number | null | undefined,
): UnilizeSeaDimensionScore | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }
  const rounded = Math.round(value);
  return SEA_DIMENSION_SCORES.includes(rounded as UnilizeSeaDimensionScore)
    ? (rounded as UnilizeSeaDimensionScore)
    : null;
}

export function formatSeaDimensionScore(
  value: number | null | undefined,
): string {
  const level = normalizeSeaDimensionScore(value);
  if (!level) {
    return "—";
  }
  return SEA_DIMENSION_SCORE_LABELS[level];
}

const SEA_SCORING_STATUS_LABELS: Record<UnilizeSeaScoringStatus, string> = {
  low: "Faible",
  medium_low: "Moyen bas",
  medium_high: "Moyen haut",
  high: "Élevé",
};

/** Normalise low|medium_low|medium_high|high (insensible à la casse). */
export function normalizeSeaScoringStatusKey(
  value: string | null | undefined,
): UnilizeSeaScoringStatus | null {
  if (!value) {
    return null;
  }
  const key = value.toLowerCase().replace(/-/g, "_");
  if (
    key === "low" ||
    key === "medium_low" ||
    key === "medium_high" ||
    key === "high"
  ) {
    return key;
  }
  return null;
}

export function formatSeaScoringStatus(
  value: string | null | undefined,
): string {
  const key = normalizeSeaScoringStatusKey(value);
  if (!key) {
    return "—";
  }
  return SEA_SCORING_STATUS_LABELS[key];
}
