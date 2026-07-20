"use client";

import { isBffFetchError } from "@/lib/api/bff-fetch";
import { toUserFacingApiError } from "@/lib/api/error-messages";

type BffErrorAlertProps = {
  error: unknown;
  fallback: string;
  title?: string;
};

export function BffErrorAlert({
  error,
  fallback,
  title = "Impossible de charger les données",
}: BffErrorAlertProps) {
  const message = toUserFacingApiError(
    error instanceof Error ? error.message : String(error),
    { fallback },
  );

  const bffError = isBffFetchError(error) ? error : null;

  return (
    <div
      className="border-destructive/40 bg-destructive/5 space-y-2 rounded-lg border p-4"
      role="alert"
    >
      <p className="text-destructive text-sm font-medium">{title}</p>
      <p className="text-destructive text-sm">{message}</p>
      {bffError ? (
        <dl className="text-muted-foreground space-y-1 text-xs">
          <div>
            <dt className="inline font-medium">Statut HTTP : </dt>
            <dd className="inline">{bffError.status}</dd>
          </div>
          {bffError.requestUrl ? (
            <div className="break-all">
              <dt className="inline font-medium">API Unilize : </dt>
              <dd className="inline">{bffError.requestUrl}</dd>
            </div>
          ) : null}
          <div className="break-all">
            <dt className="inline font-medium">Route BFF : </dt>
            <dd className="inline">{bffError.url}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
