"use client";

import { ContextGuard } from "@/components/layout/context-guard";
import { PageHeader } from "@/components/layout/page-header";
import type { ContextRequirement } from "@/types/workspace";

export function PageShell({
  title,
  description,
  actions,
  insights,
  requiresContext = "none",
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  insights?: React.ReactNode;
  requiresContext?: ContextRequirement;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      <PageHeader title={title} description={description} actions={actions} />
      <ContextGuard requiresContext={requiresContext}>
        {insights ? <div>{insights}</div> : null}
        {children}
      </ContextGuard>
    </div>
  );
}
