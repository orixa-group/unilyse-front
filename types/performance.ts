/** Période de reporting (OpenAPI Period). */
export interface UnilizePerformancePeriod {
  from: string;
  to: string;
}

/** Métriques SEA par mot-clé (OpenAPI SEA). */
export interface UnilizeSeaMetrics {
  campaign: string;
  keyword: string;
  period: UnilizePerformancePeriod;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  conversion_value: number;
  quality_score: number;
  match_type: "BROAD" | "PHRASE" | "EXACT";
  search_budget_lost_impression_share: number;
  search_rank_lost_impression_share: number;
  ctr: number;
  cpc: number;
  conversion_rate: number;
  cost_per_conversion: number;
  roas: number;
  potential_impressions_with_full_budget: number;
  potential_impressions_with_full_rank: number;
}

/** Volume de recherche mensuel (OpenAPI SearchVolume). */
export interface UnilizeSearchVolume {
  keyword: string;
  period: UnilizePerformancePeriod;
  volume: number;
}

import type {
  UnilizeBasStatusCode,
  UnilizeOptimizationStatus,
} from "@/types/strategy";

/** Métriques SEO sur l’URL du projet (OpenAPI SEO). */
export interface UnilizeSeoMetrics {
  keyword: string;
  url: string;
  period: UnilizePerformancePeriod;
  impressions: number;
  clicks: number;
  /** Taux de clic en pourcentage (clics / impressions × 100). */
  ctr: number;
  /** @deprecated Anciens champs BAS — rétrocompatibilité si encore renvoyés. */
  authority_score?: UnilizeOptimizationStatus | null;
  bas?: number | string | null;
  bas_status?: UnilizeBasStatusCode | null;
}

/** Entrée performances par mot-clé (OpenAPI Performance). */
export interface UnilizePerformance {
  keyword: string;
  sea: UnilizeSeaMetrics | null;
  search_volume: UnilizeSearchVolume | null;
  seo: UnilizeSeoMetrics | null;
}

export type ListPerformancesResult = {
  requestUrl: string;
  projectId: string;
  campaignId: string;
  performances: UnilizePerformance[];
  error: string | null;
};
