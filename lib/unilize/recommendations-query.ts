import {
  formatDateIso,
  getPeriodEndDate,
  parseDateIso,
} from "@/lib/performances/period-presets";
import { resolveEffectivePeriod } from "@/lib/unilize/period-query";
import type { UnilizeRecommendationsQuery } from "@/types/recommendations";
import type { UnilizePeriodQuery } from "@/types/unilize";

export type RecommendationDateContext = {
  recommendationAsOfDate?: string | null;
  period?: UnilizePeriodQuery | null;
};

/** Date effective pour `GET /recommendations` (param `date`). */
export function resolveEffectiveRecommendationDate(
  context?: RecommendationDateContext,
): string {
  const explicit = context?.recommendationAsOfDate?.trim();
  if (explicit) {
    return explicit;
  }
  const periodUntil = resolveEffectivePeriod(context?.period).until;
  if (periodUntil) {
    return periodUntil;
  }
  return formatDateIso(getPeriodEndDate());
}

export function resolveRecommendationsQuery(
  context?: RecommendationDateContext,
): UnilizeRecommendationsQuery {
  return { date: resolveEffectiveRecommendationDate(context) };
}

export function parseRecommendationsDateFromSearchParams(
  params: URLSearchParams,
): UnilizeRecommendationsQuery {
  const date = params.get("date")?.trim();
  return date ? { date } : {};
}

export function appendRecommendationsSearchParams(
  url: URL,
  query?: UnilizeRecommendationsQuery,
): void {
  if (query?.date) {
    url.searchParams.set("date", query.date);
  }
}

export function formatRecommendationDateLabel(
  iso: string | null | undefined,
): string {
  const parsed = parseDateIso(iso);
  if (!parsed) {
    return "—";
  }
  return formatDateIso(parsed);
}
