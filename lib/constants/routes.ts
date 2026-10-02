export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  PERFORMANCES: "/performances",
  STRATEGY: "/strategie",
  STRATEGY_NETLINKING: "/strategie/netlinking",
  STRATEGY_CONTENT: "/strategie/contenu",
  TIMELINE: "/timeline",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
