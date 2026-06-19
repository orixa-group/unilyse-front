export function formatNumber(
  value: number,
  locale = "fr-FR",
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/** Nombre avec au plus 2 décimales (affichage tableaux stratégie, etc.). */
export function formatDecimal(value: number, locale = "fr-FR"): string {
  return formatNumber(value, locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
}

/** Pourcentage (valeur 0–100) avec au plus 2 décimales. */
export function formatPercentValue(value: number, locale = "fr-FR"): string {
  return `${formatDecimal(value, locale)} %`;
}

export function formatCurrencyEur(
  value: number,
  locale = "fr-FR",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(
  input: Date | string | number,
  locale = "fr-FR",
): string {
  const date = input instanceof Date ? input : new Date(input);
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(date);
}
