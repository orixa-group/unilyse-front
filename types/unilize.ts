/** Entités Unilize (OpenAPI). */
export interface UnilizeClient {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface UnilizeProject {
  id: string;
  name: string;
  /** URL du site associé au projet (Search Console). */
  url: string;
  /** Google Ads customer ID lié au projet (sync SEA au niveau compte). */
  customer_id: string;
  created_at: string;
  updated_at: string;
  /** Présent après mise à jour des mots-clés ou selon réponse API. */
  keywords?: string[];
}

/** Réponse détail projet (OpenAPI ProjectDetail — keywords requis). */
export interface UnilizeProjectDetail extends UnilizeProject {
  keywords: string[];
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
}

/** Query params optionnels pour les endpoints analytics (période). */
export type UnilizePeriodQuery = {
  from?: string;
  to?: string;
};
