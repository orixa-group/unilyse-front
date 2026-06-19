"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { siteConfig, primaryNavItems } from "@/config/site.config";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, configured, signOut } = useAuth();

  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href={ROUTES.DASHBOARD} className="font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {primaryNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button type="button" variant="outline" size="sm" onClick={() => void signOut()}>
              Déconnexion
            </Button>
          ) : configured ? (
            <Link
              href={ROUTES.SIGN_IN}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Connexion
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
