"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";
  const icon = mounted && isDark ? Sun02Icon : Moon02Icon;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Basculer le thème"
      onClick={() => setTheme(mounted && isDark ? "light" : "dark")}
      disabled={!mounted}
    >
      <HugeiconsIcon
        icon={icon}
        size={18}
        color="currentColor"
        strokeWidth={1.5}
      />
    </Button>
  );
}
