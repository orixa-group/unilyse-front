"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { WorkspaceContextBar } from "@/components/layout/workspace-context-bar";
import { MotionView } from "@/components/motion/motion-view";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background text-foreground flex h-dvh overflow-hidden">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <WorkspaceContextBar />
        <main className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
          <MotionView>{children}</MotionView>
        </main>
      </div>
    </div>
  );
}
