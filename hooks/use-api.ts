"use client";

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

export function useApi<TQueryFnData, TError = Error>(
  options: Omit<
    UseQueryOptions<TQueryFnData, TError, TQueryFnData, readonly unknown[]>,
    "queryKey"
  > & { queryKey: readonly unknown[] },
): UseQueryResult<TQueryFnData, TError> {
  return useQuery<TQueryFnData, TError>(options);
}
