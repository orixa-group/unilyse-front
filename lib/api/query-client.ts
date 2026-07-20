import {
  MutationCache,
  QueryCache,
  QueryClient,
  type QueryClientConfig,
  type DefaultOptions,
} from "@tanstack/react-query";
import {
  isUnauthorizedError,
  redirectToSignIn,
} from "@/lib/auth/handle-unauthorized";

const defaultQueryOptions: DefaultOptions["queries"] = {
  staleTime: 60 * 1000,
  gcTime: 5 * 60 * 1000,
  retry: (failureCount, error) => {
    if (isUnauthorizedError(error)) {
      return false;
    }
    return failureCount < 2;
  },
  refetchOnWindowFocus: false,
};

const defaultMutationOptions: DefaultOptions["mutations"] = {
  retry: 0,
};

function handleGlobalAuthError(error: unknown) {
  if (isUnauthorizedError(error)) {
    redirectToSignIn();
  }
}

export function createQueryClient(
  overrides?: QueryClientConfig,
): QueryClient {
  return new QueryClient({
    ...overrides,
    queryCache: new QueryCache({
      onError: handleGlobalAuthError,
    }),
    mutationCache: new MutationCache({
      onError: handleGlobalAuthError,
    }),
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
