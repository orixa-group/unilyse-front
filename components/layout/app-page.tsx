"use client";

import { usePathname } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { getPageMetaForPath } from "@/config/site.config";

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
  const meta = getPageMetaForPath(pathname);

  return (
    <PageShell
      title={meta.title}
      description={meta.description}
      requiresContext={meta.requiresContext}
      insights={insights}
      actions={actions}
    >
      {children}
    </PageShell>
  );
}
