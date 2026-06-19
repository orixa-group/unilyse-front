import { siteConfig } from "@/config/site.config";

export function Footer() {
  return (
    <footer className="text-muted-foreground border-t py-4 text-center text-xs">
      {siteConfig.name} — {new Date().getFullYear()}
    </footer>
  );
}
