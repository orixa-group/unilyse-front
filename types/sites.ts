/** Site Google Search Console (OpenAPI GET /sites). */
export type UnilizeGscPermissionLevel =
  | "siteOwner"
  | "siteFullUser"
  | "siteRestrictedUser"
  | "siteUnverifiedUser"
  | string;

export interface UnilizeSearchConsoleSite {
  url: string;
  domain: string;
  permission_level: UnilizeGscPermissionLevel;
}

export type ListSitesResult = {
  requestUrl: string;
  sites: UnilizeSearchConsoleSite[];
  error: string | null;
};
