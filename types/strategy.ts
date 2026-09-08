/** Statut sémantique SEO (OpenAPI StrategySEO.semantic_status). */
export type UnilizeSemanticStatus =
  | "leader"
  | "optimized"
  | "to_optimize"
  | "degraded";

/** Statut autorité / netlinking SEO (OpenAPI StrategySEO.authority_status). */
export type UnilizeAuthorityStatus =
  | "leader"
  | "optimized"
  | "to_optimize"
  | "fairly_degraded"
  | "degraded";

/** Délai avant valeur SEO (OpenAPI KeywordComparisonScoringSEO.delay_status). */
export type UnilizeDelayStatus = "short" | "medium" | "long";

/** Recommandation stratégique par mot-clé (OpenAPI KeywordComparison). */
export type UnilizeStrategyRecommendation =
  | "OPTIMIZE_ADS"
  | "MAINTAIN_ADS"
  | "LAUNCH_SEO"
  | "DOUBLE_PRESENCE"
  | "REVIEW_STRATEGY"
  | "HUMAN_ARBITRATION"
  | "UNKNOWN";

/** Règle qui a produit `recommendation` (OpenAPI KeywordComparison.trigger). */
export type UnilizeRecommendationTrigger =
  | "quality_score"
  | "no_data"
  | "no_conversions"
  | "matrix";

/** Action applicable par un expert (OpenAPI Decision.applied — sans UNKNOWN). */
export type UnilizeDecisionApplied = Exclude<
  UnilizeStrategyRecommendation,
  "UNKNOWN"
>;

/** Décision expert (OpenAPI Decision). */
export interface UnilizeDecision {
  id: string;
  keyword: string;
  applied: UnilizeDecisionApplied;
  recommended: UnilizeStrategyRecommendation;
  justification: string;
  decided_by: string;
  decided_at: string;
  created_at: string;
  updated_at: string;
}

/** Objectif d’un gap netlinking / contenu. */
export type UnilizeGapObjective = "LAUNCH_SEO" | "DOUBLE_PRESENCE";

/** Niveau qualité Google Ads (OpenAPI StrategySEA). */
export type UnilizeStrategySeaTier =
  | "UNSPECIFIED"
  | "UNKNOWN"
  | "BELOW_AVERAGE"
  | "AVERAGE"
  | "ABOVE_AVERAGE";

export type UnilizeScoringLevel = "low" | "medium" | "high";
export type UnilizeSeaScoringStatus =
  | "low"
  | "medium_low"
  | "medium_high"
  | "high";

/** Score dimension SEA D1–D5 (échelle 1–5). */
export type UnilizeSeaDimensionScore = 1 | 2 | 3 | 4 | 5;

/** Indicateurs SEA stratégie (OpenAPI StrategySEA). */
export interface UnilizeStrategySea {
  ad_relevance: UnilizeStrategySeaTier;
  expected_ctr: UnilizeStrategySeaTier;
  landing_page_ux: UnilizeStrategySeaTier;
  impression_share: number;
  cpc: number;
  conversion_rate: number;
  search_budget_lost_impression_share: number;
  search_rank_lost_impression_share: number;
}

/** Indicateurs SEO stratégie (OpenAPI StrategySEO — champs optionnels). */
export interface UnilizeStrategySeo {
  position?: number;
  page_intent_match?: boolean;
  semantic_status?: UnilizeSemanticStatus;
  authority_status?: UnilizeAuthorityStatus;
}

/** Scores intermédiaires SEA (OpenAPI KeywordComparisonScoringSEA). */
export interface UnilizeKeywordComparisonScoringSea {
  potential_search_volume_score: number;
  budget_score: number;
  conversion_score: number;
  ad_score: number;
  ctr_incremental_score: number;
  score: number;
  status: UnilizeSeaScoringStatus;
}

/** Scores intermédiaires SEO (OpenAPI KeywordComparisonScoringSEO). */
export interface UnilizeKeywordComparisonScoringSeo {
  effort_score?: number;
  effort_status?: UnilizeScoringLevel;
  delay_score?: number;
  delay_status?: UnilizeDelayStatus;
  potential_gain_score?: number;
  potential_gain_status?: UnilizeScoringLevel;
  /** E3 inversé 0–1 — `1 - effort_score / 6`, entrée de `invest_score`. */
  accessibility_score?: number;
  /** S_SEO_invest (0–10) — priorisation SEO au sein du fichier recommandation. */
  invest_score?: number;
  semantic_score?: number;
  authority_score?: number;
}

export interface UnilizeKeywordComparisonScoring {
  sea?: UnilizeKeywordComparisonScoringSea;
  seo?: UnilizeKeywordComparisonScoringSeo;
}

export interface UnilizeKeywordComparison {
  keyword: string;
  recommendation: UnilizeStrategyRecommendation;
  /** Règle qui a produit la recommandation — omis si `UNKNOWN`. */
  trigger?: UnilizeRecommendationTrigger;
  /** Volume de recherche estimé sur la période (OpenAPI KeywordComparison). */
  search_volume: number;
  sea?: UnilizeStrategySea | null;
  seo: UnilizeStrategySeo;
  scoring: UnilizeKeywordComparisonScoring;
}

export interface UnilizeStrategySummary {
  /** Mots-clés en `LAUNCH_SEO`. */
  seo_keywords_count: number;
  /** Mots-clés en `OPTIMIZE_ADS` ou `MAINTAIN_ADS`. */
  sea_keywords_count: number;
  /** Mots-clés en `DOUBLE_PRESENCE`. */
  hybrid_keywords_count: number;
}

/** Gap netlinking ou contenu (OpenAPI NetlinkingGap / SemanticGap). */
export interface UnilizeWorkGap {
  keyword: string;
  volume: number;
  priority: number;
  current_score: number;
  target_score: number;
  gap: number;
  objective: UnilizeGapObjective;
}

export type UnilizeNetlinkingGap = UnilizeWorkGap;
export type UnilizeSemanticGap = UnilizeWorkGap;

/** Bucket matrice d’opportunités (OpenAPI OpportunityMatrixBucket). */
export interface UnilizeOpportunityMatrixBucket {
  keyword_count: number;
  volume: number;
}

export interface UnilizeOpportunityMatrix {
  launch_seo: UnilizeOpportunityMatrixBucket;
  double_presence: UnilizeOpportunityMatrixBucket;
  maintain_ads: UnilizeOpportunityMatrixBucket;
  review_strategy: UnilizeOpportunityMatrixBucket;
}

export interface UnilizeStrategy {
  summary: UnilizeStrategySummary;
  keyword_comparisons: UnilizeKeywordComparison[];
  netlinking_gaps: UnilizeNetlinkingGap[];
  semantic_gaps: UnilizeSemanticGap[];
  opportunity_matrix: UnilizeOpportunityMatrix;
}

export type GetStrategyResult = {
  requestUrl: string;
  projectId: string;
  strategy: UnilizeStrategy | null;
  error: string | null;
};
