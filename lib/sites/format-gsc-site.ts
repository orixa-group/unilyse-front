import type { UnilizeGscPermissionLevel } from "@/types/sites";

const PERMISSION_LABELS: Record<string, string> = {
  siteOwner: "Propriétaire",
  siteFullUser: "Accès complet",
  siteRestrictedUser: "Accès restreint",
  siteUnverifiedUser: "Non vérifié",
};

export function formatGscPermissionLevel(
  level: UnilizeGscPermissionLevel | null | undefined,
): string {
  if (!level) {
    return "—";
  }
  return PERMISSION_LABELS[level] ?? level;
}

export function formatGscSiteOptionLabel(site: {
  url: string;
  domain: string;
  permission_level: UnilizeGscPermissionLevel;
}): string {
  return `${site.url} (${site.domain}) — ${formatGscPermissionLevel(site.permission_level)}`;
}
