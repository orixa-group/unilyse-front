"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { fetchBffJson } from "@/lib/api/bff-fetch";
import { unilizeKeys } from "@/lib/api/unilize";
import {
  SYNC_PROBE_INTERVAL_MS,
  SYNC_PROBE_TIMEOUT_MS,
  isRecentProject,
} from "@/lib/projects/project-readiness";
import { logUnilizeEvent, summarizeUnilizePayload } from "@/lib/unilize/request-log";
import type { ListPerformancesResult } from "@/types/performance";
import type { UnilizeProject } from "@/types/unilize";

export interface ProjectSyncProbeTarget {
  project: UnilizeProject;
  setupComplete: boolean;
}

export interface ProjectSyncProbeResult {
  hasPerformances: boolean;
  timedOut: boolean;
  isProbing: boolean;
}

async function fetchPerformancesProbe(
  projectId: string,
): Promise<ListPerformancesResult> {
  const url = `/api/bff/projects/${encodeURIComponent(projectId)}/performances`;
  const startedAt = Date.now();
  logUnilizeEvent("browser-bff", "start", "GET performances (sync probe)", {
    projectId,
    url,
  });

  const { body, treatedAsEmpty } = await fetchBffJson<ListPerformancesResult>(
    url,
    {
      fallback: "Impossible de charger les performances.",
      mode: "empty-on-not-found",
    },
  );

  const result: ListPerformancesResult = {
    requestUrl: body.requestUrl ?? "",
    projectId: body.projectId ?? projectId,
    performances: Array.isArray(body.performances) ? body.performances : [],
    error: null,
  };

  if (treatedAsEmpty) {
    logUnilizeEvent("browser-bff", "success", "GET performances probe (vide)", {
      projectId,
      durationMs: Date.now() - startedAt,
      response: summarizeUnilizePayload(result),
    });
    return result;
  }

  logUnilizeEvent("browser-bff", "success", "GET performances probe", {
    projectId,
    durationMs: Date.now() - startedAt,
    count: result.performances.length,
  });
  return result;
}

function isProbeEligible(target: ProjectSyncProbeTarget): boolean {
  return target.setupComplete && isRecentProject(target.project);
}

/**
 * Sonde légère des performances pour les projets récents configurés (dashboard).
 * Polling borné à {@link SYNC_PROBE_TIMEOUT_MS} après activation par projet.
 */
export function useProjectsSyncProbe(targets: ProjectSyncProbeTarget[]) {
  const probeStartedAtRef = useRef<Map<string, number>>(new Map());
  const [timedOutProjectIds, setTimedOutProjectIds] = useState<Set<string>>(
    () => new Set(),
  );

  const eligibleTargets = useMemo(
    () => targets.filter(isProbeEligible),
    [targets],
  );

  useEffect(() => {
    const now = Date.now();
    for (const target of eligibleTargets) {
      if (!probeStartedAtRef.current.has(target.project.id)) {
        probeStartedAtRef.current.set(target.project.id, now);
      }
    }
  }, [eligibleTargets]);

  useEffect(() => {
    if (eligibleTargets.length === 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      setTimedOutProjectIds((previous) => {
        let changed = false;
        const next = new Set(previous);

        for (const target of eligibleTargets) {
          if (next.has(target.project.id)) {
            continue;
          }
          const startedAt =
            probeStartedAtRef.current.get(target.project.id) ?? now;
          if (now - startedAt >= SYNC_PROBE_TIMEOUT_MS) {
            next.add(target.project.id);
            changed = true;
          }
        }

        return changed ? next : previous;
      });
    }, 5_000);

    return () => window.clearInterval(intervalId);
  }, [eligibleTargets]);

  const queries = useQueries({
    queries: eligibleTargets.map((target) => {
      const projectId = target.project.id;
      const timedOut = timedOutProjectIds.has(projectId);

      return {
        queryKey: [...unilizeKeys.performances(projectId), "sync-probe"],
        queryFn: () => fetchPerformancesProbe(projectId),
        enabled: !timedOut,
        refetchInterval: (query: {
          state: { data?: ListPerformancesResult };
        }) => {
          if (timedOut) {
            return false;
          }
          if ((query.state.data?.performances.length ?? 0) > 0) {
            return false;
          }
          return SYNC_PROBE_INTERVAL_MS;
        },
        staleTime: 0,
      };
    }),
  });

  const resultsByProjectId = useMemo(() => {
    const map = new Map<string, ProjectSyncProbeResult>();

    for (const target of targets) {
      map.set(target.project.id, {
        hasPerformances: false,
        timedOut: timedOutProjectIds.has(target.project.id),
        isProbing: false,
      });
    }

    eligibleTargets.forEach((target, index) => {
      const query = queries[index];
      const performances = query?.data?.performances ?? [];
      const hasPerformances = performances.length > 0;
      const timedOut = timedOutProjectIds.has(target.project.id);
      const isProbing =
        isProbeEligible(target) &&
        !timedOut &&
        !hasPerformances &&
        (query?.isFetching ?? false);

      map.set(target.project.id, {
        hasPerformances,
        timedOut,
        isProbing,
      });
    });

    return map;
  }, [targets, eligibleTargets, queries, timedOutProjectIds]);

  return resultsByProjectId;
}
