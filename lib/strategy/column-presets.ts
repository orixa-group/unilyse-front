/** Colonnes fixes du tableau recommandations (vue unifiée SEA + reco). */
export const STRATEGY_UNIFIED_COLUMNS = [
  "recommendation",
  "keyword",
  "search_volume",
  "ad_relevance",
  "expected_ctr",
  "landing_page_ux",
  "impression_share",
  "cpc",
  "conversion_rate",
] as const;

export type StrategyUnifiedColumnId =
  (typeof STRATEGY_UNIFIED_COLUMNS)[number];

export const STRATEGY_COLUMN_CHANNEL: Record<
  StrategyUnifiedColumnId,
  "common" | "sea"
> = {
  recommendation: "common",
  keyword: "common",
  search_volume: "common",
  ad_relevance: "sea",
  expected_ctr: "sea",
  landing_page_ux: "sea",
  impression_share: "sea",
  cpc: "sea",
  conversion_rate: "sea",
};
