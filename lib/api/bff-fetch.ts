import {
  resolveListFetchError,
  toUserFacingApiError,
  type ListFetchErrorMode,
} from "@/lib/api/error-messages";

/** Gère une réponse BFF : erreur HTTP, puis champ `error` JSON sur 200. */
export function assertBffFetchOk(
  response: Response,
  error: string | null | undefined,
  fallback: string,
  mode: ListFetchErrorMode = "empty-on-not-found",
): { ok: true } | { ok: false; empty: true } | { ok: false; empty: false; message: string } {
  if (!response.ok) {
    const resolved = resolveListFetchError(error, response.status, fallback, mode);
    if (!resolved.shouldThrow) {
      return { ok: false, empty: true };
    }
    return { ok: false, empty: false, message: resolved.message };
  }

  if (error?.trim()) {
    return {
      ok: false,
      empty: false,
      message: toUserFacingApiError(error, {
        status: response.status,
        fallback,
      }),
    };
  }

  return { ok: true };
}
