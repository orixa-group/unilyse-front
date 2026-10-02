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

const ACTIVE_ACQUISITION_STATES = new Set<UnilizeAcquisitionState>([
  "pending",
  "running",
]);

export function countActiveAcquisitions(
  acquisitions: UnilizeAcquisitions | null | undefined,
): number {
  if (!acquisitions) {
    return 0;
  }
  return Object.values(acquisitions).filter((state) =>
    ACTIVE_ACQUISITION_STATES.has(state),
  ).length;
}

export function countFailedAcquisitions(
  acquisitions: UnilizeAcquisitions | null | undefined,
): number {
  if (!acquisitions) {
    return 0;
  }
  return Object.values(acquisitions).filter((state) => state === "failed")
    .length;
}
