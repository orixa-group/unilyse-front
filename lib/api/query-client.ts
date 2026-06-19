import {
  QueryClient,
  type QueryClientConfig,
  type DefaultOptions,
} from "@tanstack/react-query";

const defaultQueryOptions: DefaultOptions["queries"] = {
  staleTime: 60 * 1000,
  gcTime: 5 * 60 * 1000,
  retry: (failureCount, error) => {
    if (error instanceof Error && error.message.includes("401")) {
      return false;
    }
    return failureCount < 2;
  },
  refetchOnWindowFocus: false,
};

const defaultMutationOptions: DefaultOptions["mutations"] = {
  retry: 0,
};

export function createQueryClient(
  overrides?: QueryClientConfig,
): QueryClient {
  return new QueryClient({
    ...overrides,
    defaultOptions: {
      ...overrides?.defaultOptions,
      queries: {
        ...defaultQueryOptions,
        ...overrides?.defaultOptions?.queries,
      },
      mutations: {
        ...defaultMutationOptions,
        ...overrides?.defaultOptions?.mutations,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return createQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  return browserQueryClient;
}
