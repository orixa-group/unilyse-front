import type { UseQueryResult } from "@tanstack/react-query";

/** True uniquement avant le premier succès (garde le cache visible pendant un refetch). */
export function isQueryInitialLoading(
  query: Pick<UseQueryResult<unknown, Error>, "isFetched" | "fetchStatus"> | undefined,
): boolean {
  if (!query) {
    return true;
  }
  return !query.isFetched && query.fetchStatus !== "idle";
}
