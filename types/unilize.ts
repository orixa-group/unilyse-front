/** Entités Unilize (OpenAPI). */
export interface UnilizeClient {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

/** Mot-clé projet (OpenAPI Keyword). */
export interface UnilizeKeyword {
  value: string;
  /** Thématique optionnelle regroupant ce mot-clé. */
  theme?: string;
}

export interface UnilizeProject {
  id: string;
  name: string;
  /** URL du site associé au projet (Search Console). */
  url: string;
  /** Google Ads customer ID lié au projet (sync SEA au niveau compte). */
  customer_id: string;
  /** Google Analytics (GA4) property ID lié au projet. */
  ga4_property_id: string;
  created_at: string;
  updated_at: string;
  /** Présent après mise à jour des mots-clés ou selon réponse API. */
  keywords?: UnilizeKeyword[];
}

/** Réponse détail projet (OpenAPI ProjectDetail — keywords requis). */
export interface UnilizeProjectDetail extends UnilizeProject {
  keywords: UnilizeKeyword[];
}

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
  /** URL du site associé au projet (requis par l’API). */
  url: string;
  /** Google Ads customer ID — sync SEA au niveau compte. */
  customer_id: string;
  /** Google Analytics (GA4) property ID. */
  ga4_property_id: string;
}

/** Query params optionnels pour les endpoints analytics (période). */
export type UnilizePeriodQuery = {
  from?: string;
  to?: string;
};
