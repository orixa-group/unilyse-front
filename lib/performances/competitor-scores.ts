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
