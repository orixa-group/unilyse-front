/** État de collecte d'une métrique (OpenAPI CollectionState). */
export type UnilizeCollectionState = "in_progress" | "completed";

/** Statut de collecte par source (OpenAPI CollectionStatus). */
export interface UnilizeCollectionStatus {
  sea: UnilizeCollectionState;
  seo: UnilizeCollectionState;
  search_volume: UnilizeCollectionState;
  organic_ranking: UnilizeCollectionState;
  url_authority: UnilizeCollectionState;
  semantic: UnilizeCollectionState;
}

/** Métriques SEA agrégées sur la période (OpenAPI PerformanceSEA). */
export interface UnilizeSeaMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  conversion_value: number;
  quality_score: number;
  match_type: "BROAD" | "PHRASE" | "EXACT";
  search_budget_lost_impression_share: number;
  search_rank_lost_impression_share: number;
  ad_relevance: string;
  expected_ctr: string;
  landing_page_ux: string;
  ctr: number;
  cpc: number;
  conversion_rate: number;
  cost_per_conversion: number;
  roas: number;
  potential_impressions_with_full_budget: number;
  potential_impressions_with_full_rank: number;
}

/** Volume de recherche estimé (OpenAPI PerformanceSearchVolume). */
export interface UnilizeSearchVolume {
  volume: number;
}

/** Scores concurrents top-5 (OpenAPI PerformanceCompetitorScores / NetlinkingCompetitors). */
export interface UnilizeCompetitorScores {
  average_score: number;
  max_score: number;
  min_score: number;
}

/** Métriques SEO Search Console (OpenAPI PerformanceSEO). */
export interface UnilizeSeoMetrics {
  impressions: number;
  clicks: number;
  /** Taux de clic en pourcentage (clics / impressions × 100). */
  ctr: number;
  average_position: number;
  real_time_position: number | null;
  netlinking_competitors: UnilizeCompetitorScores;
  semantic_competitors: UnilizeCompetitorScores;
}

/** Entrée performances par mot-clé (OpenAPI Performance). */
export interface UnilizePerformance {
  keyword: string;
  sea: UnilizeSeaMetrics | null;
  search_volume: UnilizeSearchVolume;
  seo: UnilizeSeoMetrics;
  status: UnilizeCollectionStatus;
  /** Part des recherches sans clic SEA ni SEO, en %. */
  no_click_rate: number;
}

export type ListPerformancesResult = {
  requestUrl: string;
  projectId: string;
  performances: UnilizePerformance[];
  error: string | null;
};
