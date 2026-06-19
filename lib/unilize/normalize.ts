import type { ListProjectsActionResult } from "@/app/(auth)/actions/unilize-action-state";
import type { UnilizeProject } from "@/types/unilize";

/** Normalise les données cache TanStack Query (ancien ou nouveau format). */
export function normalizeProjectsFromQuery(
  data: ListProjectsActionResult | UnilizeProject[] | undefined,
): UnilizeProject[] {
  if (!data) {
    return [];
  }
  if (Array.isArray(data)) {
    return data;
  }
  return Array.isArray(data.projects) ? data.projects : [];
}
