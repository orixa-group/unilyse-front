import { formatNumber } from "@/lib/utils/formatting";
import type { UnilizeAcquisitions, UnilizeAcquisitionState } from "@/types/performance";

/** Affiche une fraction API (0–1) en pourcentage lisible. */
export function formatFractionPercent(
  value: number | null | undefined,
  locale = "fr-FR",
): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return `${formatNumber(value * 100, locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })} %`;
}

const ACQUISITION_SOURCES = [
  ["paid_performances", "SEA"],
  ["organic_performances", "SEO"],
  ["search_volumes", "Volume"],
  ["organic_rankings", "Position"],
  ["url_authorities", "Autorité"],
  ["page_semantics", "Sémantique"],
] as const satisfies ReadonlyArray<readonly [keyof UnilizeAcquisitions, string]>;

const ACQUISITION_STATE_LABELS: Record<string, string> = {
  pending: "en attente",
  running: "en cours",
  succeeded: "terminée",
  failed: "échec",
  null: "non collectée",
  unknown: "état inconnu",
};

/** Ramène un état API à l'enum OpenAPI. `null` = source non collectée. */
export function normalizeAcquisitionState(
  state: unknown,
): UnilizeAcquisitionState | "unknown" {
  if (state === null || state === undefined) {
    return null;
  }
  if (typeof state !== "string") {
    return "unknown";
  }
  const key = state.trim().toLowerCase();
  if (
    key === "pending" ||
    key === "running" ||
    key === "succeeded" ||
    key === "failed"
  ) {
    return key;
  }
  if (key === "") {
    return null;
  }
  return "unknown";
}

function readAcquisitionSources(
  acquisitions: UnilizeAcquisitions | null | undefined,
): Array<{ label: string; state: UnilizeAcquisitionState | "unknown" }> | null {
  if (!acquisitions || typeof acquisitions !== "object") {
    return null;
  }
  return ACQUISITION_SOURCES.map(([key, label]) => ({
    label,
    state: normalizeAcquisitionState(acquisitions[key]),
  }));
}

export function countActiveAcquisitions(
  acquisitions: UnilizeAcquisitions | null | undefined,
): number {
  const sources = readAcquisitionSources(acquisitions);
  if (!sources) {
    return 0;
  }
  return sources.filter(
    (source) => source.state === "pending" || source.state === "running",
  ).length;
}

export function countFailedAcquisitions(
  acquisitions: UnilizeAcquisitions | null | undefined,
): number {
  const sources = readAcquisitionSources(acquisitions);
  if (!sources) {
    return 0;
  }
  return sources.filter((source) => source.state === "failed").length;
}

export function isAcquisitionActive(
  state: UnilizeAcquisitionState | undefined,
): boolean {
  const normalized = normalizeAcquisitionState(state);
  return normalized === "pending" || normalized === "running";
}

export type AcquisitionSourceRow = {
  label: string;
  state: UnilizeAcquisitionState | "unknown";
  stateLabel: string;
};

export type CollectionStatusSummary =
  | { kind: "missing" }
  | { kind: "collecting"; active: number; sources: AcquisitionSourceRow[] }
  | { kind: "failed"; failed: number; sources: AcquisitionSourceRow[] }
  | { kind: "incomplete"; sources: AcquisitionSourceRow[] }
  | { kind: "idle"; sources: AcquisitionSourceRow[] }
  | { kind: "up_to_date"; sources: AcquisitionSourceRow[] };

function toAcquisitionSourceRows(
  sources: ReadonlyArray<{
    label: string;
    state: UnilizeAcquisitionState | "unknown";
  }>,
): AcquisitionSourceRow[] {
  return sources.map((source) => {
    const key = source.state === null ? "null" : source.state;
    return {
      label: source.label,
      state: source.state,
      stateLabel: ACQUISITION_STATE_LABELS[key] ?? key,
    };
  });
}

/**
 * Agrège les 6 sources. « À jour » seulement si chacune est `succeeded`.
 * `null` (non collectée) et un état non reconnu ne comptent pas comme terminés.
 */
export function summarizeCollectionStatus(
  acquisitions: UnilizeAcquisitions | null | undefined,
): CollectionStatusSummary {
  const sources = readAcquisitionSources(acquisitions);
  if (!sources) {
    return { kind: "missing" };
  }
  const rows = toAcquisitionSourceRows(sources);
  const active = sources.filter(
    (source) => source.state === "pending" || source.state === "running",
  ).length;
  if (active > 0) {
    return { kind: "collecting", active, sources: rows };
  }
  const failed = sources.filter((source) => source.state === "failed").length;
  if (failed > 0) {
    return { kind: "failed", failed, sources: rows };
  }
  const succeeded = sources.filter(
    (source) => source.state === "succeeded",
  ).length;
  const unsettled = sources.filter(
    (source) => source.state === null || source.state === "unknown",
  ).length;
  if (unsettled > 0) {
    if (succeeded === 0) {
      return { kind: "idle", sources: rows };
    }
    return { kind: "incomplete", sources: rows };
  }
  return { kind: "up_to_date", sources: rows };
}

/**
 * Rendu d'une valeur observée (autorité, sémantique, ranking…) :
 * - valeur connue (y compris 0) → nombre ;
 * - null + collecte pending/running → « Collecte… » ;
 * - null + collecte failed → « Échec » ;
 * - null sinon → « — » (l'API n'a rien à donner : page non classée, source muette).
 */
export type ObservedValueDisplay =
  | { kind: "value"; text: string }
  | { kind: "collecting"; text: string }
  | { kind: "failed"; text: string }
  | { kind: "empty"; text: string };

export function describeObservedValue(
  value: number | null | undefined,
  state: UnilizeAcquisitionState | undefined,
  format: (value: number) => string = (v) => formatNumber(v),
): ObservedValueDisplay {
  if (value !== null && value !== undefined && Number.isFinite(value)) {
    return { kind: "value", text: format(value) };
  }
  if (isAcquisitionActive(state)) {
    return { kind: "collecting", text: "Collecte…" };
  }
  if (normalizeAcquisitionState(state) === "failed") {
    return { kind: "failed", text: "Échec" };
  }
  return { kind: "empty", text: "—" };
}
