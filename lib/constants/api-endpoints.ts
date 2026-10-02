/** Base URL staging Unilize (serveur — voir `.env.example`). */
export const UNILIZE_API_DEFAULT_URL =
  "https://public-api-531732557398.europe-west9.run.app";

/**
 * Préfixe same-origin pour les appels navigateur (évite CORS).
 * @see app/api/unilize/[...path]/route.ts
 */
export const UNILIZE_API_PROXY_PREFIX = "/api/unilize";

export const API = {
  /** GET/POST — Portfolio */
  CLIENTS: "/clients",
  client: (id: string) => `/clients/${id}` as const,
  clientProjects: (clientId: string) =>
    `/clients/${clientId}/projects` as const,
  project: (id: string) => `/projects/${id}` as const,
  projectKeywords: (projectId: string) =>
    `/projects/${projectId}/keywords` as const,
  /** GET — Performances (niveau projet) */
  projectPerformances: (projectId: string) =>
    `/projects/${projectId}/performances` as const,
  /** GET — Recommandations par mot-clé (query `date` optionnelle) */
  projectRecommendations: (projectId: string) =>
    `/projects/${projectId}/recommendations` as const,
  /** GET — Summary (ex-timeline) */
  projectSummary: (projectId: string) =>
    `/projects/${projectId}/summary` as const,
  projectTraffic: (projectId: string) =>
    `/projects/${projectId}/traffic` as const,
  projectClicks: (projectId: string) =>
    `/projects/${projectId}/clicks` as const,
  /** GET — Thématiques projet */
  projectThemes: (projectId: string) =>
    `/projects/${projectId}/themes` as const,
  /** GET — Propriétés Search Console */
  SEARCH_CONSOLE_PROPERTIES: "/search-console/properties",
  /** GET — Comptes Google Ads */
  GOOGLE_ADS_ACCOUNTS: "/google-ads/accounts",
} as const;

/**
 * Référence OpenAPI : https://public-api-531732557398.europe-west9.run.app/openapi.yaml
 * Tous les chemins ci-dessus sont couverts par `lib/api/unilize.ts` et les routes BFF.
 */

export type ApiEndpointKey = keyof typeof API;
