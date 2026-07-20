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
  /** GET — Strategy (niveau projet) */
  projectStrategy: (projectId: string) =>
    `/projects/${projectId}/strategy` as const,
  /** GET — Monitoring (niveau projet) */
  projectMonitoring: (projectId: string) =>
    `/projects/${projectId}/monitoring` as const,
  /** GET — Sites Google Search Console */
  SITES: "/sites",
} as const;

/**
 * Référence OpenAPI : https://public-api-531732557398.europe-west9.run.app/openapi.yaml
 * Tous les chemins ci-dessus sont couverts par `lib/api/unilize.ts` et les routes BFF.
 */

export type ApiEndpointKey = keyof typeof API;
