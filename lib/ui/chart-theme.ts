/** Couleurs & styles Recharts alignés sur les tokens CSS (clair / sombre). */

export const CHART_SEA = "hsl(var(--chart-1))";
export const CHART_SEO = "hsl(var(--chart-2))";
export const CHART_CONV = "hsl(var(--chart-3))";
export const CHART_CTR = "hsl(var(--chart-4))";
export const CHART_COST = "hsl(var(--chart-5))";

/** Sessions : même famille que le canal, assez opaques pour légende + dark mode. */
export const CHART_SEA_SESSIONS = "hsl(var(--chart-4))";
export const CHART_SEO_SESSIONS = "hsl(var(--info))";

export const CHART_TICK = {
  fontSize: 11,
  fill: "hsl(var(--muted-foreground))",
} as const;
