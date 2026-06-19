import { isRetryableUpstreamError } from "@/lib/api/retryable-error";

/** Exécute des tâches async avec une limite de concurrence (évite le rate-limit API). */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex]!, currentIndex);
    }
  }

  const workerCount = Math.min(Math.max(1, limit), items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

/** Réessaie les appels réseau instables (F5 = rafale de requêtes). */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: { attempts?: number; baseDelayMs?: number },
): Promise<T> {
  const attempts = options?.attempts ?? 3;
  const baseDelayMs = options?.baseDelayMs ?? 150;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const canRetry =
        attempt < attempts - 1 && isRetryableUpstreamError(error);
      if (!canRetry) {
        throw error;
      }
      await new Promise((resolve) => {
        setTimeout(resolve, baseDelayMs * (attempt + 1));
      });
    }
  }

  throw lastError;
}
