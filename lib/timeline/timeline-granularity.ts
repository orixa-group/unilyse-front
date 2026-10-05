import {
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { formatDateIso, parseDateIso } from "@/lib/performances/period-presets";

export type TimelineGranularity = "day" | "week" | "month";

export const TIMELINE_GRANULARITY_LABELS: Record<TimelineGranularity, string> = {
  day: "jour",
  week: "semaine",
  month: "mois",
};

/** Nombre de jours calendaires inclus entre from et until (YYYY-MM-DD). */
export function countPeriodDays(
  from: string | undefined,
  until: string | undefined,
): number {
  const fromDate = parseDateIso(from);
  const untilDate = parseDateIso(until);
  if (!fromDate || !untilDate) {
    return 30;
  }
  return Math.max(1, differenceInCalendarDays(untilDate, fromDate) + 1);
}

/**
 * Seuils produit : courtes périodes → jour, moyennes → semaine, longues → mois.
 */
export function resolveSuggestedGranularity(
  periodDays: number,
): TimelineGranularity {
  if (periodDays <= 45) {
    return "day";
  }
  if (periodDays <= 120) {
    return "week";
  }
  return "month";
}

export function bucketStartIso(
  dateIso: string,
  granularity: TimelineGranularity,
): string | null {
  const parsed = parseDateIso(dateIso);
  if (!parsed) {
    return null;
  }
  if (granularity === "day") {
    return formatDateIso(parsed);
  }
  if (granularity === "week") {
    return formatDateIso(startOfWeek(parsed, { weekStartsOn: 1 }));
  }
  return formatDateIso(startOfMonth(parsed));
}

export function formatTimelineAxisDate(
  bucketStart: string,
  granularity: TimelineGranularity,
): string {
  const parsed = parseDateIso(bucketStart);
  if (!parsed) {
    return bucketStart;
  }
  if (granularity === "month") {
    return format(parsed, "MMM yyyy", { locale: fr });
  }
  if (granularity === "week") {
    return format(parsed, "dd MMM", { locale: fr });
  }
  return format(parsed, "dd MMM", { locale: fr });
}

export function formatTimelineTooltipDate(
  bucketStart: string,
  granularity: TimelineGranularity,
): string {
  const parsed = parseDateIso(bucketStart);
  if (!parsed) {
    return bucketStart;
  }
  if (granularity === "day") {
    return format(parsed, "dd MMMM yyyy", { locale: fr });
  }
  if (granularity === "week") {
    const weekEnd = endOfWeek(parsed, { weekStartsOn: 1 });
    return `${format(parsed, "dd MMM", { locale: fr })} – ${format(weekEnd, "dd MMM yyyy", { locale: fr })}`;
  }
  const monthEnd = endOfMonth(parsed);
  return `${format(parsed, "dd MMM", { locale: fr })} – ${format(monthEnd, "dd MMM yyyy", { locale: fr })}`;
}
