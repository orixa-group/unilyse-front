import type { TableChannel } from "@/lib/ui/table-visual";

/** Colonnes du tableau recommandations (vue unifiée + scoring PDF). */
export const STRATEGY_UNIFIED_COLUMNS = [
  "recommendation",
  "keyword",
  "search_volume",
  "sea_score",
  "d1_volume",
  "d2_budget",
  "d3_conversion",
  "d4_ad",
  "d5_ctr",
  "seo_position",
  "content_label",
  "popularity_label",
  "e4_delay",
  "e5_gain",
  "s_seo_invest",
  "note",
  "ad_relevance",
  "expected_ctr",
  "landing_page_ux",
  "impression_share",
  "cpc",
  "conversion_rate",
  "sea_status",
  "effort_status",
] as const;

export type StrategyUnifiedColumnId =
  (typeof STRATEGY_UNIFIED_COLUMNS)[number];

export const STRATEGY_COLUMN_CHANNEL: Record<
  StrategyUnifiedColumnId,
  TableChannel
> = {
  recommendation: "common",
  keyword: "common",
  search_volume: "common",
  sea_score: "sea",
  d1_volume: "sea",
  d2_budget: "sea",
  d3_conversion: "sea",
  d4_ad: "sea",
  d5_ctr: "sea",
  seo_position: "seo",
  content_label: "seo",
  popularity_label: "seo",
  e4_delay: "seo",
  e5_gain: "seo",
  s_seo_invest: "seo",
  note: "common",
  ad_relevance: "sea",
  expected_ctr: "sea",
  landing_page_ux: "sea",
  impression_share: "sea",
  cpc: "sea",
  conversion_rate: "sea",
  sea_status: "sea",
  effort_status: "seo",
};
