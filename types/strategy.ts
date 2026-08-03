/** Statut d’optimisation SEO (OpenAPI StrategySEO). */
export type UnilizeOptimizationStatus = "optimized" | "not_optimized";

/** Recommandation stratégique par mot-clé (OpenAPI KeywordComparison). */
export type UnilizeStrategyRecommendation =
  | "OPTIMIZE_ADS"
  | "MAINTAIN_ADS"
  | "LAUNCH_SEO"
  | "DOUBLE_PRESENCE"
  | "REVIEW_STRATEGY"
  | "HUMAN_ARBITRATION"
  | "UNKNOWN";

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
export type UnilizeSeaScoringStatus = "high" | "low";

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
  semantic_status?: UnilizeOptimizationStatus;
  authority_status?: UnilizeOptimizationStatus;
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
  time_to_value_score?: number;
  time_to_value_status?: UnilizeScoringLevel;
  potential_gain_score?: number;
  potential_gain_status?: UnilizeScoringLevel;
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
