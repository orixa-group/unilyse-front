import { formatDateIso, parseDateIso } from "@/lib/performances/period-presets";
import type { UnilizeRecommendationsQuery } from "@/types/recommendations";

export type RecommendationDateContext = {
  recommendationAsOfDate?: string | null;
};

/** Date effective pour `GET /recommendations` (param `date`). */
export function resolveEffectiveRecommendationDate(
  context?: RecommendationDateContext,
): string {
  const explicit = context?.recommendationAsOfDate?.trim();
  if (explicit) {
    return explicit;
  }
  return formatDateIso(new Date());
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
