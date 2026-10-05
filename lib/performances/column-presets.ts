import type { TableChannel } from "@/lib/ui/table-visual";
import type { UnilizePerformance } from "@/types/performance";

/** Presets colonnes (PDF Performances). */
export type PerformanceColumnPresetId = "essentiel" | "sea" | "seo";

/** CTR global dérivé : (clics SEA + SEO) / volume (fraction 0–1). */
export function computeGlobalCtr(row: UnilizePerformance): number | null {
  const volume = row.search_volume?.volume;
  if (volume === null || volume === undefined || volume <= 0) {
    return null;
  }
  const paidClicks = row.paid_performances?.clicks ?? 0;
  const organicClicks = row.organic_performances?.clicks ?? 0;
  return (paidClicks + organicClicks) / volume;
}

const LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  spend: "cost",
};

export function migratePerformanceColumnId(columnId: string): string {
  return LEGACY_COLUMN_ID_MAP[columnId] ?? columnId;
}

export const PERFORMANCE_ESSENTIEL_COLUMNS = [
  "search_volume",
  "cost",
  "clicks",
  "seo_clicks",
  "ctr_global",
  "ctr",
  "seo_ctr",
  "conversions",
  "impressions",
  "seo_impressions",
  "no_click_rate",
  "average_position",
] as const;

export const PERFORMANCE_SEA_EXTRA_COLUMNS = [
  "cpc",
  "roas",
  "quality_score",
  "budget_lost_impression_share",
  "rank_lost_impression_share",
  "potential_impressions_budget",
  "potential_impressions_rank",
] as const;

export const PERFORMANCE_SEO_EXTRA_COLUMNS = [
  "real_time_position",
  "semantic_score",
  "semantic_avg",
  "semantic_max",
  "semantic_min",
  "netlinking_score",
  "netlinking_trust",
  "netlinking_backlinks",
  "netlinking_domains",
  "netlinking_avg",
  "netlinking_max",
  "netlinking_min",
] as const;

export const PERFORMANCE_SEA_PRESET_COLUMNS = [
  ...PERFORMANCE_ESSENTIEL_COLUMNS,
  ...PERFORMANCE_SEA_EXTRA_COLUMNS,
] as const;

export const PERFORMANCE_SEO_PRESET_COLUMNS = [
  ...PERFORMANCE_ESSENTIEL_COLUMNS,
  ...PERFORMANCE_SEO_EXTRA_COLUMNS,
] as const;

export const PERFORMANCE_COLUMN_DISPLAY_ORDER = [
  ...PERFORMANCE_ESSENTIEL_COLUMNS,
  ...PERFORMANCE_SEA_EXTRA_COLUMNS,
  ...PERFORMANCE_SEO_EXTRA_COLUMNS,
  "collection_status",
] as const;

export const PERFORMANCE_TOGGLEABLE_COLUMNS =
  PERFORMANCE_COLUMN_DISPLAY_ORDER;

export type PerformanceToggleableColumnId =
  (typeof PERFORMANCE_TOGGLEABLE_COLUMNS)[number];

export const DEFAULT_PERFORMANCE_VISIBLE_COLUMNS: readonly string[] =
  PERFORMANCE_ESSENTIEL_COLUMNS;

export const PERFORMANCE_COLUMN_PRESETS: Record<
  PerformanceColumnPresetId,
  readonly string[]
> = {
  essentiel: PERFORMANCE_ESSENTIEL_COLUMNS,
  sea: PERFORMANCE_SEA_PRESET_COLUMNS,
  seo: PERFORMANCE_SEO_PRESET_COLUMNS,
};

export const PERFORMANCE_COLUMN_PRESET_LABELS: Record<
  PerformanceColumnPresetId,
  string
> = {
  essentiel: "Essentiel",
  sea: "SEA",
  seo: "SEO",
};

export const PERFORMANCE_COLUMN_PRESET_ORDER: PerformanceColumnPresetId[] = [
  "essentiel",
  "sea",
  "seo",
];

