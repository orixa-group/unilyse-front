import { getAuthTokenFromBridge } from "@/lib/auth/auth-token-bridge";
import { UNILIZE_API_PROXY_PREFIX } from "@/lib/constants/api-endpoints";
import { resolveUnilizeServerBaseUrl } from "@/lib/api/resolve-server-api-url";
import { toUserFacingApiError } from "@/lib/api/error-messages";
import {
  logUnilizeEvent,
  summarizeUnilizePayload,
} from "@/lib/unilize/request-log";

function resolveApiBaseUrl(): string {
  const isBrowser = typeof window !== "undefined";

  if (isBrowser) {
    return UNILIZE_API_PROXY_PREFIX;
  }

  return resolveUnilizeServerBaseUrl();
}

export type ApiClientOptions = Omit<RequestInit, "body"> & {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  /** Token Bearer explicite (serveur uniquement). */
  authToken?: string;
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    payload?: { code?: string; details?: Record<string, unknown> },
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = payload?.code;
    this.details = payload?.details;
  }
}

export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl ?? resolveApiBaseUrl()).replace(/\/$/, "");
  }

  private buildUrl(path: string, query?: ApiClientOptions["query"]): string {
    const target = path.startsWith("http")
      ? path
      : `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

    if (!query) {
      return target;
    }

    const url = target.startsWith("http")
      ? new URL(target)
      : new URL(
          target,
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost",
        );

    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
    return url.toString();
  }

  async request<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
    const { query, body, headers, authToken: explicitAuthToken, ...rest } = options;
    const url = this.buildUrl(path, query);
    const method = (rest.method ?? "GET").toUpperCase();
    const isServer = typeof window === "undefined";
    const startedAt = Date.now();

    if (isServer) {
      logUnilizeEvent("server-upstream", "start", `${method} ${path}`, { url });
    }

    const mergedHeaders = new Headers(headers);
    if (!mergedHeaders.has("Content-Type") && body !== undefined) {
      mergedHeaders.set("Content-Type", "application/json");
    }

    let authToken = explicitAuthToken ?? null;
    if (!authToken && isServer) {
      authToken = getAuthTokenFromBridge();
    }
    if (authToken && !mergedHeaders.has("Authorization")) {
      mergedHeaders.set("Authorization", `Bearer ${authToken}`);
    }

    const response = await fetch(url, {
      ...rest,
      headers: mergedHeaders,
      body:
        body === undefined
          ? undefined
          : typeof body === "string"
            ? body
            : JSON.stringify(body),
      credentials: "include",
    });

    if (response.status === 401) {
      throw new ApiClientError("Non authentifié", 401);
    }
    if (response.status === 403) {
      throw new ApiClientError("Accès refusé", 403);
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const hasBody =
      response.status !== 204 &&
      response.status !== 205 &&
      response.headers.get("content-length") !== "0";
    const payload =
      !hasBody
        ? null
        : isJson
          ? ((await response.json()) as unknown)
          : ((await response.text()) as unknown);

    if (!response.ok) {
      const errPayload =
        isJson && payload && typeof payload === "object" && payload !== null
          ? (payload as {
              message?: string;
              error?: { message?: string };
              code?: string;
              details?: Record<string, unknown>;
            })
          : undefined;
      const rawMessage =
        errPayload?.error?.message ??
        errPayload?.message ??
        (typeof payload === "string" ? payload : response.statusText);
      const message = toUserFacingApiError(rawMessage, {
        status: response.status,
        fallback: "Erreur API",
      });
      if (isServer) {
        logUnilizeEvent("server-upstream", "error", `${method} ${path}`, {
          url,
          status: response.status,
          durationMs: Date.now() - startedAt,
          message,
          body: summarizeUnilizePayload(payload),
        });
      }
      throw new ApiClientError(message || "Erreur API", response.status, {
        code: errPayload?.code,
        details: errPayload?.details,
      });
    }

    if (payload === null) {
      if (isServer) {
        logUnilizeEvent("server-upstream", "success", `${method} ${path}`, {
          url,
          status: response.status,
          durationMs: Date.now() - startedAt,
          empty: true,
        });
      }
      return undefined as T;
    }

    if (isServer) {
      logUnilizeEvent("server-upstream", "success", `${method} ${path}`, {
        url,
        status: response.status,
        durationMs: Date.now() - startedAt,
        body: summarizeUnilizePayload(payload),
      });
    }
    return payload as T;
  }

  get<T>(path: string, options?: Omit<ApiClientOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, options?: Omit<ApiClientOptions, "method">) {
    return this.request<T>(path, { ...options, method: "POST" });
  }

  put<T>(path: string, options?: Omit<ApiClientOptions, "method">) {
    return this.request<T>(path, { ...options, method: "PUT" });
  }

  patch<T>(path: string, options?: Omit<ApiClientOptions, "method">) {
    return this.request<T>(path, { ...options, method: "PATCH" });
  }

  delete<T>(path: string, options?: Omit<ApiClientOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
