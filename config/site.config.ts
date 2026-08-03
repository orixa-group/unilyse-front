import { ROUTES } from "@/lib/constants/routes";
import type { ContextRequirement } from "@/types/workspace";

export type NavItem = {
  label: string;
  href: string;
  title: string;
  description: string;
  requiresContext: ContextRequirement;
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
          requiresContext: "project",
        },
        {
          label: "Stratégie",
          href: ROUTES.STRATEGY,
          title: "Stratégie",
          description:
            "Recommandations par mot-clé, leviers netlinking / contenu et opportunités.",
          requiresContext: "project",
        },
        {
          label: "Timeline",
          href: ROUTES.TIMELINE,
          title: "Timeline",
          description:
            "Évolution du trafic, des conversions, du CTR et des budgets sur la période.",
          requiresContext: "project",
        },
        {
          label: "Monitoring",
          href: ROUTES.MONITORING,
          title: "Monitoring",
          description:
            "Surveillance concurrentielle Google Ads : volume, annonceurs actifs et mots-clés à cibler.",
          requiresContext: "project",
        },
      ],
    },
  ] as const satisfies NavSection[],
} as const;

/** Meta pages hors nav principale (sous-routes Stratégie, etc.). */
const pageMetaExtras: NavItem[] = [
  {
    label: "Netlinking",
    href: ROUTES.STRATEGY_NETLINKING,
    title: "Netlinking",
    description: "Mots-clés à travailler via le netlinking — tableau complet.",
    requiresContext: "project",
  },
  {
    label: "Contenu",
    href: ROUTES.STRATEGY_CONTENT,
    title: "Contenu",
    description: "Mots-clés à travailler via le contenu — tableau complet.",
    requiresContext: "project",
  },
];

export const primaryNavItems = siteConfig.navSections[0]!.items;

export function findNavItemByHref(href: string): NavItem | undefined {
  const candidates: NavItem[] = [
    ...pageMetaExtras,
    ...siteConfig.navSections.flatMap((section) => [...section.items]),
  ];

  const matches = candidates.filter(
    (entry) => href === entry.href || href.startsWith(`${entry.href}/`),
  );
  if (matches.length === 0) {
    return undefined;
  }
  return matches.reduce((best, entry) =>
    entry.href.length > best.href.length ? entry : best,
  );
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