export const PERFORMANCE_COLUMN_LABELS: Record<string, string> = {
  keyword: "Mot-clé",
  search_volume: "Volume rech.",
  no_click_rate: "% No clics",
  ctr_global: "CTR global",
  collection_status: "Collecte",
  impressions: "Impr. SEA",
  clicks: "Clics SEA",
  cost: "Dépense SEA",
  spend: "Dépense SEA",
  ctr: "CTR SEA",
  cpc: "CPC SEA",
  conversions: "Conv. SEA",
  roas: "ROAS",
  quality_score: "Quality Score",
  budget_lost_impression_share: "Impr. perdues (budget)",
  rank_lost_impression_share: "Impr. perdues (rang)",
  potential_impressions_budget: "Impr. potentielles (budget)",
  potential_impressions_rank: "Impr. potentielles (rang)",
  seo_impressions: "Impr. SEO",
  seo_clicks: "Clics SEO",
  seo_ctr: "CTR SEO",
  average_position: "Position moy. SEO",
  real_time_position: "Position temps réel",
  semantic_score: "Score sémantique",
  semantic_avg: "Sémantique concurrents (moy.)",
  semantic_max: "Sémantique max (top 5)",
  semantic_min: "Sémantique mini (top 5)",
  netlinking_score: "Score autorité",
  netlinking_trust: "Page trust",
  netlinking_backlinks: "Backlinks externes",
  netlinking_domains: "Domaines référents",
  netlinking_avg: "Autorité concurrents (moy.)",
  netlinking_max: "Autorité max (top 5)",
  netlinking_min: "Autorité mini (top 5)",
};

export function resolvePerformanceVisibleColumns(
  stored: string[] | null | undefined,
): Set<string> {
  return new Set(resolvePerformanceVisibleColumnIds(stored));
}

export function resolvePerformanceVisibleColumnIds(
  stored: string[] | null | undefined,
): string[] {
  if (stored === null || stored === undefined) {
    return [...DEFAULT_PERFORMANCE_VISIBLE_COLUMNS];
  }
  const migrated = stored
    .filter((id) => id !== "keyword" && id !== "match_type")
    .map(migratePerformanceColumnId);
  return [...new Set(migrated)];
}

export function isPerformanceColumnVisible(
  columnId: string,
  visibleColumns: ReadonlySet<string>,
): boolean {
  if (columnId === "keyword") {
    return true;
  }
  return visibleColumns.has(columnId);
}

export function matchPerformanceColumnPreset(
  visibleColumns: ReadonlySet<string>,
): PerformanceColumnPresetId | null {
  for (const presetId of PERFORMANCE_COLUMN_PRESET_ORDER) {
    const preset = PERFORMANCE_COLUMN_PRESETS[presetId];
    if (
      preset.length === visibleColumns.size &&
      preset.every((id) => visibleColumns.has(id))
    ) {
      return presetId;
    }
  }
  return null;
}

export function orderPerformanceVisibleColumns(
  visibleColumns: ReadonlySet<string>,
): string[] {
  return PERFORMANCE_COLUMN_DISPLAY_ORDER.filter((id) =>
    visibleColumns.has(id),
  );
}

export const PERFORMANCE_COLUMN_CHANNEL: Record<string, TableChannel> = {
  keyword: "common",
  search_volume: "common",
  no_click_rate: "common",
  ctr_global: "common",
  collection_status: "common",
  impressions: "sea",
  clicks: "sea",
  cost: "sea",
  spend: "sea",
  ctr: "sea",
  cpc: "sea",
  conversions: "sea",
  roas: "sea",
  quality_score: "sea",
  budget_lost_impression_share: "sea",
  rank_lost_impression_share: "sea",
  potential_impressions_budget: "sea",
  potential_impressions_rank: "sea",
  seo_impressions: "seo",
  seo_clicks: "seo",
  seo_ctr: "seo",
  average_position: "seo",
  real_time_position: "seo",
  semantic_score: "seo",
  semantic_avg: "seo",
  semantic_max: "seo",
  semantic_min: "seo",
  netlinking_score: "seo",
  netlinking_trust: "seo",
  netlinking_backlinks: "seo",
  netlinking_domains: "seo",
  netlinking_avg: "seo",
  netlinking_max: "seo",
  netlinking_min: "seo",
};
