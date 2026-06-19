import { ApiClientError } from "@/lib/api/client";

/** Erreurs réseau / HTTP susceptibles de réussir au prochain essai (API instable). */
export function isRetryableUpstreamError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    if (error.status === 401 || error.status === 403 || error.status === 400) {
      return false;
    }
    return error.status === 404 || error.status === 429 || error.status >= 500;
  }
  return true;
}

/** Options TanStack Query partagées pour les listes Unilize (projets, campagnes). */
export const unilizeListQueryRetry = {
  retry: (failureCount: number, error: Error) => {
    if (failureCount >= 3) {
      return false;
    }
    if (error.message.includes("401") || error.message.includes("403")) {
      return false;
    }
    return true;
  },
  retryDelay: (attempt: number) => Math.min(400 * 2 ** attempt, 2_000),
} as const;
