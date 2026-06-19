import { ROUTES } from "@/lib/constants/routes";
import type { AnalysisLens, ContextRequirement } from "@/types/workspace";

export type NavItem = {
  label: string;
  href: string;
  title: string;
  description: string;
  lensHints?: Record<AnalysisLens, string>;
  requiresContext: ContextRequirement;
  lensAffinity?: AnalysisLens[];
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const siteConfig = {
  name: "Unilyse",
  description:
    "Analyse performance, stratégie et monitoring de vos campagnes",
  navSections: [
    {
      label: "Pilotage",
      items: [
        {
          label: "Vue d'ensemble",
          href: ROUTES.DASHBOARD,
          title: "Vue d'ensemble",
          description:
            "Configurez vos projets, campagnes et mots-clés. Visualisez la santé globale du compte.",
          requiresContext: "client",
        },
        {
          label: "Performances",
          href: ROUTES.PERFORMANCES,
          title: "Performances",
          description:
            "Métriques Google Ads par mot-clé : impressions, dépenses, ROAS et potentiel budgétaire.",
          requiresContext: "project-campaign",
        },
        {
          label: "Stratégie",
          href: ROUTES.STRATEGY,
          title: "Stratégie",
          description:
            "Recommandations SEO / SEA, écarts et opportunités par mot-clé.",
          lensHints: {
            sea: "Parts d'impressions perdues et indicateurs qualité annonce.",
            seo: "Gaps sémantiques, netlinking, matrice d'opportunités et BAS.",
          },
          requiresContext: "project-campaign",
          lensAffinity: ["sea", "seo"],
        },
        {
          label: "Monitoring",
          href: ROUTES.MONITORING,
          title: "Monitoring",
          description:
            "Surveillance concurrentielle Google Ads : volume, annonceurs actifs et mots-clés à cibler.",
          requiresContext: "project-campaign",
        },
      ],
    },
  ] as const satisfies NavSection[],
} as const;

export const primaryNavItems = siteConfig.navSections[0]!.items;

export function findNavItemByHref(href: string): NavItem | undefined {
  for (const section of siteConfig.navSections) {
    const item = section.items.find(
      (entry) => href === entry.href || href.startsWith(`${entry.href}/`),
    );
    if (item) {
      return item;
    }
  }
  return undefined;
}

export function getPageMetaForPath(pathname: string): {
  title: string;
  description: string;
  requiresContext: ContextRequirement;
} {
  const item = findNavItemByHref(pathname);
  if (!item) {
    return {
      title: siteConfig.name,
      description: siteConfig.description,
      requiresContext: "none",
    };
  }
  return {
    title: item.title,
    description: item.description,
    requiresContext: item.requiresContext,
  };
}

export function getLensDescription(
  pathname: string,
  lens: AnalysisLens,
): string {
  const item = findNavItemByHref(pathname);
  return item?.lensHints?.[lens] ?? item?.description ?? siteConfig.description;
}
