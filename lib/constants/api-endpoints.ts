/** Base URL staging Unilize (serveur / rewrites — voir `.env.example`). */
export const UNILIZE_API_DEFAULT_URL =
  "https://public-api-531732557398.europe-west9.run.app";

/**
 * Préfixe same-origin pour les appels navigateur (évite CORS via rewrite Next.js).
 * @see next.config.ts `rewrites`
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
  projectCampaigns: (projectId: string) =>
    `/projects/${projectId}/campaigns` as const,
  projectCampaign: (projectId: string, campaignId: string) =>
    `/projects/${projectId}/campaigns/${campaignId}` as const,
  /** GET — Performances */
  campaignPerformances: (projectId: string, campaignId: string) =>
    `/projects/${projectId}/campaigns/${campaignId}/performances` as const,
  /** GET — Strategy */
  campaignStrategy: (projectId: string, campaignId: string) =>
    `/projects/${projectId}/campaigns/${campaignId}/strategy` as const,
  /** GET — Monitoring */
  campaignMonitoring: (projectId: string, campaignId: string) =>
    `/projects/${projectId}/campaigns/${campaignId}/monitoring` as const,
  /** GET — Sites Google Search Console */
  SITES: "/sites",
} as const;

/**
 * Référence OpenAPI : https://public-api-531732557398.europe-west9.run.app/openapi.yaml
 * Tous les chemins ci-dessus sont couverts par `lib/api/unilize.ts` et les routes BFF
 * (`/api/bff/sites` pour GET /sites).
 */

export type ApiEndpointKey = keyof typeof API;
