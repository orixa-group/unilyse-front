import {
  getNetlinkingCompetitorAuthoritySpread,
  getSemanticCompetitorScoreSpread,
} from "@/lib/performances/competitor-scores";
import type { UnilizePerformance } from "@/types/performance";
import type { StrategyWorkGapRow } from "@/types/strategy-work";

function workPriority(row: StrategyWorkGapRow): number {
  const gap = row.gap ?? 0;
  const volume = row.volume ?? 0;
  return gap * volume;
}

export function sortWorkGapsByPriority(
  rows: readonly StrategyWorkGapRow[],
): StrategyWorkGapRow[] {
  return [...rows].sort((a, b) => workPriority(b) - workPriority(a));
}

export function buildSemanticWorkGaps(
  performances: readonly UnilizePerformance[],
): StrategyWorkGapRow[] {
  const rows: StrategyWorkGapRow[] = [];

  for (const row of performances) {
    const ours = row.page_semantics?.ours;
    const spread = getSemanticCompetitorScoreSpread(row);
    if (!ours || spread === null) {
      continue;
    }

    const current = ours.score;
    const target = spread.average;
    const gap = target - current;
    if (gap <= 0) {
      continue;
    }

    rows.push({
      keyword: row.keyword,
      volume: row.search_volume?.volume ?? null,
      current_score: current,
      target_score: target,
      gap,
      page_url: ours.url ?? null,
    });
  }

  return sortWorkGapsByPriority(rows);
}

export function buildNetlinkingWorkGaps(
  performances: readonly UnilizePerformance[],
): StrategyWorkGapRow[] {
  const rows: StrategyWorkGapRow[] = [];

  for (const row of performances) {
    const ours = row.url_authorities?.ours;
    const spread = getNetlinkingCompetitorAuthoritySpread(row);
    if (!ours || spread === null) {
      continue;
    }

    const current = ours.authority_score;
    const target = spread.average;
    const gap = target - current;
    if (gap <= 0) {
      continue;
    }

    rows.push({
      keyword: row.keyword,
      volume: row.search_volume?.volume ?? null,
      current_score: current,
      target_score: target,
      gap,
      page_url: ours.url ?? null,
    });
  }

  return sortWorkGapsByPriority(rows);
}
