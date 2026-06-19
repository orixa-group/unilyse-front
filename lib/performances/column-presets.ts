/** Colonnes Google Ads affichées par défaut sur Performances. */
export const PERFORMANCE_SEA_COLUMNS = [
  "keyword",
  "search_volume",
  "impressions",
  "clicks",
  "spend",
  "ctr",
  "cpc",
  "conversions",
  "roas",
  "quality_score",
  "budget_lost_impression_share",
  "rank_lost_impression_share",
  "potential_impressions_budget",
  "potential_impressions_rank",
] as const;

export function isPerformanceColumnVisible(
  columnId: string,
  showAllColumns: boolean,
): boolean {
  if (showAllColumns) {
    return true;
  }
  return PERFORMANCE_SEA_COLUMNS.includes(
    columnId as (typeof PERFORMANCE_SEA_COLUMNS)[number],
  );
}

export const PERFORMANCE_COLUMN_CHANNEL: Record<string, "common" | "sea"> = {
  keyword: "common",
  search_volume: "common",
  impressions: "sea",
  clicks: "sea",
  spend: "sea",
  ctr: "sea",
  cpc: "sea",
  conversions: "sea",
  roas: "sea",
  quality_score: "sea",
  match_type: "sea",
  budget_lost_impression_share: "sea",
  rank_lost_impression_share: "sea",
  potential_impressions_budget: "sea",
  potential_impressions_rank: "sea",
};
