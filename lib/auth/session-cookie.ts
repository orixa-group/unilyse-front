export const SESSION_COOKIE_NAME = "unilyse_session";

/** Durée légèrement inférieure à l’expiration Firebase (~1 h). */
export const SESSION_COOKIE_MAX_AGE_SECONDS = 55 * 60;

export function isValidSessionToken(value: string | undefined | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
