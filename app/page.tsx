import Link from "next/link";
import { AppLogo } from "@/components/layout/app-logo";
import { siteConfig } from "@/config/site.config";
import { ROUTES } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6">
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <AppLogo className="justify-center [&_img]:max-h-12 [&_img]:max-w-[15rem]" />
        </div>
        {/* <h1 className="text-3xl font-semibold tracking-tight">
          {siteConfig.name}
        </h1> */}
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          {siteConfig.description}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="default" asChild>
          <Link href={ROUTES.SIGN_IN}>Se connecter</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={ROUTES.DASHBOARD}>Tableau de bord</Link>
        </Button>
      </div>
    </div>
  );
}
