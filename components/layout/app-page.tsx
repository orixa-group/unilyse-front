"use client";

import { usePathname } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import {
  getLensDescription,
  getPageMetaForPath,
} from "@/config/site.config";
import { ROUTES } from "@/lib/constants/routes";
import { useSelectionStore } from "@/stores/selection.store";

export function AppPage({
  children,
  insights,
  actions,
}: {
  children: React.ReactNode;
  insights?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();
  const analysisLens = useSelectionStore((s) => s.analysisLens);
  const meta = getPageMetaForPath(pathname);
  const description =
    pathname === ROUTES.STRATEGY || pathname.startsWith(`${ROUTES.STRATEGY}/`)
      ? getLensDescription(pathname, analysisLens)
      : meta.description;

  return (
    <PageShell
      title={meta.title}
      description={description}
      requiresContext={meta.requiresContext}
      insights={insights}
      actions={actions}
    >
      {children}
    </PageShell>
  );
}
