/**
 * Logs requêtes pour comparer fetch ↔ affichage.
 *
 * Terminal `npm run dev` : [Unilize][server-upstream], [server-action], [bff]
 * Console navigateur (F12) : [Unilize][browser-bff], [Unilize][ui]
 *
 * Actif en dev ou si UNILIZE_DEBUG=1
 */

export type UnilizeLogLayer =
  | "server-upstream"
  | "server-action"
  | "bff"
  | "browser-bff"
  | "ui";

export type UnilizeLogPhase = "start" | "success" | "warn" | "error";

export function isUnilizeDebugEnabled(): boolean {
  if (process.env.UNILIZE_DEBUG === "1") {
    return true;
  }
  return process.env.NODE_ENV === "development";
}

function prefix(layer: UnilizeLogLayer): string {
  return `[Unilize][${layer}]`;
}

export function summarizeCampaigns(
  campaigns: Array<{ id: string; name: string }> | undefined,
): { count: number; ids: string[]; names: string[] } {
  const list = campaigns ?? [];
  return {
    count: list.length,
    ids: list.map((c) => c.id),
    names: list.map((c) => c.name),
  };
}

export function summarizeKeywords(keywords: string[] | undefined): {
  count: number;
  preview: string[];
} {
  const list = keywords ?? [];
  return {
    count: list.length,
    preview: list.slice(0, 5),
  };
}

export function summarizeUnilizePayload(
  payload: unknown,
): Record<string, unknown> {
  if (payload === null || payload === undefined) {
    return { empty: true };
  }

  if (Array.isArray(payload)) {
    return { type: "array", length: payload.length, items: payload.slice(0, 3) };
  }

  if (typeof payload !== "object") {
    return { type: typeof payload, value: payload };
  }

  const record = payload as Record<string, unknown>;
  const data = record.data;

  if (Array.isArray(data)) {
    return { envelope: "data[]", length: data.length, items: data.slice(0, 3) };
  }

  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.keywords)) {
      return {
        envelope: "projectDetail",
        id: d.id,
        name: d.name,
        keywords: summarizeKeywords(d.keywords as string[]),
      };
    }
    return { envelope: "data", keys: Object.keys(d), sample: d };
  }

  if (Array.isArray(record.projects)) {
    return {
      projects: (record.projects as Array<{ id: string; name: string }>).map(
        (p) => ({ id: p.id, name: p.name }),
      ),
      error: record.error ?? null,
    };
  }

  if (Array.isArray(record.campaigns)) {
    return {
      projectId: record.projectId,
      ...summarizeCampaigns(
        record.campaigns as Array<{ id: string; name: string }>,
      ),
      error: record.error ?? null,
    };
  }

  if (record.client && typeof record.client === "object") {
    const c = record.client as { id: string; name: string };
    return { client: { id: c.id, name: c.name }, error: record.error ?? null };
  }

  return { keys: Object.keys(record), sample: record };
}

export function logUnilizeEvent(
  layer: UnilizeLogLayer,
  phase: UnilizeLogPhase,
  label: string,
  details: Record<string, unknown> = {},
): void {
  if (!isUnilizeDebugEnabled()) {
    return;
  }

  const line = `${prefix(layer)} ${phase.toUpperCase()} ${label}`;
  const payload = Object.keys(details).length > 0 ? details : undefined;

  switch (phase) {
    case "error":
      console.error(line, payload);
      break;
    case "warn":
      console.warn(line, payload);
      break;
    default:
      console.log(line, payload);
  }
}

export function logUnilizeFetchSnapshot(params: {
  clientId: string | null;
  client: { id: string; name: string } | null;
  clientError: string | null;
  projects: Array<{ id: string; name: string }>;
  projectsError: string | null;
  perProject: Array<{
    projectId: string;
    projectName: string;
    queryIndex: number;
    keywords: {
      isFetched: boolean;
      isFetching: boolean;
      isError: boolean;
      errorMessage: string | null;
      data: ReturnType<typeof summarizeKeywords>;
    };
  }>;
}): void {
  if (!isUnilizeDebugEnabled()) {
    return;
  }

  console.groupCollapsed(
    `${prefix("browser-bff")} SNAPSHOT fetch client=${params.clientId ?? "—"}`,
  );
  console.log("client", { name: params.client?.name ?? null, error: params.clientError });
  console.log("projects", {
    count: params.projects.length,
    list: params.projects,
    error: params.projectsError,
  });
  console.table(
    params.perProject.map((row) => ({
      idx: row.queryIndex,
      project: row.projectName,
      motsClés: row.keywords.data.count,
      kFetch: row.keywords.isFetched ? "ok" : "…",
      kErr: row.keywords.isError ? row.keywords.errorMessage : "",
    })),
  );
  console.groupEnd();
}
