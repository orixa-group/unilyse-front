import { UNILIZE_API_DEFAULT_URL } from "@/lib/constants/api-endpoints";

/** Base URL upstream Unilize côté serveur (BFF, proxy, actions). */
export function resolveUnilizeServerBaseUrl(): string {
  const serverUrl = process.env.API_URL?.trim();
  if (serverUrl?.startsWith("http")) {
    return serverUrl.replace(/\/$/, "");
  }
  return UNILIZE_API_DEFAULT_URL.replace(/\/$/, "");
}

/** Construit une URL absolue vers l'API Unilize (query params optionnels). */
export function buildUnilizeUpstreamUrl(
  path: string,
  query?: Record<string, string | undefined>,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(normalizedPath, `${resolveUnilizeServerBaseUrl()}/`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value) url.searchParams.set(key, value);
    }
  }
  return url.toString();
}
