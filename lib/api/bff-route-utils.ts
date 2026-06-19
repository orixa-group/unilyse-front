import { NextResponse } from "next/server";
import { ApiClientError } from "@/lib/api/client";
import {
  isEmptyResourceApiError,
  toUserFacingApiError,
} from "@/lib/api/error-messages";

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Une erreur inattendue est survenue.";
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return error instanceof ApiClientError ? error.status : undefined;
}

export type BffRouteErrorOptions = {
  /** false pour les listes clients/projets — ne pas convertir une erreur SQL en liste vide. */
  treatNotFoundAsEmpty?: boolean;
};

/** Réponse 200 avec données vides quand le backend signale « aucune ligne » (sous-ressources uniquement). */
export function bffRouteErrorResponse<T extends Record<string, unknown>>(
  error: unknown,
  emptySuccessBody: T,
  errorBody: (message: string) => T & { error: string },
  options: BffRouteErrorOptions = {},
): NextResponse {
  const rawMessage = getApiErrorMessage(error);
  const status = getApiErrorStatus(error);
  const treatNotFoundAsEmpty = options.treatNotFoundAsEmpty ?? true;

  if (treatNotFoundAsEmpty && isEmptyResourceApiError(rawMessage, status)) {
    return NextResponse.json({ ...emptySuccessBody, error: null });
  }

  const message = toUserFacingApiError(rawMessage, {
    status,
    fallback: "Impossible de charger les données.",
  });

  return NextResponse.json(errorBody(message), { status: 502 });
}
