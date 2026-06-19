"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ChartBarLineIcon,
  DashboardCircleIcon,
  GridViewIcon,
  Logout02Icon,
  Login01Icon,
  Radar01Icon,
  Target01Icon,
} from "@hugeicons/core-free-icons";
import { AppLogo } from "@/components/layout/app-logo";
import { siteConfig } from "@/config/site.config";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

function navIcon(href: string) {
  if (href === ROUTES.DASHBOARD) return GridViewIcon;
  if (href === ROUTES.PERFORMANCES) return ChartBarLineIcon;
  if (href === ROUTES.STRATEGY) return Target01Icon;
  if (href === ROUTES.MONITORING) return Radar01Icon;
  return DashboardCircleIcon;
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, configured, signOut, loading: authLoading } = useAuth();

  return (
    <aside
      className={cn(
        "border-border bg-muted/20 flex h-full shrink-0 flex-col border-r transition-[width] duration-200 ease-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "border-border flex shrink-0 items-center gap-2 border-b p-2",
          collapsed ? "flex-col" : "justify-between",
        )}
      >
        <Link
          href={ROUTES.DASHBOARD}
          className={cn(
            "text-foreground hover:bg-background/80 flex min-w-0 items-center gap-2 rounded-md p-1.5 transition-colors",
            collapsed ? "justify-center" : "justify-start",
          )}
          title={siteConfig.name}
        >
          <AppLogo compact={collapsed} />
        </Link>
        <div
          className={cn(
            "flex items-center gap-1",
            collapsed && "flex-col",
          )}
        >
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label={collapsed ? "Étendre le menu" : "Réduire le menu"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
          >
            <HugeiconsIcon
              icon={collapsed ? ArrowRight01Icon : ArrowLeft01Icon}
              size={20}
              color="currentColor"
              strokeWidth={1.5}
            />
          </Button>
        </div>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-2">
        {siteConfig.navSections.map((section) => (
          <div key={section.label} className="space-y-1">
            {!collapsed ? (
              <p className="text-muted-foreground px-2 pb-1 text-xs font-medium tracking-wide uppercase">
                {section.label}
              </p>
            ) : null}
            {section.items.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
              const Icon = navIcon(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                    active
                      ? "bg-background text-foreground border shadow-sm"
                      : "text-muted-foreground hover:bg-background/80 hover:text-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center">
                    <HugeiconsIcon
                      icon={Icon}
                      size={20}
                      color="currentColor"
                      strokeWidth={1.5}
                    />
                  </span>
                  {!collapsed ? (
                    <span className="flex min-w-0 flex-1 flex-col truncate">
                      <span className="flex items-center gap-2 truncate">
                        <span className="truncate">{item.label}</span>
                      </span>
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-border mt-auto shrink-0 border-t p-2">
        {user ? (
          <div className={cn("space-y-2", collapsed && "flex flex-col items-center")}>
            {!collapsed ? (
              <p className="text-muted-foreground truncate px-1 text-xs">
                {user.email ?? user.displayName ?? "Compte connecté"}
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className={cn("w-full", collapsed && "px-0")}
              aria-label="Déconnexion"
              title="Déconnexion"
              disabled={authLoading}
              onClick={() => void signOut()}
            >
              {collapsed ? (
                <HugeiconsIcon
                  icon={Logout02Icon}
                  size={20}
                  color="currentColor"
                  strokeWidth={1.5}
                />
              ) : (
                "Déconnexion"
              )}
            </Button>
          </div>
        ) : configured ? (
          <Button
            variant="outline"
            className={cn("w-full", collapsed && "px-0")}
            asChild
            title="Connexion"
          >
            <Link href={ROUTES.SIGN_IN} aria-label="Connexion">
              {collapsed ? (
                <HugeiconsIcon
                  icon={Login01Icon}
                  size={20}
                  color="currentColor"
                  strokeWidth={1.5}
                />
              ) : (
                "Connexion"
              )}
            </Link>
          </Button>
        ) : null}
      </div>
    </aside>
  );
}
