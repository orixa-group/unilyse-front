"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BffFetchError, parseBffJsonBody } from "@/lib/api/bff-fetch";
import { toUserFacingApiError } from "@/lib/api/error-messages";
import { unilizeKeys } from "@/lib/api/unilize";
import { logUnilizeEvent } from "@/lib/unilize/request-log";

async function postRefresh(
  projectId: string,
  keywords?: string[],
): Promise<void> {
  const urlObj = new URL(
    `/api/bff/projects/${encodeURIComponent(projectId)}/refresh`,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  for (const keyword of keywords ?? []) {
    urlObj.searchParams.append("keyword", keyword);
  }
  const url = `${urlObj.pathname}${urlObj.search}`;
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "POST refresh", { projectId, url });

  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
  });

  if (response.status === 204) {
    logUnilizeEvent("browser-bff", "success", "POST refresh", {
      projectId,
      durationMs: Date.now() - startedAt,
    });
    return;
  }

  const body = await parseBffJsonBody(
    response,
    url,
    "Impossible de rafraîchir les métriques SEO.",
  );

  if (!response.ok) {
    const message = toUserFacingApiError(
      typeof body.error === "string"
        ? body.error
        : typeof body.message === "string"
          ? body.message
          : undefined,
      {
        status: response.status,
        fallback: "Impossible de rafraîchir les métriques SEO.",
      },
    );
    throw new BffFetchError(message, {
      status: response.status,
      url,
      requestUrl:
        typeof body.requestUrl === "string" ? body.requestUrl : undefined,
    });
  }
}

export function useRefreshProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      keywords,
    }: {
      projectId: string;
      keywords?: string[];
    }) => postRefresh(projectId, keywords),
    onSuccess: (_data, variables) => {
      const { projectId } = variables;
      void queryClient.invalidateQueries({
        queryKey: [...unilizeKeys.all, "performances", projectId],
      });
      void queryClient.invalidateQueries({
        queryKey: [...unilizeKeys.all, "strategy", projectId],
      });
      void queryClient.invalidateQueries({
        queryKey: [...unilizeKeys.all, "timeline", projectId],
      });
      void queryClient.invalidateQueries({
        queryKey: [...unilizeKeys.all, "timeline-traffic", projectId],
      });
      void queryClient.invalidateQueries({
        queryKey: [...unilizeKeys.all, "timeline-ctr-budget", projectId],
      });
    },
  });
}
