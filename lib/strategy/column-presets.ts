import type { AnalysisLens } from "@/types/workspace";

export const STRATEGY_COMMON_COLUMNS = ["keyword", "recommendation"] as const;

/** Colonnes SEA affichées par défaut (d’après StrategySEA). */
export const STRATEGY_SEA_DEFAULT_COLUMNS = [
  ...STRATEGY_COMMON_COLUMNS,
  "budget_lost",
  "rank_lost",
  "ad_relevance",
] as const;

/** Colonnes SEA optionnelles via le menu. */
export const STRATEGY_SEA_OPTIONAL_COLUMNS = [
  "expected_ctr",
  "landing_page_ux",
  "impression_share",
  "cpc",
  "conversion_rate",
] as const;

/** Colonnes SEO affichées par défaut (d’après StrategySEO). */
export const STRATEGY_SEO_DEFAULT_COLUMNS = [
  ...STRATEGY_COMMON_COLUMNS,
  "authority_score",
  "semantic_score",
  "position",
] as const;

/** Colonnes SEO optionnelles via le menu. */
export const STRATEGY_SEO_OPTIONAL_COLUMNS = ["page_intent_match"] as const;

export const STRATEGY_COLUMN_CHANNEL: Record<string, "common" | "sea" | "seo"> =
  {
    keyword: "common",
    recommendation: "common",
    budget_lost: "sea",
    rank_lost: "sea",
    ad_relevance: "sea",
    expected_ctr: "sea",
    landing_page_ux: "sea",
    impression_share: "sea",
    cpc: "sea",
    conversion_rate: "sea",
    authority_score: "seo",
    semantic_score: "seo",
    position: "seo",
    page_intent_match: "seo",
  };

export function getStrategyDefaultColumns(lens: AnalysisLens): string[] {
  return lens === "sea"
    ? [...STRATEGY_SEA_DEFAULT_COLUMNS]
    : [...STRATEGY_SEO_DEFAULT_COLUMNS];
}

export function getStrategyOptionalColumns(
  lens: AnalysisLens,
): readonly string[] {
  return lens === "sea"
    ? STRATEGY_SEA_OPTIONAL_COLUMNS
    : STRATEGY_SEO_OPTIONAL_COLUMNS;
}

export function getVisibleStrategyColumns(
  lens: AnalysisLens,
  extraColumns: ReadonlySet<string>,
): string[] {
  const defaults = getStrategyDefaultColumns(lens);
  const optional = getStrategyOptionalColumns(lens).filter((id) =>
    extraColumns.has(id),
  );
  return [...defaults, ...optional];
}
