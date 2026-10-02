/** État de collecte d'une métrique (OpenAPI v2 AcquisitionState). */
export type UnilizeAcquisitionState =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | null;

/** Statut de collecte par source (OpenAPI Acquisitions). */
export interface UnilizeAcquisitions {
  paid_performances: UnilizeAcquisitionState;
  organic_performances: UnilizeAcquisitionState;
  search_volumes: UnilizeAcquisitionState;
  organic_rankings: UnilizeAcquisitionState;
  url_authorities: UnilizeAcquisitionState;
  page_semantics: UnilizeAcquisitionState;
}

/** Métriques SEA agrégées sur la période (OpenAPI PaidPerformances). */
export interface UnilizePaidPerformances {
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversion_value: number;
  quality_score: number;
  search_budget_lost_impression_share: number;
  search_rank_lost_impression_share: number;
  ad_relevance: string | null;
  expected_ctr: string | null;
  landing_page_ux: string | null;
  /** Fraction 0–1. */
  ctr: number;
  cpc: number;
  /** Fraction 0–1. */
  conversion_rate: number;
  cost_per_conversion: number;
  roas: number;
  potential_impressions_with_full_budget: number;
  potential_impressions_with_full_rank: number;
}

/** Volume de recherche estimé (OpenAPI SearchVolume). */
export interface UnilizeSearchVolume {
  volume: number;
}

/** Métriques SEO Search Console (OpenAPI OrganicPerformances). */
export interface UnilizeOrganicPerformances {
  impressions: number;
  clicks: number;
  /** Fraction 0–1. */
  ctr: number;
  average_position: number;
}

/** Classement organique (OpenAPI OrganicRanking). */
export interface UnilizeOrganicRanking {
  position: number | null;
}

/** Spread average / max / min (OpenAPI Spread). */
export interface UnilizeSpread {
  average: number;
  max: number;
  min: number;
}

/** Forme legacy simplifiée (migration intermédiaire). */
export interface UnilizeCompetitorScores {
  average: number;
  max: number;
  min: number;
}

export function isLegacyCompetitorScores(
  value: UnilizeSpread | UnilizeCompetitorScores | null | undefined,
): value is UnilizeCompetitorScores {
  return (
    value !== null &&
    value !== undefined &&
    "average" in value &&
    !("score" in (value as object)) &&
    !("authority_score" in (value as object))
  );
}

export interface UnilizePageAuthority {
  url: string;
  authority_score: number;
  page_trust: number;
  backlinks_external: number;
  backlinks_domains: number;
}

export interface UnilizeCompetitorAuthorities {
  authority_score: UnilizeSpread;
  page_trust: UnilizeSpread;
  backlinks_external: UnilizeSpread;
  backlinks_domains: UnilizeSpread;
}

export interface UnilizeUrlAuthorities {
  ours: UnilizePageAuthority | null;
  competitors: UnilizeCompetitorAuthorities | UnilizeCompetitorScores | null;
}

export interface UnilizePageSemanticScores {
  url: string;
  position: number;
  score: number;
  word_count: number;
}

export interface UnilizeCompetitorSemantics {
  score: UnilizeSpread;
  word_count: UnilizeSpread;
}

export interface UnilizePageSemantics {
  ours: UnilizePageSemanticScores | null;
  competitors: UnilizeCompetitorSemantics | UnilizeCompetitorScores | null;
}

export interface UnilizePreviousPerformances {
  from: string;
  until: string;
  paid_performances: UnilizePaidPerformances | null;
  organic_performances: UnilizeOrganicPerformances | null;
  search_volume: UnilizeSearchVolume | null;
}

/** Entrée performances par mot-clé (OpenAPI KeywordPerformances). */
export interface UnilizePerformance {
  keyword: string;
  paid_performances: UnilizePaidPerformances | null;
  organic_performances: UnilizeOrganicPerformances | null;
  search_volume: UnilizeSearchVolume | null;
  organic_ranking: UnilizeOrganicRanking | null;
  url_authorities: UnilizeUrlAuthorities | null;
  page_semantics: UnilizePageSemantics | null;
  /** Fraction 0–1, ou null si volume inconnu / nul. */
  no_click_rate: number | null;
  previous?: UnilizePreviousPerformances;
  acquisitions: UnilizeAcquisitions | null;
}

export type ListPerformancesResult = {
  requestUrl: string;
  projectId: string;
  performances: UnilizePerformance[];
  error: string | null;
};
