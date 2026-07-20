let tokenGetter: (() => string | null) | undefined;

export function setAuthTokenGetter(getter: () => string | null): void {
  tokenGetter = getter;
}

export function getAuthTokenFromBridge(): string | null {
  if (typeof window !== "undefined") return null;
  return tokenGetter?.() ?? null;
}
