import {
  resolveListFetchError,
  toUserFacingApiError,
  type ListFetchErrorMode,
} from "@/lib/api/error-messages";

/** Erreur explicite lors d'un appel BFF (HTTP, JSON invalide ou métier). */
export class BffFetchError extends Error {
  readonly status: number;
  readonly url: string;
  readonly requestUrl?: string;
  readonly rawSnippet?: string;

  constructor(
    message: string,
    init: {
      status: number;
      url: string;
      requestUrl?: string;
      rawSnippet?: string;
    },
  ) {
    super(message);
    this.name = "BffFetchError";
    this.status = init.status;
    this.url = init.url;
    this.requestUrl = init.requestUrl;
    this.rawSnippet = init.rawSnippet;
  }
}

export function isBffFetchError(error: unknown): error is BffFetchError {
  return error instanceof BffFetchError;
}

function describeInvalidBffBody(
  status: number,
  fallback: string,
  rawSnippet?: string,
): string {
  const statusHint =
    status === 401
      ? "Session expirée ou non authentifiée (401)."
      : status === 403
        ? "Accès refusé (403)."
        : status === 502
          ? "L'API Unilize a renvoyé une erreur (502)."
          : status === 504
            ? "Délai dépassé (504)."
            : status >= 500
              ? `Erreur serveur (${status}).`
              : `Erreur HTTP (${status}).`;

  if (!rawSnippet?.trim()) {
    return `${fallback} ${statusHint} Le serveur n'a renvoyé aucun JSON (réponse vide). Vérifiez les logs Cloud Run (front + API).`;
  }

  if (rawSnippet.startsWith("<!") || rawSnippet.startsWith("<html")) {
    return `${fallback} ${statusHint} Réponse HTML reçue à la place du JSON (crash ou page d'erreur Next.js).`;
  }

  return `${fallback} ${statusHint} Réponse illisible (JSON invalide).`;
}

/** Parse le corps d'une réponse BFF sans planter sur une réponse vide. */
export async function parseBffJsonBody(
  response: Response,
  url: string,
  fallback: string,
): Promise<Record<string, unknown>> {
  const text = await response.text();
  const trimmed = text.trim();

  if (!trimmed) {
    if (!response.ok) {
      throw new BffFetchError(
        describeInvalidBffBody(response.status, fallback),
        { status: response.status, url },
      );
    }
    return {};
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    throw new SyntaxError("JSON root is not an object");
  } catch {
    if (!response.ok) {
      throw new BffFetchError(
        describeInvalidBffBody(response.status, fallback, trimmed.slice(0, 160)),
        {
          status: response.status,
          url,
          rawSnippet: trimmed.slice(0, 400),
        },
      );
    }
    throw new BffFetchError(
      `${fallback} Réponse JSON inattendue (${response.status}).`,
      {
        status: response.status,
        url,
        rawSnippet: trimmed.slice(0, 400),
      },
    );
  }
}

export type FetchBffOptions = {
  fallback: string;
  mode?: ListFetchErrorMode;
};

export type FetchBffResult<T extends Record<string, unknown>> = {
  response: Response;
  body: T;
  treatedAsEmpty: boolean;
};

/**
 * GET BFF avec cookie de session, parse JSON sécurisé et validation `error`.
 * Lance {@link BffFetchError} avec un message lisible.
 */
export async function fetchBffJson<T extends Record<string, unknown>>(
  url: string,
  options: FetchBffOptions,
): Promise<FetchBffResult<T>> {
  const response = await fetch(url, {
    cache: "no-store",
    credentials: "include",
  });

  const body = (await parseBffJsonBody(
    response,
    url,
    options.fallback,
  )) as T;

  const errorField =
    typeof body.error === "string" ? body.error : null;
  const requestUrl =
    typeof body.requestUrl === "string" ? body.requestUrl : undefined;

  const check = assertBffFetchOk(
    response,
    errorField,
    options.fallback,
    options.mode ?? "empty-on-not-found",
  );

  if (!check.ok) {
    if (check.empty) {
      return { response, body, treatedAsEmpty: true };
    }
    throw new BffFetchError(
      toUserFacingApiError(check.message, {
        status: response.status,
        fallback: options.fallback,
      }),
      {
        status: response.status,
        url,
        requestUrl,
      },
    );
  }

  return { response, body, treatedAsEmpty: false };
}

/** @deprecated Préférer fetchBffJson — conservé pour compatibilité interne. */
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
