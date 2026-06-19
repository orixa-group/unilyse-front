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
  created_at: string;
  updated_at: string;
  /** Présent après mise à jour des mots-clés ou selon réponse API. */
  keywords?: string[];
}

/** Réponse détail projet (OpenAPI ProjectDetail — keywords requis). */
export interface UnilizeProjectDetail extends UnilizeProject {
  keywords: string[];
}

export interface UnilizeCampaign {
  id: string;
  name: string;
  customer_id: string;
  created_at: string;
  updated_at: string;
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
}

export interface LinkCampaignPayload {
  id: string;
  name: string;
  customer_id: string;
}
