export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  PERFORMANCES: "/performances",
  STRATEGY: "/strategie",
  MONITORING: "/monitoring",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
