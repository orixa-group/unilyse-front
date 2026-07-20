import "server-only";

import { AsyncLocalStorage } from "async_hooks";

type AuthContext = {
  token: string;
};

const authStorage = new AsyncLocalStorage<AuthContext>();

export function runWithAuthToken<T>(token: string | null, fn: () => T): T {
  if (!token) return fn();
  return authStorage.run({ token }, fn);
}

export function getRequestAuthToken(): string | null {
  return authStorage.getStore()?.token ?? null;
}
