/** Entités Unilize (OpenAPI v2). */
export interface UnilizeClient {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

/** Mot-clé projet (OpenAPI Keyword). */
export interface UnilizeKeyword {
  value: string;
  /** Thématique obligatoire à l'écriture (OpenAPI v2). */
  theme: string;
}

export interface UnilizeProject {
  id: string;
  name: string;
  /** Propriété Search Console (ex. sc-domain:exemple.fr). */
  search_console_url: string;
  /** Google Ads customer ID lié au projet. */
  gads_customer_id: string;
  /** Google Analytics (GA4) property ID — facultatif. */
  ga4_property_id?: string;
  /** CTR de référence du projet (0–100 %), facultatif. */
  ctr_benchmark?: number;
  created_at: string;
  updated_at: string;
  /** Présent côté client après enrichissement keywords. */
  keywords?: UnilizeKeyword[];
}

/** Détail projet — les mots-clés passent par GET /keywords. */
export type UnilizeProjectDetail = UnilizeProject;

export interface UnilizeApiEnvelope<T> {
  data: T;
}

export interface UnilizeApiErrorBody {
  error: {
    message: string;
  };
}

export interface CreateClientPayload {
  name: string;
}

export interface CreateProjectPayload {
  name: string;
  search_console_url: string;
  gads_customer_id: string;
  ga4_property_id?: string;
  ctr_benchmark?: number;
}

/** Query params pour les endpoints analytics (période). */
export type UnilizePeriodQuery = {
  from?: string;
  /** Borne inclusive (API v2 : `until`). */
  until?: string;
};
