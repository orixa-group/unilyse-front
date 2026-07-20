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

/** Métriques SEO Search Console (OpenAPI PerformanceSEO). */
export interface UnilizeSeoMetrics {
  impressions: number;
  clicks: number;
  /** Taux de clic en pourcentage (clics / impressions × 100). */
  ctr: number;
}

/** Entrée performances par mot-clé (OpenAPI Performance). */
export interface UnilizePerformance {
  keyword: string;
  sea: UnilizeSeaMetrics | null;
  search_volume: UnilizeSearchVolume;
  seo: UnilizeSeoMetrics;
}

export type ListPerformancesResult = {
  requestUrl: string;
  projectId: string;
  performances: UnilizePerformance[];
  error: string | null;
};
