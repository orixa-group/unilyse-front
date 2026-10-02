const LEVEL_LABELS: Record<string, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Élevé",
  moderate: "Modéré",
};

const SEMANTIC_GAP_LABELS: Record<string, string> = {
  even: "Au niveau",
  catchable: "Rattrapable",
  rebuild: "À reconstruire",
};

const AUTHORITY_GAP_LABELS: Record<string, string> = {
  even: "Au niveau",
  targeted_links: "Liens ciblés",
  long_term: "Long terme",
};

const DELAY_LABELS: Record<string, string> = {
  short: "Court",
  medium: "Moyen",
  long: "Long",
  very_long: "Très long",
};

const CONVERSIONS_LABELS: Record<string, string> = {
  performing: "Performant",
  inefficient: "Peu efficace",
  underfed: "Sous-alimenté",
  none: "Aucune",
};

const INCREMENTAL_CTR_LABELS: Record<string, string> = {
  threshold_reached: "Seuil atteint",
  rank_constrained: "Rang limitant",
  unconstrained: "Non limité",
};

export function formatAssessmentLevel(
  value: string | null | undefined,
): string {
  if (!value) return "—";
  return LEVEL_LABELS[value] ?? value;
}

export function formatSemanticGap(value: string | null | undefined): string {
  if (!value) return "—";
  return SEMANTIC_GAP_LABELS[value] ?? value;
}

export function formatAuthorityGap(value: string | null | undefined): string {
  if (!value) return "—";
  return AUTHORITY_GAP_LABELS[value] ?? value;
}

export function formatDelayStatus(value: string | null | undefined): string {
  if (!value) return "—";
  return DELAY_LABELS[value] ?? value;
}

export function formatPaidConversions(
  value: string | null | undefined,
): string {
  if (!value) return "—";
  return CONVERSIONS_LABELS[value] ?? value;
}

export function formatIncrementalCtr(
  value: string | null | undefined,
): string {
  if (!value) return "—";
  return INCREMENTAL_CTR_LABELS[value] ?? value;
}

export function formatInjectableBudget(
  value: string | null | undefined,
): string {
  if (!value) return "—";
  if (value === "moderate") return "Modéré";
  return LEVEL_LABELS[value] ?? value;
}
