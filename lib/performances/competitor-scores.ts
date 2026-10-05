import type {
  UnilizeCompetitorAuthorities,
  UnilizeCompetitorScores,
  UnilizeCompetitorSemantics,
  UnilizePerformance,
  UnilizeSpread,
} from "@/types/performance";

function isFlatCompetitorScores(value: unknown): value is UnilizeCompetitorScores {
  return (
    typeof value === "object" &&
    value !== null &&
    "average" in value &&
    "max" in value &&
    "min" in value &&
    !("score" in value) &&
    !("authority_score" in value)
  );
}

function asSpread(
  value: UnilizeSpread | UnilizeCompetitorScores | null | undefined,
): UnilizeSpread | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (isFlatCompetitorScores(value)) {
    return value;
  }
  if (
    typeof value === "object" &&
    "average" in value &&
    "max" in value &&
    "min" in value
  ) {
    return value as UnilizeSpread;
  }
  return null;
}

export function getSemanticCompetitorScoreSpread(
  row: UnilizePerformance,
): UnilizeSpread | null {
  const competitors = row.page_semantics?.competitors;
  if (!competitors) {
    return null;
  }
  if (isFlatCompetitorScores(competitors)) {
    return competitors;
  }
  return asSpread((competitors as UnilizeCompetitorSemantics).score);
}

export function getOursSemanticScore(
  row: UnilizePerformance,
): number | null {
  const score = row.page_semantics?.ours?.score;
  return score == null || !Number.isFinite(score) ? null : score;
}

export function getOursAuthorityScore(
  row: UnilizePerformance,
): number | null {
  const score = row.url_authorities?.ours?.authority_score;
  return score == null || !Number.isFinite(score) ? null : score;
}

export function getOursPageTrust(row: UnilizePerformance): number | null {
  const value = row.url_authorities?.ours?.page_trust;
  return value == null || !Number.isFinite(value) ? null : value;
}

export function getOursBacklinksExternal(
  row: UnilizePerformance,
): number | null {
  const value = row.url_authorities?.ours?.backlinks_external;
  return value == null || !Number.isFinite(value) ? null : value;
}

export function getOursBacklinksDomains(
  row: UnilizePerformance,
): number | null {
  const value = row.url_authorities?.ours?.backlinks_domains;
  return value == null || !Number.isFinite(value) ? null : value;
}

export function getNetlinkingCompetitorAuthoritySpread(
  row: UnilizePerformance,
): UnilizeSpread | null {
  const competitors = row.url_authorities?.competitors;
  if (!competitors) {
    return null;
  }
  if (isFlatCompetitorScores(competitors)) {
    return competitors;
  }
  return asSpread(
    (competitors as UnilizeCompetitorAuthorities).authority_score,
  );
}
