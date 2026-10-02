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

/** Échelle Google Ads (pertinence, CTR attendu, UX landing). */
const UNILIZE_RATING_LABELS: Record<string, string> = {
  below_average: "Inférieur à la moyenne",
  average: "Dans la moyenne",
  above_average: "Supérieur à la moyenne",
  unspecified: "Non évalué",
  unknown: "Non évalué",
  poor: "Inférieur à la moyenne",
  good: "Supérieur à la moyenne",
  excellent: "Supérieur à la moyenne",
};

function normalizeUnilizeRatingKey(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const snake = trimmed
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");

  if (UNILIZE_RATING_LABELS[snake]) {
    return snake;
  }

  if (
    snake.includes("below_average") ||
    snake.includes("below") ||
    snake.includes("inferieur") ||
    snake.includes("inférieur")
  ) {
    return "below_average";
  }
  if (
    snake.includes("above_average") ||
    snake.includes("above") ||
    snake.includes("superieur") ||
    snake.includes("supérieur")
  ) {
    return "above_average";
  }
  if (snake === "average" || snake.endsWith("_average")) {
    return "average";
  }
  if (snake.includes("unspecified") || snake.includes("unknown")) {
    return "unspecified";
  }
  if (snake.includes("moyenne")) {
    if (
      snake.includes("sous") ||
      snake.includes("infer") ||
      snake.includes("below")
    ) {
      return "below_average";
    }
    if (
      snake.includes("super") ||
      snake.includes("above") ||
      snake.includes("au_dessus")
    ) {
      return "above_average";
    }
    return "average";
  }

  return snake in UNILIZE_RATING_LABELS ? snake : null;
}

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

export function formatUnilizeRating(
  value: string | null | undefined,
): string {
  if (value == null || String(value).trim() === "") {
    return "—";
  }
  const raw = String(value);
  const key = normalizeUnilizeRatingKey(raw);
  if (key) {
    return UNILIZE_RATING_LABELS[key] ?? "—";
  }
  return "—";
}

/** Clé normalisée pour les tons (`seaTierTone`). */
export function unilizeRatingToneKey(
  value: string | null | undefined,
): string | null {
  if (value == null || String(value).trim() === "") {
    return null;
  }
  return normalizeUnilizeRatingKey(String(value));
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
