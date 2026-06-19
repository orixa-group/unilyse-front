import Image from "next/image";
import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils/cn";

type AppLogoProps = {
  className?: string;
  /** Réduit la hauteur max (ex. sidebar repliée) */
  compact?: boolean;
};

/**
 * `logo.svg` en thème clair, `logo-white.svg` en thème sombre.
 */
export function AppLogo({ className, compact }: AppLogoProps) {
  const alt = siteConfig.name;
  const width = compact ? 120 : 200;
  const height = compact ? 42 : 56;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-start",
        className,
      )}
    >
      <Image
        src="/images/logo.svg"
        alt={alt}
        width={width}
        height={height}
        unoptimized
        className={cn(
          compact ? "hidden" : "dark:hidden",
          "h-auto w-auto max-w-full object-contain object-left h-10",          
        )}
        priority
      />
      <Image
        src="/images/logo-white.svg"
        alt={alt}
        width={width}
        height={height}
        unoptimized
        className={cn(
          compact ? "hidden" : "dark:block",
          "hidden h-auto w-auto max-w-full object-contain object-left h-10",          
        )}
        priority
      />
      <Image
        src="/images/logo-compact.svg"
        alt={alt}
        width={width}
        height={height}
        unoptimized
        className={cn(
          "hidden h-auto w-auto max-w-full object-contain object-left h-6",
          compact ? "block" : "hidden",
        )}
        priority
      />
    </span>
  );
}
