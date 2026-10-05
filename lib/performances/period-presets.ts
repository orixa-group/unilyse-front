import {
  format,
  isSameDay,
  parseISO,
  subDays,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";

export type PeriodPresetId = "last_30_days" | "last_3_months" | "last_6_months";

/** Plage appliquée quand aucune période n'est choisie. */
export const DEFAULT_PERIOD_PRESET_ID: PeriodPresetId = "last_3_months";

export const PERIOD_PRESETS: ReadonlyArray<{
  id: PeriodPresetId;
  label: string;
}> = [
  { id: "last_30_days", label: "30 derniers jours" },
  { id: "last_3_months", label: "3 derniers mois" },
  { id: "last_6_months", label: "6 derniers mois" },
] as const;

/** Fin de plage = aujourd'hui (borne incluse ; l'API v2 n'impose plus « hier »). */
export function getPeriodEndDate(now = new Date()): Date {
  return now;
}

export function resolvePresetRange(
  id: PeriodPresetId,
  now = new Date(),
): { from: Date; to: Date } {
  const to = getPeriodEndDate(now);
  switch (id) {
    case "last_30_days":
      return { from: subDays(to, 29), to };
    case "last_3_months":
      return { from: subMonths(to, 3), to };
    case "last_6_months":
      return { from: subMonths(to, 6), to };
  }
}

export function formatDateIso(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseDateIso(value: string | null | undefined): Date | null {
  if (!value) return null;
  try {
    const parsed = parseISO(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

export function formatPeriodLabel(
  from: string | null,
  to: string | null,
): string {
  const presetId =
    !from && !to ? DEFAULT_PERIOD_PRESET_ID : matchPreset(from, to);
  if (presetId) {
    return (
      PERIOD_PRESETS.find((preset) => preset.id === presetId)?.label ??
      "3 derniers mois"
    );
  }
  const fromDate = parseDateIso(from);
  const toDate = parseDateIso(to);
  if (fromDate && toDate) {
    return `${format(fromDate, "dd/MM/yyyy", { locale: fr })} – ${format(toDate, "dd/MM/yyyy", { locale: fr })}`;
  }
  if (fromDate) {
    return `Depuis ${format(fromDate, "dd/MM/yyyy", { locale: fr })}`;
  }
  if (toDate) {
    return `Jusqu’au ${format(toDate, "dd/MM/yyyy", { locale: fr })}`;
  }
  return "3 derniers mois";
}

export function matchPreset(
  from: string | null,
  to: string | null,
  now = new Date(),
): PeriodPresetId | null {
  const fromDate = parseDateIso(from);
  const toDate = parseDateIso(to);
  if (!fromDate || !toDate) return null;

  for (const preset of PERIOD_PRESETS) {
    const range = resolvePresetRange(preset.id, now);
    if (isSameDay(fromDate, range.from) && isSameDay(toDate, range.to)) {
      return preset.id;
    }
  }
  return null;
}
