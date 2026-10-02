/** Compte Google Ads (OpenAPI GET /google-ads/accounts). */
export interface UnilizeGoogleAdsAccount {
  id: string;
  name: string;
  status: string;
}

export type ListGoogleAdsAccountsResult = {
  requestUrl: string;
  accounts: UnilizeGoogleAdsAccount[];
  error: string | null;
};
