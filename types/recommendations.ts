/** Action recommandée (OpenAPI Recommendation.action). */
export type UnilizeRecommendationAction =
  | "optimize_ads"
  | "maintain_ads"
  | "reduce_ads"
  | "launch_seo"
  | "maintain_seo"
  | "withdraw_seo"
  | "double_presence"
  | "human_arbitration";

export type UnilizeGapObjective = "launch_seo" | "double_presence";

export type UnilizeRating =
  | "below_average"
  | "average"
  | "above_average"
  | null;

export type UnilizePaidConversionsStatus =
  | "performing"
  | "inefficient"
  | "underfed"
  | "none";

export type UnilizeSemanticGapStatus =
  | "leader"
  | "optimized"
  | "improvable"
  | "degraded";

export type UnilizeAuthorityGapStatus =
  | "leader"
  | "optimized"
  | "improvable"
  | "weakened"
  | "degraded";

export interface UnilizePaidAssessment {
  score: number;
  reason: string;
  search_volume_potential: "low" | "medium" | "high";
  injectable_budget: "low" | "moderate" | "high";
  conversions: UnilizePaidConversionsStatus;
  incremental_ctr:
    | "threshold_reached"
    | "rank_constrained"
    | "unconstrained";
  ad_relevance: UnilizeRating;
  expected_ctr: UnilizeRating;
  landing_page_ux: UnilizeRating;
  impression_share: number;
  cpc: number;
  conversion_rate: number;
}

export interface UnilizeOrganicAssessment {
  score: number;
  reason: string;
  average_position: number | null;
  /** Dernière position observée (instantané), distincte de la moyenne Search Console. */
  ranking_position: number | null;
  semantic_gap: UnilizeSemanticGapStatus;
  authority_gap: UnilizeAuthorityGapStatus;
  effort: "low" | "medium" | "high";
  accessibility: "low" | "medium" | "high";
  delay: "short" | "medium" | "long" | "very_long";
  potential_gain: "low" | "medium" | "high";
  authority_score: number | null;
  competitors_authority_score: number | null;
  semantic_score: number | null;
  competitors_semantic_score: number | null;
}

export interface UnilizeRecommendation {
  action: UnilizeRecommendationAction;
  guidance: string;
  analyzed_on: string;
  from: string;
  until: string;
  search_volume: number | null;
  paid: UnilizePaidAssessment | null;
  organic: UnilizeOrganicAssessment | null;
}

export interface UnilizeKeywordRecommendation {
  keyword: string;
  recommendation: UnilizeRecommendation | null;
}

export interface UnilizeStrategySummary {
  seo_keywords_count: number;
  sea_keywords_count: number;
  hybrid_keywords_count: number;
}

export interface UnilizeOpportunity {
  keyword_count: number;
  volume: number;
}

export interface UnilizeOpportunityMatrix {
  optimize_ads: UnilizeOpportunity;
  maintain_ads: UnilizeOpportunity;
  reduce_ads: UnilizeOpportunity;
  launch_seo: UnilizeOpportunity;
  maintain_seo: UnilizeOpportunity;
  withdraw_seo: UnilizeOpportunity;
  double_presence: UnilizeOpportunity;
  human_arbitration: UnilizeOpportunity;
}

export interface UnilizeRecommendationGap {
  keyword: string;
  volume: number | null;
  priority: number;
  current_score: number;
  target_score: number;
  gap: number;
  objective: UnilizeGapObjective;
}

/** Réponse OpenAPI GET /projects/{id}/recommendations (enveloppe `data`). */
export interface UnilizeProjectRecommendations {
  keywords: UnilizeKeywordRecommendation[];
  summary: UnilizeStrategySummary;
  opportunity_matrix: UnilizeOpportunityMatrix;
  netlinking_gaps: UnilizeRecommendationGap[];
  semantic_gaps: UnilizeRecommendationGap[];
}

export function emptyProjectRecommendations(): UnilizeProjectRecommendations {
  const emptyOpportunity = (): UnilizeOpportunity => ({
    keyword_count: 0,
    volume: 0,
  });
  return {
    keywords: [],
    summary: {
      seo_keywords_count: 0,
      sea_keywords_count: 0,
      hybrid_keywords_count: 0,
    },
    opportunity_matrix: {
      optimize_ads: emptyOpportunity(),
      maintain_ads: emptyOpportunity(),
      reduce_ads: emptyOpportunity(),
      launch_seo: emptyOpportunity(),
      maintain_seo: emptyOpportunity(),
      withdraw_seo: emptyOpportunity(),
      double_presence: emptyOpportunity(),
      human_arbitration: emptyOpportunity(),
    },
    netlinking_gaps: [],
    semantic_gaps: [],
  };
}

/** Query OpenAPI : paramètre `date` (dernière analyse ≤ ce jour). */
export type UnilizeRecommendationsQuery = {
  date?: string;
};

export type ListRecommendationsResult = {
  requestUrl: string;
  projectId: string;
  projectRecommendations: UnilizeProjectRecommendations;
  error: string | null;
};
