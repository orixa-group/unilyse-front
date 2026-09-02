import type { UnilizeTimelineFilterQuery } from "@/types/timeline";
import type { UnilizePeriodQuery } from "@/types/unilize";

/**
 * OpenAPI : `from` et `to` doivent être envoyés ensemble (YYYY-MM-DD).
 * Retourne `undefined` si une seule borne est présente.
 */
export function normalizePeriodQuery(
  period?: UnilizePeriodQuery | null,
): { from: string; to: string } | undefined {
  const from = period?.from?.trim();
  const to = period?.to?.trim();
  if (!from || !to) {
    return undefined;
  }
  return { from, to };
}

export function parsePeriodFromSearchParams(
  searchParams: URLSearchParams,
): UnilizePeriodQuery | undefined {
  return normalizePeriodQuery({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });
}

export function appendPeriodSearchParams(
  url: URL,
  period?: UnilizePeriodQuery | null,
): void {
  const normalized = normalizePeriodQuery(period);
  if (!normalized) {
    return;
  }
  url.searchParams.set("from", normalized.from);
  url.searchParams.set("to", normalized.to);
}

export function normalizeTimelineFilterQuery(
  filter?: UnilizeTimelineFilterQuery | null,
): UnilizeTimelineFilterQuery | undefined {
  if (!filter) {
    return undefined;
  }

  const period = normalizePeriodQuery(filter);
  const keyword = filter.keyword?.length ? filter.keyword : undefined;
  const theme = filter.theme?.length ? filter.theme : undefined;

  if (!period && !keyword && !theme) {
    return undefined;
  }

  return {
    ...period,
    keyword,
    theme,
  };
}

export function parseTimelineFilterFromSearchParams(
  searchParams: URLSearchParams,
): UnilizeTimelineFilterQuery | undefined {
  const keyword = searchParams
    .getAll("keyword")
    .map((value) => value.trim())
    .filter(Boolean);
  const theme = searchParams
    .getAll("theme")
    .map((value) => value.trim())
    .filter(Boolean);
  const period = parsePeriodFromSearchParams(searchParams);

  if (!period && keyword.length === 0 && theme.length === 0) {
    return undefined;
  }

  return {
    ...period,
    keyword: keyword.length ? keyword : undefined,
    theme: theme.length ? theme : undefined,
  };
}
