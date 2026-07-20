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

/** Niveau qualité Google Ads (OpenAPI StrategySEA). */
export type UnilizeStrategySeaTier =
  | "UNSPECIFIED"
  | "UNKNOWN"
  | "BELOW_AVERAGE"
  | "AVERAGE"
  | "ABOVE_AVERAGE";

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

export interface UnilizeKeywordComparison {
  keyword: string;
  recommendation: UnilizeStrategyRecommendation;
  /** Volume de recherche estimé sur la période (OpenAPI KeywordComparison). */
  search_volume: number;
  sea?: UnilizeStrategySea | null;
  seo: UnilizeStrategySeo;
}

export interface UnilizeStrategySummary {
  /** Mots-clés en `LAUNCH_SEO`. */
  seo_keywords_count: number;
  /** Mots-clés en `OPTIMIZE_ADS` ou `MAINTAIN_ADS`. */
  sea_keywords_count: number;
  /** Mots-clés en `DOUBLE_PRESENCE`. */
  hybrid_keywords_count: number;
}

export interface UnilizeNetlinkingGap {
  keyword: string;
  volume: number;
  backlink_gap: number;
}

/** Mot-clé dont la couverture sémantique n’est pas optimisée (OpenAPI SemanticGap). */
export interface UnilizeSemanticGap {
  keyword: string;
}

export interface UnilizeOpportunityMatrixEntry {
  keyword: string;
  volume: number;
  semantic_score?: number;
  position?: number;
}

export interface UnilizeOpportunityMatrix {
  high_impact: UnilizeOpportunityMatrixEntry[];
  low_priority: UnilizeOpportunityMatrixEntry[];
  balanced: UnilizeOpportunityMatrixEntry[];
  quick_wins: UnilizeOpportunityMatrixEntry[];
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
