import {
  DEFAULT_PERIOD_PRESET_ID,
  formatDateIso,
  resolvePresetRange,
} from "@/lib/performances/period-presets";
import type { UnilizeTimelineFilterQuery } from "@/types/timeline";
import type { UnilizePeriodQuery } from "@/types/unilize";

/** Période effective pour les appels API (from + until requis). */
export type ResolvedPeriodQuery = {
  from: string;
  until: string;
};

/**
 * OpenAPI v2 : `from` et `until` doivent être envoyés ensemble (YYYY-MM-DD).
 * Retourne `undefined` si une seule borne est présente.
 */
export function normalizePeriodQuery(
  period?: UnilizePeriodQuery | null,
): ResolvedPeriodQuery | undefined {
  const from = period?.from?.trim();
  const until = period?.until?.trim();
  if (!from || !until) {
    return undefined;
  }
  return { from, until };
}

/** Période par défaut : 3 derniers mois finissant aujourd'hui. */
export function getDefaultPeriodQuery(now = new Date()): ResolvedPeriodQuery {
  const range = resolvePresetRange(DEFAULT_PERIOD_PRESET_ID, now);
  return {
    from: formatDateIso(range.from),
    until: formatDateIso(range.to),
  };
}

/** Résout la période à envoyer à l'API (défaut si non définie). */
export function resolveEffectivePeriod(
  period?: UnilizePeriodQuery | null,
  now = new Date(),
): ResolvedPeriodQuery {
  return normalizePeriodQuery(period) ?? getDefaultPeriodQuery(now);
}

export function parsePeriodFromSearchParams(
  searchParams: URLSearchParams,
): UnilizePeriodQuery | undefined {
  const until =
    searchParams.get("until") ?? searchParams.get("to") ?? undefined;
  return normalizePeriodQuery({
    from: searchParams.get("from") ?? undefined,
    until,
  });
}

export function appendPeriodSearchParams(
  url: URL,
  period?: UnilizePeriodQuery | null,
): void {
  const normalized = resolveEffectivePeriod(period);
  url.searchParams.set("from", normalized.from);
  url.searchParams.set("until", normalized.until);
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
